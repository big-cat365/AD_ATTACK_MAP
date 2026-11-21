/*
 * ui.js — interface strings for the attack-map page. AD.I18N.ja.ui holds every
 * user-facing label; the data itself (attacks / scenarios / phases / groups)
 * lives in the sibling js/data/*.js files. Japanese-only.
 */
window.AD = window.AD || {};
AD.I18N = AD.I18N || { ja: {} };

AD.I18N.ja.ui = {
  searchPh: "手法・ツール・IDで検索",
  searchAl: "手法名・ツール名・MITRE ID・イベントIDで検索",
  viewGroupAl: "表示視点（強調するレーンを切替）",
  viewRedTi: "攻撃側を強調表示",
  viewPurpleTi: "攻撃・防御の両方を表示",
  viewBlueTi: "防御側を強調表示",
  themeAl: "配色テーマを切替（ダーク／ライト）",
  clearFilter: "絞り込み解除",
  conceptsLink: "用語集",
  flowAttack: "攻撃操作", flowAuth: "正規認証", flowData: "資格情報・データ取得", flowMove: "横展開・実行", flowDefense: "防御の検知点",
  spineTitle: "攻撃フェーズ",
  footerUseH: "視点の使い方",
  footerUse: "「攻撃」は手順・前提・ツールを、「防御」は検知・イベントID・対策を強調します。「両方」は両方を同じ強さで表示します。絞り込み中でも、カードにカーソルかフォーカスを合わせると反対側が一時的に戻ります。",
  footerRefsH: "主要リファレンス",
  footerNoteH: "注記",
  footerNote: "イベントIDは主に Windows セキュリティログ。多くの検知は「単発イベント」ではなく相関・ベースライン逸脱で成立します。ツール名は代表例で、悪用可否は環境設定に依存します。",
  disclaimer: "教育・防御・認可されたセキュリティ検証を目的とした参考資料です。実際のツール実行やコマンドは、書面による許可のある環境（自組織・ラボ・ペネトレーション契約・CTF）でのみ行ってください。無認可のシステムに対する使用は法令で禁止されています。",
  noresult: '条件に一致する手法はありません <button class="clearbtn" id="clearFilters2">絞り込みを解除</button>',
  // rendered
  cardRed: "攻撃", cardBlue: "防御",
  sevLabel: { Critical: "緊急", High: "重要", Medium: "警告" },
  flowHead: '攻撃フロー',
  expand: "拡大", expandAl: "{name} の攻撃フロー図を拡大",
  detectLabel: "検知:", triageLabel: "判定（ログ分析）:", mitigateLabel: "対策:",
  cmdLabel: "コマンド例", cmdHint: "EDRやSysmonのプロセスログに現れる形のまま載せています。ドメイン名・ユーザー名・パスワード・PIDはダミーです。",
  huntLabel: "ハンティングクエリ（KQL）", huntHint: "Defender XDR・Sentinel の Advanced Hunting 用です。スキーマや監査設定は環境に合わせて調整してください。",
  huntCsLabel: "ハンティングクエリ（CrowdStrike Falcon）", huntCsHint: "Event Search（SPL）と LogScale・Next-Gen SIEM（CQL）用です。DC側のイベントは Identity Protection の検知か、攻撃元ホストのテレメトリで補ってください。",
  statTotal: "手法", statPhases: "フェーズ", statCats: "カテゴリ", statCrit: "件が緊急", statHigh: "件が重要",
  modalRed: "攻撃", modalBlue: "防御", noFlow: "フロー図なし",
  svgActors: "攻撃フロー図。登場人物: ", svgSteps: "。手順: ",
};

