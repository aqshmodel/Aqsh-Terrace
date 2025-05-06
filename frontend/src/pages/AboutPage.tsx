// src/pages/AboutPage.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // ★ インポートを修正
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Users, MessageSquareText, UserCircle, Share2, Lightbulb, Rocket, Cpu, Layers, Palette,
    ThumbsUp, MessageCircle, Zap, Sparkles, ArrowRight, Mail, Github, Twitter, Check, Bell
} from 'lucide-react'; // アイコンを豊富に活用
import useAuthStore from '@/stores/authStore'; // ★ useAuthStore をインポート

const FeatureCard = ({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
}) => (
    <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
    </div>
);

const TechStackItem = ({ icon: Icon, name, category }: { icon: React.ElementType, name: string, category?: string }) => (
    <div className="flex items-center space-x-3 rounded-md border p-3 bg-background hover:bg-muted/50 transition-colors">
        <Icon className="h-6 w-6 text-muted-foreground" />
        <div>
            <p className="text-sm font-medium leading-none">{name}</p>
            {category && <p className="text-xs text-muted-foreground">{category}</p>}
        </div>
    </div>
);


function AboutPage() {
  useDocumentTitle('Aqsh Terrace | このプラットフォームについて');
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn); // ★ ログイン状態を取得

  return (
    <div className="space-y-12 md:space-y-16">
      {/* --- 1. ヒーローセクション --- */}
      <section className="text-center py-12 md:py-16 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Aqsh Terrace
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            — あなたのアイデアと情熱が集う、次世代コミュニティハブ —
          </p>
          {/* ★ ログイン状態に応じてボタン表示を切り替え */}
          {!isLoggedIn && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button size="lg" asChild>
                <Link to="/register">アカウント作成</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">ログインする</Link>
              </Button>
            </div>
          )}
           {/* ★ ログイン済みの場合はホームページへのボタンなどを表示 (任意) */}
           {isLoggedIn && (
                <Button size="lg" asChild>
                    <Link to="/">ホームに戻る</Link>
                </Button>
           )}
        </div>
      </section>

      {/* --- 2. Aqsh Terrace とは？ --- */}
      <section className="container mx-auto px-4 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">Aqsh Terrace とは？</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Aqsh Terrace (アクシュ・テラス) は、多様な興味や専門性を持つ人々が繋がり、知識を共有し、共に創造するためのオープンプラットフォームです。
            私たちは、個々の才能が輝き、新しい価値が生まれる「テラス」のような場を提供することを目指しています。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="p-2 bg-primary/10 rounded-md w-fit mb-2">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">繋がる</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                共通の趣味、専門分野、プロジェクトなど、様々な切り口で新しい仲間や協力者と出会えます。
              </p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="p-2 bg-primary/10 rounded-md w-fit mb-2">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">共有する</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                あなたの知識、経験、アイデア、作品を発信し、他者からのフィードバックや共感を得られます。
              </p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="p-2 bg-primary/10 rounded-md w-fit mb-2">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">創造する</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                刺激的な議論やコラボレーションを通じて、新しいプロジェクトやイノベーションを生み出すきっかけを見つけましょう。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-12 md:my-16" />

      {/* --- 3. 主な機能紹介 --- */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl font-semibold tracking-tight">プラットフォームの主な機能</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            快適なコミュニケーションとコミュニティ活動をサポートする機能を提供します。
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard
            icon={MessageSquareText}
            title="投稿とディスカッション"
            description="テキストベースの投稿で情報を発信し、コメント機能を通じて活発な議論を行えます。"
          />
          <FeatureCard
            icon={UserCircle}
            title="充実したプロフィール"
            description="スキル、経験、ポートフォリオを詳細に登録し、あなたの専門性をアピールできます。"
          />
          <FeatureCard
            icon={Users}
            title="ユーザー検索とフォロー"
            description="興味のあるユーザーを見つけてフォローし、ネットワークを広げられます。"
          />
          <FeatureCard
            icon={ThumbsUp}
            title="いいね機能"
            description="共感した投稿やコメントに「いいね」でリアクションし、ポジティブなフィードバックを送れます。"
          />
          <FeatureCard
            icon={Bell}
            title="リアルタイム通知"
            description="あなたに関連するアクション（コメント、いいね、フォローなど）をリアルタイムでお知らせします。"
          />
          <FeatureCard
            icon={Share2}
            title="コミュニティ形成支援"
            description="（将来的に）グループ作成やイベント管理など、コミュニティ運営を円滑にする機能を提供予定です。"
          />
        </div>
      </section>

      <Separator className="my-12 md:my-16" />

      {/* --- 4. 技術スタック (オプション) --- */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl font-semibold tracking-tight">支えるテクノロジー</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            モダンで信頼性の高い技術スタックを採用し、快適な利用体験と将来的な拡張性を追求しています。
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <TechStackItem icon={Layers} name="React (v18+)" category="フロントエンド" />
          <TechStackItem icon={Palette} name="TypeScript" category="言語" />
          <TechStackItem icon={Zap} name="Vite" category="ビルドツール" />
          <TechStackItem icon={Cpu} name="Laravel (v10+)" category="バックエンド" />
          <TechStackItem icon={Cpu} name="PHP (v8.1+)" category="言語" />
          <TechStackItem icon={Layers} name="PostgreSQL / MySQL" category="データベース" />
          <TechStackItem icon={Palette} name="Tailwind CSS" category="UIフレームワーク" />
          <TechStackItem icon={Share2} name="shadcn/ui" category="UIコンポーネント" />
        </div>
      </section>

      {/* --- 5. チーム/開発者について (オプション、内容に応じてコメントアウトまたは記述) --- */}
      {/*
      <Separator className="my-12 md:my-16" />
      <section className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl font-semibold tracking-tight">開発チームより</h2>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-primary/20">
            <AvatarImage src="/path/to/your-team-or-developer-image.jpg" alt="開発者" />
            <AvatarFallback className="text-4xl">開発</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <p className="text-lg text-muted-foreground mb-4">
              Aqsh Terrace は、[あなたの名前/チーム名] によって開発・運営されています。
              私たちは、テクノロジーの力で人と人との繋がりを豊かにし、新しい価値創造の場を提供することに情熱を注いでいます。
              ユーザーの皆様にとって最高のプラットフォームとなるよう、日々改善を続けてまいります。
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <Button variant="outline" size="sm" asChild><a href="YOUR_GITHUB_PROFILE_OR_ORG_URL" target="_blank" rel="noopener noreferrer"><Github className="mr-2 h-4 w-4"/>GitHub</a></Button>
              <Button variant="outline" size="sm" asChild><a href="YOUR_TWITTER_URL" target="_blank" rel="noopener noreferrer"><Twitter className="mr-2 h-4 w-4"/>Twitter/X</a></Button>
            </div>
          </div>
        </div>
      </section>
      */}


      {/* --- 6. 今後の展望 --- */}
      <Separator className="my-12 md:my-16" />
      <section className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl font-semibold tracking-tight">今後の展望</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Aqsh Terrace はまだ始まったばかりです。今後もユーザーの皆様の声を聞きながら、さらに多くの機能を追加していく予定です。
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Rocket className="mr-2 h-5 w-5 text-primary" />機能拡張</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> ファイル/画像アップロード機能</p>
              <p className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> 全文検索機能の強化</p>
              <p className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> グループ/サークル機能</p>
              <p className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> イベント作成・管理機能</p>
              <p className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> OAuth認証 (Google, Twitter等)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><MessageCircle className="mr-2 h-5 w-5 text-primary" />コミュニティと共に</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>ユーザーの皆様からのフィードバックを積極的に取り入れ、より使いやすく、より価値のあるプラットフォームへと成長させていきます。</p>
              <p>バグ報告や機能要望は、ぜひお気軽にお寄せください。</p>
               <Button variant="link" asChild className="p-0 h-auto text-primary">
                   <a href="mailto:YOUR_CONTACT_EMAIL_ADDRESS">フィードバックを送る <ArrowRight className="ml-1 h-4 w-4"/></a>
               </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* --- 7. コンタクト/フィードバック --- */}
      <Separator className="my-12 md:my-16" />
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">お問い合わせ</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          ご不明な点やご意見、ご要望がございましたら、以下のメールアドレスまでお気軽にお問い合わせください。
        </p>
        <Button size="lg" asChild>
          <a href="mailto:info@aqsh.co.jp">
            <Mail className="mr-2 h-5 w-5" /> お問い合わせ
          </a>
        </Button>
      </section>

    </div>
  );
}

export default AboutPage;