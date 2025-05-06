<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests; // ← これがあるか？
use Illuminate\Foundation\Validation\ValidatesRequests; // ← これは通常ある
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests; // ← ここで use されているか？
}