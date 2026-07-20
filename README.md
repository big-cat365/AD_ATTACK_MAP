# AD Attack Map — Red / Blue

Active Directory 攻撃 256手法を、キルチェーン7フェーズ × Red/Blue 両視点 × 登場人物フロー図で
まとめたローカル完結の静的サイト。**日本語がデフォルト、ヘッダーの言語ボタンで英語に切替**（i18n）。
各手法の Blue 側に「検知 → 判定(ログ分析) → ハンティングクエリ(Microsoft KQL / CrowdStrike Falcon) → 対策」を収録。
専門エージェントによる商用グレード監査（MITRE ID・イベントID・CVE帰属・機序・triage の是正）と、
収録漏れ（Potato系LPE / Exchange RCE / SCCM・Intune / Entra 各種 / NTLM・Kerberos リレー等）の
追加を反映済み。

## 使い方

`index.html` をブラウザで開くだけ（`file://` で直接ダブルクリック可）。
サーバ・ネット接続・ビルド不要。GitHub Pages でもそのまま公開できます。
https://big-cat365.github.io/AD_ATTACK_MAP/

## ファイル構成

```
index.html              … HTML本体（マークアップ＋各CSS/JSの読み込みのみ）
css/
  styles.css            … 全スタイル（デザイントークン→レイアウト→コンポーネント→図→モーダル）
js/
  data/
    ui.js               … AD.I18N.{ja,en}.ui   画面文言（言語別）
    phases.js           … AD.I18N.{ja,en}.phases  キルチェーン7フェーズ定義
    attacks.js          … AD.I18N.ja.attacks   256手法の本文（日本語, hunt=KQL / huntcs=CrowdStrike 含む）
    attacks.en.js       … AD.I18N.en.attacks   256手法の本文（英語, hunt=KQL / huntcs=CrowdStrike 含む）
    scenarios.js        … AD.I18N.ja.scenarios / groupOrder（日本語）
    scenarios.en.js     … AD.I18N.en.scenarios / groupOrder（英語）
  util.js               … AD.esc / monoWrap / scnNorm / ICONS
  components.js         … AD.tags / AD.lanes（カードとモーダルで共有する描画片）
  diagram.js            … AD.diagram    シーケンス図レンダラ（CONFIG / ROLES / renderSeq）
  modal.js              … AD.modal      詳細モーダル（拡大図＋全文）
  views.js              … AD.views      stat/spine/カードグリッド生成＋段階描画
  app.js                … setLang(言語切替)/視点トグル・検索・フィルタ・テーマ＋初期化
```

## 多言語（i18n）

- 言語ごとのデータは `AD.I18N.ja` / `AD.I18N.en`（attacks / scenarios / phases / groupOrder / ui）。
- `app.js` の `setLang(lang)` が `AD.ATTACKS` 等を切替→`applyUiStrings()`→再描画。既定 `ja`。
- 画面文言は HTML 要素の `data-t`（textContent）/ `data-t-html`（innerHTML）/ `data-t-ph`（placeholder）/
  `data-t-al`（aria-label）/ `data-t-ti`（title）属性で対応付け。JS描画部は `AD.UI.<key>` を参照。
- `name`・`tools`・MITRE/CVE・イベントID は言語共通（翻訳しない）。翻訳は説明系フィールドと図ラベルのみ。

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
