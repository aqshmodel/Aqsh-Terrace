<?php
// app/Http/Middleware/EnsureFrontendRequestsAreStatefulCustom.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Encryption\Encrypter;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Cookie\CookieValuePrefix;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Response;

class EnsureFrontendRequestsAreStatefulCustom // extends は不要
{
    /**
     * The application instance.
     *
     * @var \Illuminate\Contracts\Foundation\Application
     */
    protected $app;

    /**
     * Create a new middleware instance.
     *
     * @param  \Illuminate\Contracts\Foundation\Application  $app
     * @return void
     */
    public function __construct(Application $app)
    {
        $this->app = $app;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $this->configureSecureCookieSessions();

        return $this->addCookieToResponse($request, $next($request));
    }

    /**
     * Configure secure cookie sessions.
     *
     * @return void
     */
    protected function configureSecureCookieSessions()
    {
        $this->app['config']->set([
            'session.http_only' => true,
            'session.same_site' => 'lax',
        ]);
    }

    /**
     * Add the CSRF cookie to the response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Symfony\Component\HttpFoundation\Response  $response
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function addCookieToResponse(Request $request, Response $response)
    {
        $config = config('sanctum');

        if ($response instanceof Response && ! is_null($config['stateful'])) {
            $cookie = new Cookie(
                'XSRF-TOKEN',
                $request->session()->token(),
                $this->availableAt(60 * ($config['expiration'] ?? config('session.lifetime', 120))), // Changed in Laravel 10.x
                $config['path'] ?? config('session.path', '/'), // Changed in Laravel 10.x
                $config['domain'] ?? config('session.domain'),
                $config['secure'] ?? config('session.secure'),
                false,
                false,
                $config['same_site'] ?? config('session.same_site', 'lax')
            );

            // EncryptCookies ミドルウェアが有効な場合は、Cookie 値を暗号化するロジックが必要になる場合がある
            // (通常は自動で処理されるか、EncryptCookies の $except に 'XSRF-TOKEN' を追加する)
            // if (EncryptCookies::isDisabled('XSRF-TOKEN')) {
                 $response->headers->setCookie($cookie);
            // } else {
            //     $response->headers->setCookie($this->encryptCookie($cookie));
            // }
        }

        // ★★★ 変更点: レスポンスを 200 OK と空の JSON にする ★★★
        // 元のコードでは、ここで $response をそのまま return していた
        if ($response->getStatusCode() === 204 && Str::endsWith($request->getRequestUri(), '/sanctum/csrf-cookie')) {
            // 元のレスポンスヘッダーを維持しつつ、ステータスとボディを変更
            return response()->json([], 200)->withHeaders($response->headers->all());
        }

        return $response;
    }

    /**
     * Get the UNIX timestamp indicating when the cookie should become available.
     *
     * @param  int  $delay
     * @return int
     */
    protected function availableAt(int $delay = 0) : int
    {
        return now()->addSeconds($delay)->getTimestamp();
    }

    /**
     * Encrypt the given cookie and return the encrypted version.
     * Copy from EncryptCookies middleware logic if needed
     *
     * @param \Symfony\Component\HttpFoundation\Cookie $cookie
     * @return \Symfony\Component\HttpFoundation\Cookie
     */
    // protected function encryptCookie(Cookie $cookie)
    // {
    //     $encrypter = $this->app->make(Encrypter::class);
    //     $value = $encrypter->encrypt(CookieValuePrefix::create($cookie->getName(), $encrypter->getKey()).$cookie->getValue(), false);

    //     return new Cookie(
    //         $cookie->getName(), $value, $cookie->getExpiresTime(), $cookie->getPath(), $cookie->getDomain(),
    //         $cookie->isSecure(), $cookie->isHttpOnly(), $cookie->isRaw(), $cookie->getSameSite()
    //     );
    // }
}