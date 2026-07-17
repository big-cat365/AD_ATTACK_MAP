# AD Attack Map — Red / Blue

Active Directory 攻撃 218手法を、キルチェーン7フェーズ × Red/Blue 両視点 × 登場人物フロー図で
まとめたローカル完結の静的サイト。専門レビューによる正確性修正（MITRE ID・hashcatモード・
イベントID・CVE帰属・機序の是正）と、収録漏れ（RODC / SCCMサイトテイクオーバー / Windows LAPS /
Entra 同意・Device Code フィッシング等）の追加を反映済み。

## 使い方

`ad-attack-map.html` をブラウザで開くだけ（`file://` で直接ダブルクリック可）。
サーバ・ネット接続・ビルド不要。

## ファイル構成

```
ad-attack-map.html      … HTML本体（マークアップ＋各CSS/JSの読み込みのみ）
css/
  styles.css            … 全スタイル（デザイントークン→レイアウト→コンポーネント→図→モーダル）
js/
  data/
    phases.js           … AD.PHASES      キルチェーン7フェーズ定義
    attacks.js          … AD.ATTACKS     218手法の本文データ（Red/Blue）
    scenarios.js        … AD.SCENARIOS   218手法のフロー図データ / AD.GROUP_ORDER
  util.js               … AD.esc / monoWrap / scnNorm / ICONS
  components.js         … AD.tags / AD.lanes（カードとモーダルで共有する描画片）
  diagram.js            … AD.diagram    シーケンス図レンダラ（CONFIG / ROLES / renderSeq）
  modal.js              … AD.modal      詳細モーダル（拡大図＋全文）
  views.js              … AD.views      stat/spine/カードグリッド生成＋段階描画
  app.js                … 画面操作（視点トグル・検索・重大度フィルタ・テーマ）＋初期化
```

## 設計メモ

- **名前空間 `window.AD`**：全ファイルはクラシックスクリプト（非モジュール）。
  `file://` では ES modules と `fetch()` が CORS でブロックされるため、
  `<script src>` の順次読み込み＋単一グローバル名前空間で共有している。
  読み込み順（HTML末尾）は data → util → components → diagram → views → modal → app。
- **データと表示の分離**：`js/data/*` を差し替えれば内容を更新できる。表示ロジックは触らない。
- **図レンダラ**：`js/diagram.js` の `CONFIG` で余白・列幅・フォントを一括調整。
  役割→色は `ROLES` の group クラス（`g-off/g-def/g-pur/g-neu`）→ `css/styles.css` で定義。
- **重複排除**：カード（views）とモーダル（modal）は `AD.lanes()` / `AD.tags()`（components）を
  共有するので、Red/Blue の文言が二重管理にならない。

## 手法を1件追加する

1. `js/data/attacks.js` の `AD.ATTACKS` に
   `{ name, aka, phase, group, mitre, cve, sev, summary, how, tools, detect, events, mitigate }` を追加。
   - `phase` は `js/data/phases.js` の `id` のいずれか。
   - `group` は `AD.GROUP_ORDER`（`js/data/scenarios.js`）に載っていると並び順が安定。
   - `sev` は `Critical` / `High` / `Medium`。
2. `js/data/scenarios.js` の `AD.SCENARIOS` に、正規化キー（英数＋かな漢字を小文字連結）で
   `{ actors:[{id,label,role}], steps:[{from,to,label,kind}] }` を追加。
   - `role`: attacker / victim / workstation / dc / server / svcacct / ca / db / share / cloud / admin / relay / dns / adobject
   - `kind`: attack / auth / data / move / defense

## 注意

教育・防御・認可されたセキュリティ検証を目的とする参考資料。
各手法の詳細（イベントID・ツール・手順）は要一次情報での裏取り。
