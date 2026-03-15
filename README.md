## オンラインマイスター

### 環境構築手順

1.クローンする<br>
2.npm install

### フォルダ構成（仮）

```
MaiStar/
├─ package.json # ルートに1つだけ
├─ package-lock.json
├─ .gitignore
├─ node_modules/
│
├─ server/
│    ├─ server.nako3 # WSサーバー起動・ルーティング
│    ├─ game.nako3 # ゲーム全体のロジック
│    ├─ rooms.nako3 # 部屋・プレイヤー管理等
│    ├─ effects/
│    │    ├─ clients.nako3 # 客カード能力定義ファイル
│    │    └─ maiko.nako3 # 芸者カード能力定義ファイル
│    └─ data/
│         ├─ clients.json # 客カード定義
│         └─ maiko.json # 芸者カード定義
│
└─ client/
     ├─ index.html # ホーム画面
     ├─ waiting.html # 待機室
     ├─ game.html # ゲーム画面
     ├─ style.css # 共通スタイル
     └─ scripts/
          ├─ home.nako3 # ホーム画面ロジック
          ├─ waiting.nako3 # 待機室ロジック
          └─ game.nako3 # ゲーム画面ロジック
```
