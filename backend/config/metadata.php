<?php

// config/metadata.php

return [

    /*
    |--------------------------------------------------------------------------
    | 業界リスト (Industry List)
    |--------------------------------------------------------------------------
    | キーはDB保存用、値は表示用ラベル。大分類・中分類を意識。
    */
    'industries' => [
        // IT・通信
        'it_web_service' => 'Webサービス/メディア',
        'it_saas_asp' => 'SaaS/ASP',
        'it_software_system' => 'ソフトウェア/システム開発',
        'it_hardware' => 'ハードウェア/デバイス製造',
        'it_telecom' => '通信キャリア/ISP',
        'it_data_center' => 'データセンター/ホスティング',
        'it_consulting' => 'ITコンサルティング',
        'it_security' => '情報セキュリティ',
        // インターネット・広告・メディア
        'internet_portal' => 'ポータルサイト/検索エンジン',
        'internet_ec' => 'EC/ネット通販',
        'internet_social' => 'ソーシャルメディア/SNS',
        'internet_game' => 'ソーシャルゲーム/オンラインゲーム',
        'advertising_agency' => '広告代理店',
        'advertising_pr' => 'PR/IR',
        'media_tv_radio' => 'テレビ/ラジオ',
        'media_publishing' => '出版/新聞',
        'media_video_music' => '映像/音楽/コンテンツ制作',
        // メーカー (電気・電子・機械)
        'manufacturer_electronics' => '電気/電子部品/半導体',
        'manufacturer_computer' => 'コンピュータ/OA機器',
        'manufacturer_machinery' => '産業用機械/設備',
        'manufacturer_precision' => '精密機器/計測機器',
        'manufacturer_medical' => '医療機器',
        'manufacturer_automotive' => '自動車/輸送用機器',
        // メーカー (素材・化学・食品・その他)
        'manufacturer_materials' => '素材/化学/繊維',
        'manufacturer_pharma' => '医薬品/化粧品',
        'manufacturer_food' => '食品/飲料',
        'manufacturer_consumer' => '消費財/日用品',
        'manufacturer_apparel' => 'アパレル/服飾雑貨',
        'manufacturer_furniture' => '家具/インテリア',
        // 商社
        'trading_general' => '総合商社',
        'trading_specialized' => '専門商社',
        // 金融
        'finance_banking' => '銀行/信託銀行',
        'finance_securities' => '証券/投資銀行',
        'finance_insurance_life' => '生命保険',
        'finance_insurance_nonlife' => '損害保険',
        'finance_credit' => 'クレジットカード/信販/リース',
        'finance_investment' => '投資ファンド/投資顧問',
        'finance_fintech' => 'FinTech',
        // 建設・不動産
        'construction_general' => '建設/ゼネコン',
        'construction_housing' => '住宅/ハウスメーカー',
        'construction_plant' => 'プラント/エンジニアリング',
        'realestate_developer' => '不動産デベロッパー',
        'realestate_brokerage' => '不動産仲介/管理',
        // サービス・小売
        'service_consulting_general' => '総合コンサルティング',
        'service_consulting_strategy' => '戦略コンサルティング',
        'service_outsourcing' => 'アウトソーシング/BPO',
        'service_hr' => '人材紹介/派遣',
        'service_education' => '教育/研修サービス',
        'service_tourism' => '旅行/ホテル/レジャー',
        'service_restaurant_food' => '外食/中食',
        'service_entertainment' => 'エンターテイメント/アミューズメント',
        'service_ceremony' => '冠婚葬祭',
        'retail_department' => '百貨店/スーパー/コンビニ',
        'retail_specialty' => '専門店 (アパレル, 家電, ドラッグストア等)',
        // 運輸・物流
        'logistics_rail_air' => '鉄道/航空',
        'logistics_shipping_land' => '陸運/海運/倉庫',
        // エネルギー・インフラ
        'energy_electric_gas' => '電力/ガス/エネルギー',
        'energy_resources' => '石油/石炭/鉱業',
        'energy_renewable' => '再生可能エネルギー',
        // 医療・福祉・介護
        'medical_hospital' => '病院/診療所',
        'medical_dental' => '歯科',
        'medical_pharma_wholesale' => '医薬品卸',
        'welfare_nursing' => '福祉/介護',
        // その他
        'agriculture_forestry_fishery' => '農林水産',
        'government_local' => '地方公共団体',
        'nonprofit_organization' => 'NPO/NGO/公益法人',
        'other_industry' => 'その他業界',
    ],

    /*
    |--------------------------------------------------------------------------
    | 企業タイプリスト (Company Type List)
    |--------------------------------------------------------------------------
    */
    'company_types' => [
        'startup_seed_early' => 'スタートアップ(シード/アーリー)',
        'startup_growth' => 'スタートアップ(ミドル/レイター)',
        'venture_mega' => 'メガベンチャー',
        'sme' => '中小企業',
        'large_nonlisted' => '大企業(非上場)',
        'large_listed' => '大企業(上場)',
        'foreign_affiliated' => '外資系企業',
        'government_agency' => '官公庁/独立行政法人',
        'local_government' => '地方公共団体',
        'public_corp_foundation' => '特殊法人/公益法人',
        'npo_ngo' => 'NPO/NGO',
        'educational_institution' => '学校法人/教育機関',
        'medical_institution' => '医療法人',
        'social_welfare_corp' => '社会福祉法人',
        'freelance_sole_prop' => 'フリーランス/個人事業主',
        'other_corp_type' => 'その他',
    ],

    /*
    |--------------------------------------------------------------------------
    | 企業規模リスト (Company Size List)
    |--------------------------------------------------------------------------
    */
    'company_sizes' => [
        '1-10' => '1～10名',
        '11-30' => '11～30名',
        '31-50' => '31～50名',
        '51-100' => '51～100名',
        '101-300' => '101～300名',
        '301-500' => '301～500名',
        '501-1000' => '501～1000名',
        '1001-5000' => '1001～5000名',
        '5001-' => '5001名以上',
    ],

    /*
    |--------------------------------------------------------------------------
    | スキルタイプリスト (Skill Type List)
    |--------------------------------------------------------------------------
    | skills テーブルの type カラムに対応
    */
    'skill_types' => [
        'technical_language' => 'プログラミング言語',
        'technical_framework' => 'フレームワーク/ライブラリ',
        'technical_database' => 'データベース',
        'technical_cloud' => 'クラウド/インフラ',
        'technical_os_network' => 'OS/ネットワーク',
        'technical_devops' => 'DevOps/CI/CD',
        'technical_testing' => 'テスト/QA',
        'technical_security' => 'セキュリティ',
        'technical_data_science' => 'データサイエンス/AI/ML',
        'technical_mobile' => 'モバイルアプリ開発',
        'technical_embedded' => '組込み/IoT',
        'technical_tools' => '開発ツール/その他技術',
        'business_management' => 'マネジメント',
        'business_strategy_planning' => '戦略/企画',
        'business_marketing' => 'マーケティング/販促',
        'business_sales' => '営業',
        'business_design' => 'デザイン/クリエイティブ',
        'business_writing' => 'ライティング/編集',
        'business_hr' => '人事/労務',
        'business_accounting_finance' => '経理/財務/法務',
        'business_corp_admin' => '総務/秘書/事務',
        'business_customer_support' => 'カスタマーサポート/サクセス',
        'business_consulting' => 'コンサルティング(ビジネス)',
        'industry_knowledge' => '業界知識/ドメイン知識', // industry と重複するがスキルとして明示する場合
        'language' => '語学スキル',
        'qualification' => '資格/認定',
        'knowledge_area' => '特定業務/領域知識',
        'soft_skill' => 'ソフトスキル/ポータブルスキル',
        'other_skill' => 'その他スキル',
    ],

    /*
    |--------------------------------------------------------------------------
    | スキルレベル定義 (Skill Level Definition)
    |--------------------------------------------------------------------------
    | skill_user テーブルの level カラムに対応
    */
    'skill_levels' => [
        // 1 => '知識がある / 学習中',
        // 2 => '指示があれば担当できる / 一部業務で利用',
        // 3 => '自律的に業務遂行可能 / 日常的に利用',
        // 4 => '応用・改善できる / 他者に指導可能',
        // 5 => 'エキスパート / 第一人者レベル',
        // より具体的な表現例
        1 => '基礎知識・学習中',
        2 => 'サポート下で実行可能',
        3 => '独力で実行可能',
        4 => '応用・指導可能',
        5 => '高度な専門性・改善推進',
    ],

    /*
    |--------------------------------------------------------------------------
    | 職種リスト
    |--------------------------------------------------------------------------
    | キーは任意、値が表示用ラベル (ここではキーと値を同じにする例)
    */
    'job_titles' => [
        // エンジニア・技術職
        'web_developer' => 'Webエンジニア',
        'backend_engineer' => 'バックエンドエンジニア',
        'frontend_engineer' => 'フロントエンドエンジニア',
        'fullstack_engineer' => 'フルスタックエンジニア',
        'mobile_app_engineer' => 'モバイルアプリエンジニア',
        'infra_engineer' => 'インフラエンジニア',
        'cloud_engineer' => 'クラウドエンジニア',
        'sre' => 'SRE (Site Reliability Engineer)',
        'devops_engineer' => 'DevOpsエンジニア',
        'security_engineer' => 'セキュリティエンジニア',
        'data_scientist' => 'データサイエンティスト',
        'data_analyst' => 'データアナリスト',
        'ai_ml_engineer' => 'AI/機械学習エンジニア',
        'qa_engineer' => 'QAエンジニア/テスター',
        'embedded_engineer' => '組込みエンジニア',
        'technical_support' => 'テクニカルサポート',
        'researcher_tech' => '研究開発職(技術系)',
        // マネジメント・リーダー職
        'project_manager' => 'プロジェクトマネージャー',
        'product_manager' => 'プロダクトマネージャー',
        'engineering_manager' => 'エンジニアリングマネージャー',
        'tech_lead' => 'テックリード',
        'team_leader' => 'チームリーダー',
        'director' => 'ディレクター',
        'producer' => 'プロデューサー',
        // 企画・マーケティング職
        'business_planner' => '事業企画',
        'service_planner' => 'サービス企画',
        'web_planner' => 'Webプランナー',
        'marketer' => 'マーケター',
        'digital_marketer' => 'デジタルマーケター',
        'sns_manager' => 'SNS担当',
        'content_marketer' => 'コンテンツマーケター',
        'public_relations' => '広報/PR',
        'market_research' => '市場調査/リサーチ',
        // 営業職
        'sales_field' => '営業/フィールドセールス',
        'sales_inside' => 'インサイドセールス',
        'sales_key_account' => 'キーアカウントマネージャー',
        'sales_engineer' => 'セールスエンジニア',
        'sales_manager' => '営業マネージャー',
        'customer_success' => 'カスタマーサクセス',
        // デザイン・クリエイティブ職
        'ui_designer' => 'UIデザイナー',
        'ux_designer' => 'UXデザイナー',
        'web_designer' => 'Webデザイナー',
        'graphic_designer' => 'グラフィックデザイナー',
        'illustrator' => 'イラストレーター',
        'video_creator' => '動画クリエイター',
        'writer' => 'ライター/コピーライター',
        'editor' => '編集者',
        // 管理部門・事務職
        'hr_recruiter' => '人事(採用)',
        'hr_labor' => '人事(労務)',
        'hr_generalist' => '人事(企画/制度)',
        'accounting' => '経理',
        'finance' => '財務',
        'legal' => '法務',
        'general_affairs' => '総務',
        'secretary' => '秘書',
        'office_clerk' => '一般事務/営業事務',
        'customer_support_operator' => 'カスタマーサポート(オペレーター)',
        // その他専門職
        'consultant_business' => '経営/事業コンサルタント',
        'consultant_it' => 'ITコンサルタント',
        'teacher_instructor' => '教師/講師',
        'medical_doctor' => '医師',
        'nurse' => '看護師',
        'pharmacist' => '薬剤師',
        'lawyer' => '弁護士',
        'other_specialist' => 'その他専門職',
    ],

];