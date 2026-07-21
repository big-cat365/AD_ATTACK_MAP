/*
 * concept-ui.js — interface strings + category metadata for the concepts page.
 * Kept in its own namespace (AD.CONCEPTS_UI / AD.CONCEPT_CATS) so the concepts
 * page is independent of the attack-map data.
 */
window.AD = window.AD || {};

AD.CONCEPT_CATS = [
  { id: "os",       ja: "Windows OS 基礎",            en: "Windows OS Fundamentals" },
  { id: "identity", ja: "識別子とセキュリティ記述子",   en: "Identifiers & Security Descriptors" },
  { id: "adstruct", ja: "Active Directory 構造",       en: "Active Directory Structure" },
  { id: "objects",  ja: "オブジェクトとグループ",       en: "Objects & Groups" },
  { id: "auth",     ja: "認証プロトコル",              en: "Authentication" },
  { id: "pki",      ja: "証明書・PKI",                en: "Certificates & PKI" },
  { id: "cloud",    ja: "クラウド / ハイブリッド",       en: "Cloud / Hybrid (Entra)" },
  { id: "logging",  ja: "ログと監視",                 en: "Logging & Monitoring" },
  { id: "prim",     ja: "攻撃プリミティブ・手口",       en: "Attack Primitives & Tradecraft" },
  { id: "soc",      ja: "検知・防御 / SOC運用",         en: "Detection & Defense (SOC)" }
];

AD.CONCEPTS_UI = {
  ja: {
    title: "AD / Windows 用語・概念リファレンス",
    searchPh: "用語 / 英語名 / 別名…",
    searchAl: "用語・英語名・別名で検索",
    langAl: "言語を切替 / Switch language",
    themeAl: "配色テーマを切替（ダーク／ライト）",
    backMap: "🗺 攻撃マップ",
    tocTitle: "▸ カテゴリ — クリックで展開",
    related: "関連",
    keyPoints: "要点",
    figHint: "図をクリックで拡大",
    count: "収録用語",
    noresult: '// 一致する用語がありません — <button class="clearbtn" id="clearFilters2">検索をクリア</button>',
    disclaimer: "教育・防御・認可されたセキュリティ検証を目的とした参考資料です。正確性には努めていますが、実装・製品バージョンにより挙動が異なる場合があります。一次情報での確認を推奨します。",
    footNote: "用語は Microsoft の公式呼称に準拠。イベントID・RID・OID・ポート等は代表的な値で、環境設定により異なる場合があります。"
  }
};
