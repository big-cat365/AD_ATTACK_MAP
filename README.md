# AD Attack Map — Red / Blue

Active Directory 攻撃手法を、キルチェーン7フェーズ × Red/Blue 両視点 × 登場人物フロー図で
まとめたローカル完結の静的サイト（日本語）。
各手法の Blue 側は「検知 → 判定(ログ分析) → ハンティングクエリ(Microsoft KQL / CrowdStrike Falcon) → 対策」で構成。
各カードには **コマンド例（観測される文字列）** ブロックを収録。プロセステレメトリ
（Sysmon EID1 / `DeviceProcessEvents` / `ProcessRollup2`）に実際に現れる文字列をそのまま載せているので、
ハンティングクエリやウォッチリストのマッチ対象として使える。Red/Blue どちらの視点でも使うため、
このブロックだけは両レーンの外側（フロー図と Red/Blue の間）に全幅で置いている。

- **`index.html`** … 攻撃手法マップ
- **`concepts.html`** … AD / Windows 用語・概念リファレンス（図解付き）。両ページはヘッダーで相互リンク。

## 使い方

`index.html` をブラウザで開くだけ（`file://` で直接ダブルクリック可）。
サーバ・ネット接続・ビルド不要。GitHub Pages でもそのまま公開できます。
https://big-cat365.github.io/AD_ATTACK_MAP/

## ファイル構成

```
index.html              … 攻撃マップ本体（マークアップ＋各CSS/JSの読み込みのみ）
concepts.html           … 用語・概念リファレンス本体
css/
  styles.css            … 共通スタイル（デザイントークン→レイアウト→コンポーネント→図→モーダル）
  concepts.css          … 用語集ページ固有スタイル（カテゴリナビ・用語カード・SVG図）
js/
  data/
    ui.js               … AD.I18N.ja.ui   攻撃マップの画面文言
    phases.js           … AD.I18N.ja.phases  キルチェーン7フェーズ定義
    attacks.js          … AD.I18N.ja.attacks   各手法の本文（cmd=コマンド例 / hunt=KQL / huntcs=CrowdStrike 含む）
    scenarios.js        … AD.I18N.ja.scenarios / groupOrder
    concepts.js         … AD.CONCEPTS.ja   用語集の本文（body / points / related）
    concept-ui.js       … AD.CONCEPTS_UI.ja / AD.CONCEPT_CATS  用語集の文言・カテゴリ定義
    concept-figs.js     … AD.FIGS   用語集の手描きインラインSVG図解（テーマ追従）
  util.js               … AD.esc / monoWrap / scnNorm / ICONS
  core.js               … 両ページ共通ランタイム（theme / debounce / lazy / overlay / backToTop / prefetch）
  components.js         … AD.tags / AD.cmdBlock / AD.huntBlock / AD.lanes（カードとモーダルで共有する描画片）
  diagram.js            … AD.diagram    シーケンス図レンダラ（CONFIG / ROLES / renderSeq）
  modal.js              … AD.modal      詳細モーダル（拡大図＋全文）
  views.js              … AD.views      stat/spine/カードグリッド生成＋段階描画
  app.js                … 攻撃マップの視点トグル・検索・フィルタ・テーマ＋初期化
  concepts.js           … 用語集の描画・検索・図モーダル・テーマ＋初期化
```

## 言語

- 日本語のみ。データは `AD.I18N.ja` / `AD.CONCEPTS.ja`。
- 画面文言は HTML 要素の `data-t`（textContent）/ `data-t-html`（innerHTML）/ `data-t-ph`（placeholder）/
  `data-t-al`（aria-label）/ `data-t-ti`（title）属性で対応付け。JS描画部は `AD.UI.<key>` を参照。
- 用語カードの見出しは日本語、副題(teal)に英語の技術名を併記（`concepts.js`）。

## 設計メモ

- **名前空間 `window.AD`**：全ファイルはクラシックスクリプト（非モジュール）。
  `file://` では ES modules と `fetch()` が CORS でブロックされるため、
  `<script src>` の順次読み込み＋単一グローバル名前空間で共有している。
  読み込み順（HTML末尾）は data → util → core → components → diagram → views → modal → app。
- **データと表示の分離**：`js/data/*` を差し替えれば内容を更新できる。表示ロジックは触らない。
- **図レンダラ**：`js/diagram.js` の `CONFIG` で余白・列幅・フォントを一括調整。
  役割→色は `ROLES` の group クラス（`g-off/g-def/g-pur/g-neu`）→ `css/styles.css` で定義。
- **重複排除**：カード（views）とモーダル（modal）は `AD.lanes()` / `AD.tags()`（components）を
  共有するので、Red/Blue の文言が二重管理にならない。

## 手法を1件追加する

1. `js/data/attacks.js` の `AD.ATTACKS` に
   `{ name, aka, phase, group, mitre, cve, sev, summary, how, tools, cmd, detect, events, mitigate }` を追加。
   - `phase` は `js/data/phases.js` の `id` のいずれか。
   - `group` は `AD.GROUP_ORDER`（`js/data/scenarios.js`）に載っていると並び順が安定。
   - `sev` は `Critical` / `High` / `Medium`。
   - `cmd` は `{ tool, t, q }` の配列（3〜6件）。`tool` はバッジ文字列（18文字以内）、
     `t` は「何をするコマンドか＋どのログのどの文字列を見るか」を守備側視点で書く（末尾に句点は付けない。
     バックティックで囲むとインラインコードになる）、`q` はコマンドそのもの。
     ドメインは `corp.local`、DCは `dc01.corp.local` / `10.0.0.10`、パスワードは `'Passw0rd!'`、
     ハッシュは `aabbccddeeff…` のように**一目でダミーと分かる値**を使う。
     クライアント側コマンドが存在しない手法（プロトコル悪用・ポータル操作等）は、
     無理に作らず `t` でその旨を書き、最も近い実在の観測点を挙げる。
2. `js/data/scenarios.js` の `AD.SCENARIOS` に、正規化キー（英数＋かな漢字を小文字連結）で
   `{ actors:[{id,label,role}], steps:[{from,to,label,kind}] }` を追加。
   - `role`: attacker / victim / workstation / dc / server / svcacct / ca / db / share / cloud / admin / relay / dns / adobject
   - `kind`: attack / auth / data / move / defense

## 注意

教育・防御・認可されたセキュリティ検証を目的とする参考資料。
各手法の詳細（イベントID・ツール・手順）は要一次情報での裏取り。
