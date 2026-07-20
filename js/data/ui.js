/*
 * ui.js — interface strings for each language. AD.I18N[lang].ui holds every
 * user-facing label; data (attacks/scenarios/phases/groups) live in the
 * i18n.<lang>.js files. Keep keys identical across languages.
 */
window.AD = window.AD || {};
AD.I18N = AD.I18N || { ja: {}, en: {} };

AD.I18N.ja.ui = {
  searchPh: "手法 / MITRE / ツール…",
  searchAl: "手法名・MITRE ID・ツール名で検索",
  viewGroupAl: "表示視点（強調するレーンを切替）",
  viewRedTi: "攻撃(Red)側を強調表示",
  viewPurpleTi: "攻撃・防御の両方を表示",
  viewBlueTi: "防御(Blue)側を強調表示",
  themeAl: "配色テーマを切替（ダーク／ライト）",
  langAl: "言語を切替 / Switch language",
  clearFilter: "× 絞り込み解除",
  conceptsLink: "📖 用語集",
  lede: '攻撃（<b style="color:var(--offense)">Red</b>）と防御（<b style="color:var(--defense)">Blue</b>）を対にした Active Directory 攻撃技術のリファレンス。キルチェーン7フェーズ・<b>256手法</b>、各手法に登場人物フロー図を収録。',
  legRed: "RedTeam / 攻撃",
  legBlue: "BlueTeam / 防御",
  legPurple: "Purple / 両視点",
  legSev: '<span class="diamond">▌</span> 重大度: <span style="color:var(--sev-crit)">Critical</span> · <span style="color:var(--sev-high)">High</span> · <span style="color:var(--sev-med)">Medium</span>',
  flowAttack: "攻撃操作", flowAuth: "正規認証", flowData: "資格情報/データ取得", flowMove: "横展開/実行", flowDefense: "防御の検知点",
  flowHint: "— 図をクリック／Enterで拡大",
  spineTitle: "▸ Attack Kill-Chain — フェーズをクリックで移動",
  footerUseH: "視点の使い方",
  footerUse: "Red = 攻撃手順・前提・ツール。Blue = 検知シグナル・イベントID・緩和策。Purple で左右（上下）を同時表示。カードにホバー／フォーカスすると、絞り込み中でも反対側の視点が一時的に復帰します。",
  footerRefsH: "主要リファレンス",
  footerNoteH: "凡例メモ",
  footerNote: "イベントIDは主に Windows セキュリティログ。多くの検知は「単発イベント」ではなく相関・ベースライン逸脱で成立します。ツール名は代表例で、悪用可否は環境設定に依存します。",
  disclaimer: "教育・防御・認可されたセキュリティ検証を目的とした参考資料です。実際のツール実行やコマンドは、書面による許可のある環境（自組織・ラボ・ペネトレーション契約・CTF）でのみ行ってください。無認可のシステムに対する使用は法令で禁止されています。",
  noresult: '// 条件に一致する技術がありません — <button class="clearbtn" id="clearFilters2">絞り込みを解除</button>',
  // rendered
  cardRed: "Red · 攻撃", cardBlue: "Blue · 防御",
  flowHead: 'ATTACK FLOW <b>登場人物と手順</b>',
  expand: "⤢ 拡大", expandAl: "{name} の攻撃フロー図を拡大",
  techniques: "techniques",
  detectLabel: "検知:", triageLabel: "判定 (ログ分析):", mitigateLabel: "対策:",
  huntLabel: "ハンティング クエリ (KQL)", huntHint: "Defender XDR / Sentinel の Advanced Hunting 例。自環境のスキーマ・監査設定に合わせて調整してください。",
  huntCsLabel: "ハンティング クエリ (CrowdStrike Falcon)", huntCsHint: "Falcon Event Search (SPL) / LogScale・Next-Gen SIEM (CQL) の例。DC固有イベントは Falcon Identity Protection の検知、または攻撃元ホストのテレメトリで補完します。",
  statTotal: "収録テクニック", statPhases: "キルチェーン フェーズ", statCats: "攻撃カテゴリ", statCrit: "Critical 重大度", statHigh: "High 重大度",
  modalRed: "RedTeam · 攻撃", modalBlue: "BlueTeam · 防御", noFlow: "図データなし",
  svgActors: "攻撃フロー図。登場人物: ", svgSteps: "。手順: ",
};

