/*
 * concept-figs.js — hand-authored inline SVG diagrams for the concepts page.
 * Colours come from CSS (var(--…) via .fig classes in concepts.css) so the
 * figures theme (dark/light) automatically. Labels are technical/English and
 * shared across languages; the localized prose lives in the concept body.
 * AD.FIGS[id] = "<svg>…". A figure may be referenced by several concept ids.
 */
window.AD = window.AD || {};
(function (AD) {
  "use strict";
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function svg(w, h, body, title){
    return '<svg class="fig" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="xMidYMid meet" role="img" aria-label="'+esc(title)+'" xmlns="http://www.w3.org/2000/svg">'
      + '<defs>'
      + '<marker id="ah" markerWidth="8" markerHeight="8" refX="6.5" refY="3" orient="auto"><path d="M0 0 L7 3 L0 6 z" class="ahp"/></marker>'
      + '<marker id="ah-off" markerWidth="8" markerHeight="8" refX="6.5" refY="3" orient="auto"><path d="M0 0 L7 3 L0 6 z" class="ahp off"/></marker>'
      + '<marker id="ah-def" markerWidth="8" markerHeight="8" refX="6.5" refY="3" orient="auto"><path d="M0 0 L7 3 L0 6 z" class="ahp def"/></marker>'
      + '<marker id="ah-pur" markerWidth="8" markerHeight="8" refX="6.5" refY="3" orient="auto"><path d="M0 0 L7 3 L0 6 z" class="ahp pur"/></marker>'
      + '</defs>' + body + '</svg>';
  }
  // box(x,y,w,h,{t:title,s:subtitle,cls:'off|def|pur|neu',mono:bool})
  function box(x,y,w,h,o){
    o = o || {};
    var cls = 'bx' + (o.cls ? ' bx-'+o.cls : '');
    var s = '<rect class="'+cls+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="6"/>';
    var cx = x + w/2;
    if (o.t){
      var ty = o.s ? y + h/2 - 4 : y + h/2 + 4;
      s += '<text class="bt'+(o.mono?' mono':'')+'" x="'+cx+'" y="'+ty+'" text-anchor="middle">'+esc(o.t)+'</text>';
    }
    if (o.s) s += '<text class="bs" x="'+cx+'" y="'+(y+h/2+12)+'" text-anchor="middle">'+esc(o.s)+'</text>';
    return s;
  }
  function lane(x,y,w,h,label,cls){ // labelled container band
    return '<rect class="ln '+(cls||'')+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8"/>'
      + '<text class="lnl" x="'+(x+10)+'" y="'+(y+16)+'">'+esc(label)+'</text>';
  }
  function arr(x1,y1,x2,y2,o){ // arrow with optional label; kind: off/def/pur/''
    o = o || {};
    var k = o.kind || '';
    var mk = k==='off'?'ah-off':k==='def'?'ah-def':k==='pur'?'ah-pur':'ah';
    var s = '<line class="ar '+k+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" marker-end="url(#'+mk+')"'+(o.dash?' stroke-dasharray="4 3"':'')+'/>';
    if (o.t){ var mx=(x1+x2)/2, my=(y1+y2)/2 + (o.dy||-5); s += '<text class="arl" x="'+mx+'" y="'+my+'" text-anchor="middle">'+esc(o.t)+'</text>'; }
    return s;
  }
  function txt(x,y,s,cls,anchor){ return '<text class="'+(cls||'lbl')+'" x="'+x+'" y="'+y+'" text-anchor="'+(anchor||'start')+'">'+esc(s)+'</text>'; }
  function num(cx,cy,n){ return '<circle class="stepn" cx="'+cx+'" cy="'+cy+'" r="9"/><text class="stepnt" x="'+cx+'" y="'+(cy+4)+'" text-anchor="middle">'+n+'</text>'; }

  var F = {};

  /* ---- User space / Kernel space (rings) ---- */
  F.userkernel = svg(720, 300,
    txt(360,26,'User mode (Ring 3)  vs  Kernel mode (Ring 0)','figt','middle') +
    lane(40,44,640,110,'USER MODE — Ring 3  (isolated, per-process virtual address space)','ln-user') +
    box(60,74,150,54,{t:'App / EXE',s:'e.g. explorer.exe'}) +
    box(230,74,150,54,{t:'Services',s:'svchost.exe'}) +
    box(400,74,150,54,{t:'lsass.exe',s:'LSA / creds',cls:'def'}) +
    box(560,74,100,54,{t:'ntdll.dll',s:'stubs',mono:true}) +
    lane(40,196,640,84,'KERNEL MODE — Ring 0  (shared, full hardware access)','ln-kernel') +
    box(60,222,190,44,{t:'ntoskrnl.exe',s:'Executive / Kernel',cls:'off'}) +
    box(270,222,190,44,{t:'Drivers (.sys)',s:'file, net, GPU…',cls:'off'}) +
    box(480,222,180,44,{t:'HAL',s:'hardware layer',cls:'off'}) +
    arr(360,154,360,196,{kind:'', t:'syscall ↓ / return ↑', dy:-2}) +
    txt(360,296,'境界はシステムコール(syscall)。カーネルのみがハードウェアと全プロセスへアクセスできる','lbl','middle'),
    'User mode Ring 3 and kernel mode Ring 0 separation');

  /* ---- Access token ---- */
  F.token = svg(560, 300,
    txt(280,26,'Access Token  (attached to every process / thread)','figt','middle') +
    box(60,44,440,230,{cls:'def'}) +
    txt(80,68,'Access Token','bt') +
    box(80,80,400,34,{t:'User SID',s:'S-1-5-21-…-1104',mono:true}) +
    box(80,122,400,44,{t:'Group SIDs',s:'Domain Users, Domain Admins, S-1-5-32-544 …',mono:true}) +
    box(80,174,400,44,{t:'Privileges',s:'SeDebugPrivilege, SeImpersonatePrivilege …',mono:true}) +
    box(80,226,192,34,{t:'Integrity Level',s:'High / Medium / Low'}) +
    box(288,226,192,34,{t:'Logon SID / Type',s:'session, LUID'}),
    'Access token contents');

  /* ---- SID structure ---- */
  F.sid = svg(720, 210,
    txt(360,26,'Security Identifier (SID) structure','figt','middle') +
    box(40,54,70,44,{t:'S',s:'literal',mono:true}) +
    box(120,54,70,44,{t:'1',s:'revision',mono:true}) +
    box(200,54,90,44,{t:'5',s:'authority',mono:true}) +
    box(300,54,300,44,{t:'21-D1-D2-D3',s:'domain identifier (per domain)',mono:true,cls:'pur'}) +
    box(610,54,70,44,{t:'1104',s:'RID',mono:true,cls:'def'}) +
    txt(360,120,'S-1-5-21-1466...-1177...-2451...-1104','mono2','middle') +
    txt(645,132,'↑ RID','lbl','middle') +
    box(40,150,300,44,{t:'Well-known: S-1-5-18 = SYSTEM',mono:true}) +
    box(360,150,320,44,{t:'500=Admin · 512=Domain Admins · 502=krbtgt',mono:true,cls:'def'}),
    'SID structure S-1-5-21-domain-RID');

  /* ---- Security Descriptor / DACL ---- */
  F.dacl = svg(560, 300,
    txt(280,26,'Security Descriptor  (who can do what to an object)','figt','middle') +
    box(40,44,480,240,{}) +
    txt(60,68,'Security Descriptor','bt') +
    box(60,80,220,40,{t:'Owner',s:'principal SID'}) +
    box(300,80,200,40,{t:'Group',s:'primary group'}) +
    box(60,128,440,86,{cls:'def'}) +
    txt(80,150,'DACL — Discretionary ACL','bt') +
    box(80,158,410,22,{t:'ACE  ALLOW  Domain Admins  → Full Control',mono:true}) +
    box(80,184,410,22,{t:'ACE  ALLOW  user1  → GenericWrite / WriteDACL',mono:true,cls:'off'}) +
    box(60,222,440,50,{cls:'pur'}) +
    txt(80,242,'SACL — System ACL (auditing → Event 4662)','bt'),
    'Security descriptor with DACL and SACL');

  /* ---- Forest / domain / OU tree ---- */
  F.forest = svg(720, 320,
    txt(360,24,'Active Directory logical structure','figt','middle') +
    box(266,42,188,40,{t:'Forest',s:'schema · config · Enterprise Admins',cls:'pur'}) +
    arr(360,82,200,110,{}) + arr(360,82,540,110,{}) +
    box(120,110,160,40,{t:'Domain tree A',s:'corp.local',cls:'def'}) +
    box(460,110,160,40,{t:'Domain tree B',s:'other.local',cls:'def'}) +
    arr(200,150,140,180,{}) + arr(200,150,270,180,{}) +
    box(70,180,140,36,{t:'child.corp.local',s:'child domain'}) +
    box(230,180,120,36,{t:'OU=Servers'}) +
    arr(540,150,540,180,{}) +
    box(470,180,140,36,{t:'OU=Workstations'}) +
    arr(290,216,250,246,{}) + arr(290,216,330,246,{}) +
    box(150,246,120,34,{t:'User',mono:true}) +
    box(290,246,120,34,{t:'Computer$',mono:true}) +
    box(430,246,120,34,{t:'Group',mono:true}) +
    txt(360,304,'Forest = security boundary  ·  Domain = replication/policy boundary  ·  OU = delegation/GPO unit','lbl','middle'),
    'Forest domain OU tree');

  /* ---- Group scope (AGDLP) ---- */
  F.groupscope = svg(720, 210,
    txt(360,26,'Group scopes — AGDLP nesting','figt','middle') +
    box(30,60,140,54,{t:'Account',s:'user / computer'}) +
    arr(170,87,210,87,{kind:'def'}) +
    box(210,60,150,54,{t:'Global group',s:'“who” · same domain',cls:'def'}) +
    arr(360,87,400,87,{kind:'def'}) +
    box(400,60,160,54,{t:'Domain Local group',s:'“what access” · resource',cls:'pur'}) +
    arr(560,87,600,87,{kind:'def'}) +
    box(600,60,100,54,{t:'Permission',s:'on resource',cls:'off'}) +
    txt(30,150,'Global: members from same domain, usable forest-wide.','lbl') +
    txt(30,168,'Domain Local: members from anywhere, grants access only in its own domain.','lbl') +
    txt(30,186,'Universal: members & usable forest-wide (stored in Global Catalog).','lbl'),
    'Group scope AGDLP');

  /* ---- Kerberos AS/TGS/AP flow ---- */
  F.kerberos = svg(720, 320,
    txt(360,22,'Kerberos authentication flow','figt','middle') +
    box(40,54,150,46,{t:'Client',s:'user @ workstation',cls:'off'}) +
    box(285,54,150,46,{t:'KDC (on DC)',s:'AS + TGS · krbtgt key',cls:'def'}) +
    box(540,54,150,46,{t:'Service',s:'SPN target',cls:'pur'}) +
    // AS
    num(120,132,1) + arr(150,132,300,132,{kind:'', t:'AS-REQ (pre-auth timestamp)', dy:-6}) +
    num(360,166,2) + arr(300,166,150,166,{kind:'def', t:'AS-REP → TGT (krbtgt-encrypted, +PAC)', dy:-6}) +
    // TGS
    num(120,208,3) + arr(150,208,300,208,{kind:'', t:'TGS-REQ (present TGT, ask SPN)', dy:-6}) +
    num(360,242,4) + arr(300,242,150,242,{kind:'def', t:'TGS-REP → Service Ticket (service-key enc.)', dy:-6}) +
    // AP
    num(300,284,5) + arr(150,284,560,284,{kind:'pur', t:'AP-REQ → Service Ticket to the service', dy:-6}) +
    txt(360,308,'TGT proves identity to the KDC · Service Ticket proves identity to one service','lbl','middle'),
    'Kerberos AS TGS AP flow');

  /* ---- NTLM challenge/response ---- */
  F.ntlm = svg(720, 280,
    txt(360,22,'NTLM challenge / response','figt','middle') +
    box(40,52,150,46,{t:'Client',cls:'off'}) +
    box(285,52,150,46,{t:'Server',cls:'pur'}) +
    box(540,52,150,46,{t:'DC (netlogon)',s:'validates',cls:'def'}) +
    num(120,128,1) + arr(150,128,300,128,{t:'NEGOTIATE', dy:-6}) +
    num(360,162,2) + arr(300,162,150,162,{kind:'pur', t:'CHALLENGE (server nonce)', dy:-6}) +
    num(120,204,3) + arr(150,204,300,204,{t:'AUTHENTICATE (Net-NTLM response)', dy:-6}) +
    num(430,238,4) + arr(300,238,560,238,{kind:'def', t:'validate response (has NT hash)', dy:-6}) +
    txt(360,266,'Server never learns the NT hash · the response is what relay/cracking targets','lbl','middle'),
    'NTLM challenge response');

  /* ---- Kerberos delegation types ---- */
  F.delegation = svg(720, 250,
    txt(360,24,'Kerberos delegation types','figt','middle') +
    box(30,50,215,150,{cls:'off'}) + txt(137,72,'Unconstrained','bt','middle') +
    txt(45,96,'TRUSTED_FOR_DELEGATION','lbl') + txt(45,116,'stores user TGT in memory','lbl') +
    txt(45,136,'→ impersonate to ANY service','lbl') + txt(45,164,'⚠ most dangerous','lbl') +
    box(253,50,215,150,{cls:'def'}) + txt(360,72,'Constrained','bt','middle') +
    txt(268,96,'msDS-AllowedToDelegateTo','lbl') + txt(268,116,'S4U2Proxy to a fixed list','lbl') +
    txt(268,136,'→ only named SPNs','lbl') + txt(268,164,'protocol transition (S4U2Self)','lbl') +
    box(476,50,214,150,{cls:'pur'}) + txt(583,72,'Resource-based (RBCD)','bt','middle') +
    txt(491,96,'msDS-AllowedToActOnBehalf','lbl') + txt(491,116,'set ON the TARGET','lbl') +
    txt(491,136,'→ target trusts the source','lbl') + txt(491,164,'common abuse via write-perm','lbl') +
    txt(360,224,'All rely on S4U extensions; the attribute location differs (source vs resource object)','lbl','middle'),
    'Kerberos delegation types');

  /* ---- PAC inside TGT ---- */
  F.pac = svg(560, 250,
    txt(280,24,'PAC — authorization data inside the ticket','figt','middle') +
    box(60,44,440,150,{cls:'def'}) + txt(80,68,'TGT / Service Ticket  (encrypted with krbtgt / service key)','bt') +
    box(80,80,400,26,{t:'client name · realm · ticket flags · session key',mono:true}) +
    box(80,112,400,74,{cls:'pur'}) + txt(100,134,'PAC (Privilege Attribute Certificate)','bt') +
    box(100,142,360,18,{t:'User SID + Group SIDs + RIDs (authorization)',mono:true}) +
    box(100,164,360,16,{t:'KDC signature + server signature (integrity)',mono:true}) +
    txt(280,218,'The service reads the PAC for group membership — no extra DC lookup needed','lbl','middle'),
    'PAC inside Kerberos ticket');

  /* ---- PKINIT (cert -> TGT) ---- */
  F.pkinit = svg(720, 240,
    txt(360,24,'PKINIT — certificate-based Kerberos','figt','middle') +
    box(40,52,150,46,{t:'Client',s:'has a certificate',cls:'off'}) +
    box(285,52,150,46,{t:'KDC (DC)',s:'trusts the CA',cls:'def'}) +
    box(540,52,150,46,{t:'AD CS / CA',s:'issued the cert',cls:'pur'}) +
    num(430,120,0) + arr(540,120,360,120,{kind:'pur', t:'(cert enrolled earlier)', dy:-6, dash:true}) +
    num(120,158,1) + arr(150,158,300,158,{t:'AS-REQ signed with cert private key', dy:-6}) +
    num(360,196,2) + arr(300,196,150,196,{kind:'def', t:'AS-REP → TGT (identity from cert SAN/SID)', dy:-6}) +
    txt(360,226,'UnPAC-the-hash: the TGT/PAC can also reveal the account’s NT hash','lbl','middle'),
    'PKINIT certificate to TGT');

  /* ---- OAuth / PRT token flow ---- */
  F.prt = svg(720, 270,
    txt(360,22,'Entra tokens & PRT (cloud SSO)','figt','middle') +
    box(40,50,160,48,{t:'Device / Client',s:'Entra-joined',cls:'off'}) +
    box(300,50,150,48,{t:'Entra ID',s:'token issuer',cls:'def'}) +
    box(545,50,150,48,{t:'Cloud app',s:'M365 / Azure',cls:'pur'}) +
    num(170,124,1) + arr(200,124,300,124,{t:'authenticate (+device key)', dy:-6}) +
    num(360,158,2) + arr(300,158,200,158,{kind:'def', t:'PRT (device-bound) + session key', dy:-6}) +
    num(230,196,3) + arr(200,196,300,196,{t:'PRT-cookie → request tokens', dy:-6}) +
    num(360,230,4) + arr(300,230,545,230,{kind:'pur', t:'Access token (JWT) + Refresh token', dy:-6}) +
    txt(360,258,'PRT = SSO primitive; access token is short-lived, refresh token renews it','lbl','middle'),
    'Entra PRT and token flow');

  /* ---- DC / GC / replication ---- */
  F.dc = svg(720, 240,
    txt(360,24,'Domain Controllers & replication (multi-master)','figt','middle') +
    box(120,60,180,70,{t:'DC1',s:'KDC · LDAP · NTDS.dit',cls:'def'}) +
    box(420,60,180,70,{t:'DC2 (+ Global Catalog)',s:'3268/3269',cls:'def'}) +
    arr(300,86,420,86,{kind:'pur', t:'replicate (DRSUAPI/USN)', dy:-6}) +
    arr(420,110,300,110,{kind:'pur', dy:14}) +
    box(120,168,180,44,{t:'Client',s:'DC locator → nearest DC',cls:'off'}) +
    arr(210,168,210,130,{t:'LDAP 389 / Kerberos 88', dy:0}) +
    box(420,168,180,44,{t:'FSMO roles',s:'PDC/RID/Schema/Infra/Naming'}) +
    txt(360,232,'Every writable DC holds a full copy; changes replicate; some roles are single-master (FSMO)','lbl','middle'),
    'Domain controllers and replication');

  /* ---- Logon types ---- */
  F.logontype = svg(720, 250,
    txt(360,24,'Common Windows logon types (Event 4624)','figt','middle') +
    box(40,48,320,30,{t:'Type 2 — Interactive (console / at keyboard)',mono:true}) +
    box(40,84,320,30,{t:'Type 3 — Network (SMB, remote access)',mono:true,cls:'def'}) +
    box(40,120,320,30,{t:'Type 4 — Batch (scheduled task)',mono:true}) +
    box(40,156,320,30,{t:'Type 5 — Service (service start)',mono:true}) +
    box(380,48,300,30,{t:'Type 8 — NetworkCleartext (basic auth)',mono:true,cls:'off'}) +
    box(380,84,300,30,{t:'Type 9 — NewCredentials (runas /netonly)',mono:true,cls:'off'}) +
    box(380,120,300,30,{t:'Type 10 — RemoteInteractive (RDP)',mono:true,cls:'pur'}) +
    box(380,156,300,30,{t:'Type 11 — CachedInteractive (cached creds)',mono:true}) +
    txt(360,214,'Type 3 dominates lateral movement; Type 10 = RDP; Type 9 = pass-the-hash style runas','lbl','middle'),
    'Windows logon types');

  /* ---- Credential dumping sources ---- */
  F.creddump = svg(720, 250,
    txt(360,24,'資格情報ダンプ — 秘密はどこにあるか','figt','middle') +
    box(20,50,128,50,{t:'LSASS メモリ',s:'logon session',cls:'def'}) +
    box(160,50,128,50,{t:'SAM ハイブ',s:'local accounts'}) +
    box(300,50,128,50,{t:'NTDS.dit (DC)',s:'AD database',cls:'off'}) +
    box(440,50,128,50,{t:'LSA Secrets',s:'HKLM\\SECURITY'}) +
    box(580,50,120,50,{t:'DCC2 キャッシュ',s:'domain cache'}) +
    arr(84,100,84,140,{kind:'def'}) + arr(224,100,224,140,{}) + arr(364,100,364,140,{kind:'off'}) + arr(504,100,504,140,{}) + arr(640,100,640,140,{}) +
    txt(84,156,'NTハッシュ / TGT','lbl','middle') + txt(84,170,'平文(WDigest)','lbl','middle') +
    txt(224,156,'ローカル','lbl','middle') + txt(224,170,'NTハッシュ','lbl','middle') +
    txt(364,156,'全ドメイン','lbl','middle') + txt(364,170,'ハッシュ(DCSync)','lbl','middle') +
    txt(504,156,'サービス平文','lbl','middle') + txt(504,170,'マシン鍵','lbl','middle') +
    txt(640,156,'オフライン','lbl','middle') + txt(640,170,'解読用検証子','lbl','middle') +
    txt(360,210,'T1003 系の総称。防御は LSA Protection(PPL) / Credential Guard / SAM-NTDS へのアクセス監査','lbl','middle') +
    txt(360,228,'mimikatz・secretsdump・procdump・nanodump 等が代表ツール','lbl','middle'),
    'Credential dumping sources');

  /* ---- Pass-the-Hash ---- */
  F.pth = svg(720, 230,
    txt(360,24,'Pass-the-Hash (PtH) — 平文不要のNTLM再利用','figt','middle') +
    box(40,54,170,50,{t:'攻撃者',s:'NTハッシュを所持',cls:'off'}) +
    box(285,54,150,50,{t:'標的サービス',s:'SMB/WMI…',cls:'pur'}) +
    box(530,54,160,50,{t:'DC (netlogon)',s:'検証',cls:'def'}) +
    num(120,132,1) + arr(210,132,285,132,{t:'NTLM AUTH（応答=NTハッシュで計算）', dy:-6}) +
    num(430,166,2) + arr(435,166,530,166,{kind:'def', t:'pass-through 検証', dy:-6}) +
    num(360,200,3) + arr(285,200,210,200,{kind:'pur', t:'アクセス許可（本人になりすまし）', dy:-6}) +
    txt(360,222,'平文パスワードもKerberosも不要。NTハッシュそのものが鍵 = T1550.002','lbl','middle'),
    'Pass-the-Hash');

  /* ---- Ticket attacks: Golden / Silver / PtT ---- */
  F.tickets = svg(720, 250,
    txt(360,24,'チケット攻撃 — Golden / Silver / Pass-the-Ticket','figt','middle') +
    box(24,50,216,150,{cls:'off'}) + txt(132,72,'Golden Ticket','bt','middle') +
    txt(40,96,'krbtgt ハッシュで','lbl') + txt(40,114,'任意ユーザーのTGTを偽造','lbl') +
    txt(40,138,'→ ドメイン全体・オフライン','lbl') + txt(40,166,'T1558.001 / KDC不要','lbl') +
    box(252,50,216,150,{cls:'pur'}) + txt(360,72,'Silver Ticket','bt','middle') +
    txt(268,96,'サービスアカウント鍵で','lbl') + txt(268,114,'特定サービスのST(TGS)偽造','lbl') +
    txt(268,138,'→ 単一サービス・KDC経由せず','lbl') + txt(268,166,'T1558.002','lbl') +
    box(480,50,216,150,{cls:'def'}) + txt(588,72,'Pass-the-Ticket','bt','middle') +
    txt(496,96,'窃取した正規TGT/STを','lbl') + txt(496,114,'メモリに注入して認証','lbl') +
    txt(496,138,'→ 偽造でなく再利用','lbl') + txt(496,166,'T1550.003','lbl') +
    txt(360,224,'TGT=krbtgt鍵で暗号化 / ST=サービス鍵で暗号化。偽造チケットはKDCの発行記録(4768)を残さない','lbl','middle'),
    'Golden Silver Pass-the-Ticket');

  /* ---- DCSync ---- */
  F.dcsync = svg(720, 220,
    txt(360,24,'DCSync — DCになりすまして複製要求','figt','middle') +
    box(60,58,190,54,{t:'攻撃者',s:'Get-Changes 権限を保有',cls:'off'}) +
    box(470,58,190,54,{t:'正規 DC',s:'krbtgt含む全アカウント',cls:'def'}) +
    num(300,96,1) + arr(250,96,470,96,{t:'MS-DRSR DsGetNCChanges（DC を偽装）', dy:-6}) +
    num(360,140,2) + arr(470,140,250,140,{kind:'def', t:'応答: 各アカウントのハッシュ・鍵', dy:-6}) +
    txt(360,180,'レプリケーション権限(DS-Replication-Get-Changes/-All)があればDC上でコード実行せずに窃取','lbl','middle') +
    txt(360,200,'検知: 非DC主体からの 4662(複製GUID) / MDI Suspected DCSync = T1003.006','lbl','middle'),
    'DCSync');

  /* ---- NTLM Relay ---- */
  F.ntlmrelay = svg(720, 230,
    txt(360,24,'NTLM リレー — 認証を別サービスへ中継','figt','middle') +
    box(40,58,150,50,{t:'被害者',s:'マシン/ユーザー',cls:'def'}) +
    box(285,58,150,50,{t:'攻撃者 (中継)',s:'ntlmrelayx',cls:'off'}) +
    box(530,58,160,50,{t:'標的サービス',s:'SMB/LDAP/ADCS/RPC',cls:'pur'}) +
    num(120,132,1) + arr(190,132,285,132,{kind:'def', t:'強制/誘導した NTLM 認証', dy:-6}) +
    num(430,166,2) + arr(360,166,530,166,{t:'被害者の資格情報のまま中継', dy:-6}) +
    num(430,200,3) + arr(530,200,435,200,{kind:'pur', t:'被害者権限で操作(ESC8/RBCD付与等)', dy:-6}) +
    txt(360,222,'防御の要は SMB/LDAP 署名と EPA(チャネルバインディング)。ハッシュ解読は不要','lbl','middle'),
    'NTLM Relay');

  /* ---- Coercion ---- */
  F.coercion = svg(720, 210,
    txt(360,24,'強制認証 (Coercion) — 認証を吐かせる','figt','middle') +
    box(40,56,180,54,{t:'攻撃者',s:'低権限で可',cls:'off'}) +
    box(300,56,150,54,{t:'標的マシン',s:'DC/サーバ',cls:'def'}) +
    box(540,56,150,54,{t:'攻撃者/中継先',s:'listener',cls:'pur'}) +
    num(255,94,1) + arr(220,94,300,94,{t:'RPC 呼び出し (MS-RPRN/EFSRPC/DFSNM)', dy:-6}) +
    num(490,140,2) + arr(450,140,540,140,{kind:'def', t:'標的マシンが攻撃者宛に認証(マシンアカウント$)', dy:-6}) +
    txt(360,182,'PetitPotam / PrinterBug 等。得た認証を NTLM リレーや Unconstrained 委任と連結する起点','lbl','middle'),
    'Authentication Coercion');

  /* ---- Process Injection ---- */
  F.procinjection = svg(720, 230,
    txt(360,24,'プロセスインジェクション','figt','middle') +
    box(40,56,180,120,{t:'攻撃者プロセス',cls:'off'}) +
    box(470,56,210,120,{cls:'pur'}) + txt(575,78,'正規プロセス (標的)','bt','middle') +
    box(490,92,170,30,{t:'注入コード',mono:true,cls:'off'}) +
    box(490,128,170,30,{t:'元のスレッド',mono:true}) +
    num(260,86,1) + arr(220,86,470,86,{t:'OpenProcess', dy:-6}) +
    num(260,116,2) + arr(220,116,470,116,{t:'VirtualAllocEx + WriteProcessMemory', dy:-6}) +
    num(260,150,3) + arr(220,150,470,150,{kind:'off', t:'CreateRemoteThread / APC / hollowing', dy:-6}) +
    txt(360,200,'正規プロセスの権限・トークンを借用し検知を回避。EDRはリモートスレッド生成やメモリ書込を監視','lbl','middle'),
    'Process Injection');

  /* ---- Cyber Kill Chain (this site's 7 phases) ---- */
  F.killchain = svg(720, 170,
    txt(360,24,'AD キルチェーン — 7フェーズ','figt','middle') +
    (function(){ var labs=['偵察・列挙','資格情報','中間者・強制','権限昇格','横展開','支配・永続化','トラスト'];
      var s='', x=14, w=90, gap=10;
      for(var i=0;i<7;i++){ s+=box(x,60,w,44,{t:String(i+1).padStart(2,'0'),s:labs[i]}); if(i<6) s+=arr(x+w,82,x+w+gap,82,{kind:i<3?'off':i<5?'pur':'def'}); x+=w+gap; }
      return s; })() +
    txt(360,134,'各段で検知・遮断点がある。攻撃マップはこの7フェーズで技術を整理している','lbl','middle') +
    txt(360,152,'偵察→資格情報→中間者/強制→権限昇格→横展開→支配→トラスト','lbl','middle'),
    'AD kill chain phases');

  /* ---- SOC detection stack ---- */
  F.socstack = svg(720, 260,
    txt(360,24,'SOC 検知スタック — 何をどこで見るか','figt','middle') +
    box(30,54,150,44,{t:'エンドポイント',s:'プロセス/メモリ'}) +
    box(30,110,150,44,{t:'ドメインコントローラ',s:'Kerberos/LDAP'}) +
    box(30,166,150,44,{t:'Entra / クラウド',s:'サインイン'}) +
    box(250,54,160,44,{t:'MDE (EDR)',cls:'def'}) +
    box(250,110,160,44,{t:'MDI',s:'ID脅威検知',cls:'def'}) +
    box(250,166,160,44,{t:'Entra ID Protection',cls:'def'}) +
    arr(180,76,250,76,{kind:'def'}) + arr(180,132,250,132,{kind:'def'}) + arr(180,188,250,188,{kind:'def'}) +
    box(470,90,110,80,{t:'XDR',s:'横断相関',cls:'pur'}) +
    arr(410,76,470,110,{kind:'pur'}) + arr(410,132,470,130,{kind:'pur'}) + arr(410,188,470,150,{kind:'pur'}) +
    box(610,90,90,80,{t:'SIEM',s:'Sentinel',cls:'off'}) +
    arr(580,130,610,130,{kind:'off'}) +
    txt(360,238,'能動調査は Advanced Hunting(KQL)。IOCだけでなく振る舞い(IOA/TTP)で検知する','lbl','middle'),
    'SOC detection stack');

  /* ---- Tier model ---- */
  F.tiermodel = svg(720, 220,
    txt(360,24,'階層管理モデル (Tiering) — 資格情報の分離','figt','middle') +
    box(120,48,480,42,{t:'Tier 0 — DC・krbtgt・CA・Domain Admins（最重要）',cls:'off'}) +
    box(120,100,480,42,{t:'Tier 1 — サーバ・アプリ・DBMS',cls:'pur'}) +
    box(120,152,480,42,{t:'Tier 2 — ワークステーション・一般ユーザー',cls:'def'}) +
    txt(360,208,'上位Tierの資格情報を下位の端末で使わない。PAW(専用管理端末)で汚染経路を断つ','lbl','middle'),
    'Tiered administration model');

  /* ---- DLL search order / hijacking ---- */
  F.dllhijack = svg(720, 230,
    txt(360,24,'DLL 探索順とハイジャック','figt','middle') +
    box(30,54,150,46,{t:'foo.exe',s:'foo.dll を要求',cls:'pur'}) +
    txt(210,50,'探索順（既定・SafeDllSearchMode有効時）','lbl') +
    box(210,64,86,34,{t:'① EXEフォルダ',mono:true}) +
    box(304,64,80,34,{t:'② System32',mono:true}) +
    box(392,64,70,34,{t:'③ System',mono:true}) +
    box(470,64,80,34,{t:'④ Windows',mono:true}) +
    box(558,64,60,34,{t:'⑤ CWD',mono:true}) +
    box(626,64,64,34,{t:'⑥ PATH',mono:true}) +
    arr(180,81,210,81,{}) + arr(296,81,304,81,{}) + arr(384,81,392,81,{}) + arr(462,81,470,81,{}) + arr(538,81,558,81,{}) + arr(618,81,626,81,{}) +
    box(210,130,180,40,{t:'悪性 foo.dll を①に設置',s:'正規より先に見つかる',cls:'off'}) +
    arr(253,64,253,130,{kind:'off'}) +
    txt(360,196,'正規EXEが攻撃者のDLLをロード（サイドローディング/プロキシで正規機能も維持）= 防御回避・永続化','lbl','middle') +
    txt(360,214,'対策: 完全パス指定・署名検証・WDAC。KnownDLLs は保護対象','lbl','middle'),
    'DLL search order hijacking');

  /* ---- BloodHound attack path ---- */
  F.bloodhound = svg(720, 220,
    txt(360,24,'BloodHound — 攻撃経路(Attack Path)グラフ','figt','middle') +
    box(24,64,120,46,{t:'侵害ユーザー',s:'user1',cls:'off'}) +
    arr(144,87,196,87,{kind:'off', t:'AdminTo', dy:-6}) +
    box(196,64,120,46,{t:'端末',s:'WS01',cls:'server'}) +
    arr(316,87,368,87,{kind:'pur', t:'HasSession', dy:-6}) +
    box(368,64,120,46,{t:'管理者',s:'svc-adm',cls:'admin'}) +
    arr(488,87,540,87,{kind:'def', t:'MemberOf', dy:-6}) +
    box(540,64,150,46,{t:'Domain Admins',cls:'pur'}) +
    txt(360,150,'SharpHoundがACL・セッション・グループ・委任を収集 → グラフDBで最短経路を算出','lbl','middle') +
    txt(360,170,'Cypher: "Shortest Path to Domain Admins"。防御は余分なACL/セッションの棚卸し(Attack Path削減)','lbl','middle') +
    txt(360,196,'認証済みユーザーで収集可能。大量LDAP/SMBセッション列挙が検知シグナル','lbl','middle'),
    'BloodHound attack path');

  /* ---- Cloud authorization planes ---- */
  F.cloudauthz = svg(720, 240,
    txt(360,24,'クラウド認可の3面 — 別々の権限体系','figt','middle') +
    box(24,52,216,150,{cls:'def'}) + txt(132,74,'Entra ディレクトリロール','bt','middle') +
    txt(40,98,'Global Administrator','lbl') + txt(40,116,'Privileged Role Admin 等','lbl') +
    txt(40,140,'→ Entra/M365 のテナント制御','lbl') + txt(40,168,'PIMでJIT有効化','lbl') +
    box(252,52,216,150,{cls:'pur'}) + txt(360,74,'Azure RBAC','bt','middle') +
    txt(268,98,'Owner / Contributor /','lbl') + txt(268,116,'User Access Administrator','lbl') +
    txt(268,140,'→ Azureリソース(ARM)制御','lbl') + txt(268,168,'サブスク/管理グループ単位','lbl') +
    box(480,52,216,150,{cls:'off'}) + txt(588,74,'Graph アクセス許可','bt','middle') +
    txt(496,98,'Application vs Delegated','lbl') + txt(496,116,'RoleManagement.ReadWrite…','lbl') +
    txt(496,140,'→ Graph API での操作範囲','lbl') + txt(496,168,'同意/SP資格情報追加で悪用','lbl') +
    txt(360,224,'3面は独立。Global Admin ≠ Azure Owner。攻撃者はこの境界を跨いで昇格・横移動する','lbl','middle'),
    'Cloud authorization planes');

  /* ---- Autostart / persistence (ASEP) ---- */
  F.asep = svg(720, 230,
    txt(360,24,'自動実行ポイント (ASEP) — 主な永続化場所','figt','middle') +
    box(24,54,214,40,{t:'Run / RunOnce キー',s:'HKLM|HKCU\\...\\CurrentVersion\\Run',mono:true}) +
    box(252,54,216,40,{t:'Winlogon',s:'Shell / Userinit',mono:true}) +
    box(482,54,214,40,{t:'スタートアップ フォルダ',s:'shell:startup'}) +
    box(24,104,214,40,{t:'サービス / SCM',s:'CreateService',cls:'def'}) +
    box(252,104,216,40,{t:'スケジュールタスク',s:'schtasks / atexec',cls:'def'}) +
    box(482,104,214,40,{t:'IFEO / COMハイジャック',s:'Debugger / CLSID',cls:'off'}) +
    arr(131,144,300,168,{}) + arr(360,144,360,168,{}) + arr(589,144,420,168,{}) +
    box(280,168,160,34,{t:'起動時 / ログオン時に自動実行',cls:'off'}) +
    txt(360,220,'Autoruns で棚卸し。多くは 4657(レジストリ変更)/Sysmon 13 や新規サービス 7045 で検知','lbl','middle'),
    'Autostart extension points');

  /* ---- Normal process tree / ancestry ---- */
  F.proctree = svg(760, 380,
    txt(380,24,'正常なプロセス系譜(親子関係)','figt','middle') +
    box(310,40,140,32,{t:'System (PID 4)',s:'カーネル'}) +
    arr(380,72,380,90,{}) +
    box(310,90,140,34,{t:'smss.exe',s:'セッションマネージャ'}) +
    arr(360,124,190,148,{}) + arr(400,124,590,148,{}) +
    box(100,148,180,34,{t:'wininit.exe',s:'セッション0'}) +
    box(500,148,180,34,{t:'winlogon.exe',s:'対話セッション'}) +
    arr(190,182,105,206,{}) + arr(190,182,270,206,{}) +
    box(30,206,150,34,{t:'services.exe',s:'SCM',cls:'def'}) +
    box(200,206,140,34,{t:'lsass.exe',s:'LSA / 資格情報',cls:'def'}) +
    arr(105,240,95,264,{}) + arr(105,240,260,264,{}) +
    box(20,264,150,34,{t:'svchost.exe -k',s:'共有サービス',mono:true}) +
    box(185,264,150,34,{t:'spoolsv.exe 等',s:'サービス'}) +
    arr(590,182,590,206,{}) +
    box(500,206,180,34,{t:'userinit.exe',s:'(即終了)'}) +
    arr(590,240,590,264,{}) +
    box(500,264,180,34,{t:'explorer.exe',s:'デスクトップ'}) +
    arr(590,298,590,320,{}) +
    box(500,320,180,32,{t:'cmd / powershell',s:'ユーザーのシェル'}) +
    box(20,312,320,54,{cls:'off'}) +
    txt(180,330,'異常シグナル(要調査)','bt','middle') +
    txt(180,348,'lsass親≠wininit・引数なしsvchost','lbl','middle') +
    txt(180,362,'Office製品→powershell 等','lbl','middle'),
    'Normal Windows process tree');

  /* ---- Alert triage / confusion matrix ---- */
  F.triage = svg(620, 300,
    txt(310,24,'トリアージと混同行列(FP / TP / FN / TN)','figt','middle') +
    txt(275,60,'アラート発報 (+)','lbl','middle') + txt(445,60,'発報なし (−)','lbl','middle') +
    box(200,72,150,66,{t:'TP 真陽性',s:'脅威を正しく検知',cls:'def'}) +
    box(360,72,150,66,{t:'FN 偽陰性',s:'検知漏れ=最も危険',cls:'off'}) +
    box(200,146,150,66,{t:'FP 偽陽性',s:'誤検知(工数浪費)',cls:'off'}) +
    box(360,146,150,66,{t:'TN 真陰性',s:'正常を正常と判定'}) +
    txt(192,112,'悪性','lbl','end') + txt(192,186,'正常','lbl','end') +
    txt(310,244,'流れ: 発報 → エンリッチ → 検証 → エスカレ / クローズ','lbl','middle') +
    txt(310,270,'FP多発=アラート疲れ→TP見落とし。チューニングで精度改善','lbl','middle'),
    'Triage confusion matrix');

  /* ---- Pyramid of Pain ---- */
  F.pyramid = svg(640, 340,
    txt(320,24,'痛みのピラミッド(Pyramid of Pain)','figt','middle') +
    box(240,70,160,38,{t:'TTPs',s:'最も困難',cls:'off'}) +
    box(200,110,240,38,{t:'ツール',s:'困難',cls:'pur'}) +
    box(160,150,320,38,{t:'ネットワーク/ホストアーティファクト',s:'煩わしい',cls:'def'}) +
    box(120,190,400,38,{t:'ドメイン名',s:'単純',cls:'def'}) +
    box(80,230,480,38,{t:'IP アドレス',s:'簡単'}) +
    box(40,270,560,38,{t:'ハッシュ値',s:'些細'}) +
    arr(24,300,24,96,{kind:'off'}) +
    txt(16,302,'易','lbl','middle') + txt(16,92,'難','lbl','middle') +
    txt(320,326,'下=変更容易で陳腐化 / 上=検知で攻撃者に最大の痛み(IOA・TTP検知が有効)','lbl','middle'),
    'Pyramid of Pain');

  /* ---- Diamond Model ---- */
  F.diamondmodel = svg(560, 342,
    txt(280,24,'ダイヤモンドモデル(侵入分析)','figt','middle') +
    box(210,48,140,40,{t:'Adversary',s:'敵対者',cls:'off'}) +
    box(385,152,150,46,{t:'Capability',s:'能力 / TTP',cls:'pur'}) +
    box(210,258,140,40,{t:'Victim',s:'被害者',cls:'def'}) +
    box(25,152,150,46,{t:'Infrastructure',s:'C2 / ドメイン / IP',cls:'pur'}) +
    arr(345,86,452,152,{}) + arr(452,198,348,258,{}) + arr(215,258,110,198,{}) + arr(110,152,215,86,{}) +
    txt(280,322,'1頂点から辺をたどり他頂点へピボット(相関・帰属)。Kill Chain / ATT&CK と相補','lbl','middle'),
    'Diamond Model of Intrusion Analysis');

  /* ---- Logon events / logon types ---- */
  F.logonevents = svg(720, 320,
    txt(360,24,'ログオンイベントと Logon Type','figt','middle') +
    box(30,44,160,40,{t:'4624',s:'ログオン成功',cls:'def'}) +
    box(200,44,160,40,{t:'4625',s:'ログオン失敗',cls:'off'}) +
    box(370,44,150,40,{t:'4634 / 4647',s:'ログオフ'}) +
    box(530,44,160,40,{t:'4648',s:'明示的資格情報',cls:'pur'}) +
    txt(62,112,'Type','lbl','middle') + txt(150,112,'意味','lbl') + txt(360,112,'攻撃 / トリアージ観点','lbl') +
    box(40,120,44,28,{t:'2',mono:true}) + txt(100,139,'対話(コンソール)','lbl') + txt(360,139,'コンソール / 物理アクセス','lbl') +
    box(40,156,44,28,{t:'3',mono:true,cls:'off'}) + txt(100,175,'ネットワーク','lbl') + txt(360,175,'PtH・SMB共有・横展開の主戦場','lbl') +
    box(40,192,44,28,{t:'9',mono:true,cls:'off'}) + txt(100,211,'NewCredentials','lbl') + txt(360,211,'runas /netonly・PtH の痕跡','lbl') +
    box(40,228,44,28,{t:'10',mono:true,cls:'off'}) + txt(100,247,'RemoteInteractive','lbl') + txt(360,247,'RDP — 侵害時の主要経路','lbl') +
    box(40,264,44,28,{t:'5',mono:true}) + txt(100,283,'サービス','lbl') + txt(360,283,'サービス実行(7045と相関)','lbl'),
    'Logon events and logon types');

  /* ---- Account / group management events ---- */
  F.acctmgmtevents = svg(700, 300,
    txt(350,24,'アカウント / グループ管理イベント','figt','middle') +
    lane(24,44,330,150,'アカウント操作 (Security)','') +
    box(36,74,140,30,{t:'4720',s:'ユーザー作成',cls:'def'}) +
    box(186,74,156,30,{t:'4726',s:'ユーザー削除'}) +
    box(36,110,140,30,{t:'4722 / 4725',s:'有効化 / 無効化'}) +
    box(186,110,156,30,{t:'4738',s:'アカウント変更'}) +
    box(36,146,306,30,{t:'4740',s:'ロックアウト(スプレー副作用)',cls:'off'}) +
    lane(370,44,306,150,'グループ加入','') +
    box(382,74,282,30,{t:'4728',s:'グローバルグループへ追加',cls:'def'}) +
    box(382,110,282,30,{t:'4732 / 4756',s:'ローカル / ユニバーサル',cls:'def'}) +
    box(382,146,282,30,{t:'特権グループ加入=最優先',s:'Domain / Enterprise Admins',cls:'off'}) +
    box(24,212,652,42,{cls:'off'}) +
    txt(350,228,'典型シグネチャ','bt','middle') +
    txt(350,246,'4720(ユーザー作成) → 4728(Domain Admins 加入)= 攻撃者の特権アカウント作成','lbl','middle'),
    'Account and group management events');

  /* ---- Email authentication SPF/DKIM/DMARC ---- */
  F.emailauth = svg(720, 290,
    txt(360,24,'メール認証(SPF / DKIM / DMARC)','figt','middle') +
    box(180,50,520,44,{t:'DNS 公開レコード',s:'SPF(TXT)・DKIM公開鍵・DMARCポリシー(p=none/quarantine/reject)'}) +
    arr(250,94,250,120,{dash:true}) + arr(430,94,430,120,{dash:true}) + arr(620,94,620,120,{dash:true}) +
    box(24,120,110,48,{t:'送信サーバ',s:'From: 差出人'}) +
    arr(134,144,180,144,{kind:'off'}) +
    box(180,120,140,48,{t:'SPF',s:'送信元IPを検証',cls:'def'}) +
    arr(320,144,360,144,{kind:'off'}) +
    box(360,120,140,48,{t:'DKIM',s:'署名を検証',cls:'def'}) +
    arr(500,144,540,144,{kind:'off'}) +
    box(540,120,160,48,{t:'DMARC',s:'整合性 + ポリシー',cls:'pur'}) +
    txt(360,210,'解析: Authentication-Results と From / Return-Path / Reply-To の不一致を確認','lbl','middle') +
    txt(360,236,'DMARC=reject でも類似ドメイン・表示名詐称・正規ドメイン侵害は通り得る','lbl','middle'),
    'Email authentication SPF DKIM DMARC');

  /* ---- Ransomware operator kill chain ---- */
  F.ransomware = svg(760, 206,
    txt(380,22,'ランサムウェアの運用型キルチェーン','figt','middle') +
    box(20,50,96,48,{t:'初期侵入',cls:'off'}) +
    box(126,50,96,48,{t:'探索'}) +
    box(232,50,96,48,{t:'権限昇格'}) +
    box(338,50,96,48,{t:'横展開'}) +
    box(444,50,96,48,{t:'持ち出し'}) +
    box(550,50,96,48,{t:'暗号化',cls:'off'}) +
    box(656,50,96,48,{t:'恐喝',cls:'off'}) +
    arr(116,74,126,74,{}) + arr(222,74,232,74,{}) + arr(328,74,338,74,{}) + arr(434,74,444,74,{}) + arr(540,74,550,74,{}) + arr(646,74,656,74,{}) +
    box(20,116,520,30,{t:'← 検知の勝機:暗号化前に止める',cls:'def'}) +
    box(550,116,202,30,{t:'暗号化・恐喝=手遅れ',cls:'off'}) +
    txt(380,178,'二重恐喝=暗号化前にデータ窃取し公開を脅迫。RaaSで分業、正規ツール(PsExec/GPO)で全社展開','lbl','middle'),
    'Ransomware operator kill chain');

  /* ---- Malware taxonomy ---- */
  F.malwaretypes = svg(720, 300,
    txt(360,24,'マルウェア分類(機能別)','figt','middle') +
    box(20,50,216,60,{t:'ローダー / ドロッパー',s:'次段を取得・実行'}) +
    box(252,50,216,60,{t:'RAT',s:'遠隔操作'}) +
    box(484,50,216,60,{t:'インフォスティーラー',s:'資格情報 / Cookie 窃取',cls:'off'}) +
    box(20,120,216,60,{t:'ボット / ボットネット',s:'C2配下で一斉操作'}) +
    box(252,120,216,60,{t:'ランサムウェア',s:'暗号化・恐喝',cls:'off'}) +
    box(484,120,216,60,{t:'ワイパー',s:'データ破壊',cls:'off'}) +
    box(20,190,216,60,{t:'ルートキット / ブートキット',s:'隠蔽・持続'}) +
    box(252,190,216,60,{t:'バンキング型',s:'金融詐取'}) +
    box(484,190,216,60,{t:'クリプトマイナー',s:'資源悪用'}) +
    txt(360,282,'スティーラーのセッションCookie窃取はMFAを迂回→駆除+資格情報 / トークン失効まで対応','lbl','middle'),
    'Malware taxonomy');

  /* ---- Remote service execution / lateral movement ---- */
  F.remoteexec = svg(720, 290,
    txt(360,24,'リモートサービス実行・管理共有','figt','middle') +
    box(24,110,150,64,{t:'攻撃元',s:'管理者権限 / PtH',cls:'off'}) +
    arr(174,142,250,142,{kind:'off',t:'SMB 445',dy:-6}) +
    box(250,84,220,34,{t:'PsExec',s:'ADMIN$へ配置→SCMで起動',cls:'off'}) +
    box(250,126,220,34,{t:'WMIExec',s:'Win32_Process.Create',cls:'off'}) +
    box(250,168,220,34,{t:'DCOM / SMBExec',s:'COM / 名前付きパイプ',cls:'off'}) +
    arr(470,101,514,120,{kind:'off'}) + arr(470,143,514,150,{kind:'off'}) + arr(470,185,514,180,{kind:'off'}) +
    box(516,80,178,150,{cls:'def'}) + txt(605,100,'標的ホスト','bt','middle') +
    box(526,112,158,26,{t:'ADMIN$ / C$ / IPC$',mono:true}) +
    box(526,144,158,26,{t:'services.exe (SCM)'}) +
    box(526,176,158,26,{t:'WmiPrvSE.exe'}) +
    txt(360,258,'検知: 5140/5145(共有)・7045/4697(サービス)・4624 Type3・WmiPrvSE配下の子。PtHと併用','lbl','middle'),
    'Remote service execution');

  /* ---- AD CS ESC escalation ---- */
  F.adcsesc = svg(720, 292,
    txt(360,24,'AD CS ドメイン昇格(ESC)','figt','middle') +
    num(89,88,'1') + num(249,88,'2') + num(419,88,'3') + num(594,88,'4') +
    box(24,100,130,56,{t:'低権限ユーザー',s:'一般ドメイン',cls:'off'}) +
    arr(154,128,174,128,{kind:'off'}) +
    box(174,100,150,56,{t:'脆弱な設定',s:'テンプレ / CA / 登録EP',cls:'off'}) +
    arr(324,128,344,128,{kind:'off'}) +
    box(344,100,150,56,{t:'証明書要求',s:'SAN に DA を指定',cls:'off'}) +
    arr(494,128,514,128,{kind:'off'}) +
    box(514,100,160,56,{t:'PKINIT 認証',s:'高権限として認証',cls:'pur'}) +
    box(24,190,160,30,{t:'ESC1: SAN任意指定'}) +
    box(194,190,160,30,{t:'ESC6: CA側でSAN付与'}) +
    box(364,190,150,30,{t:'ESC8: NTLMリレー'}) +
    box(524,190,150,30,{t:'ESC13: OID→グループ'}) +
    txt(360,254,'証明書は失効/パスワード変更に強く永続的。監視: 4886/4887・異常SAN・Web登録へのNTLM','lbl','middle'),
    'AD CS ESC escalation');

  /* ---- Hybrid authentication methods ---- */
  F.hybridauth = svg(740, 310,
    txt(370,24,'ハイブリッド認証方式(PHS / PTA / フェデレーション)','figt','middle') +
    box(40,44,150,34,{t:'オンプレ AD'}) +
    arr(190,61,550,61,{kind:'',t:'Entra Connect 同期',dy:-4}) +
    box(550,44,150,34,{t:'Entra ID'}) +
    box(24,100,226,156,{cls:'def'}) + txt(137,122,'PHS(ハッシュ同期)','bt','middle') +
    txt(36,148,'ADハッシュのハッシュを','lbl') + txt(36,166,'Entraへ同期→クラウド認証','lbl') +
    box(36,192,202,50,{cls:'off'}) + txt(137,210,'攻撃対象','bs','middle') + txt(137,228,'同期サーバ / MSOL_アカウント','lbl','middle') +
    box(258,100,224,156,{cls:'def'}) + txt(370,122,'PTA(パススルー)','bt','middle') +
    txt(270,148,'オンプレエージェントが','lbl') + txt(270,166,'認証を中継(ハッシュ無)','lbl') +
    box(270,192,200,50,{cls:'off'}) + txt(370,210,'攻撃対象','bs','middle') + txt(370,228,'悪性エージェントで資格情報傍受','lbl','middle') +
    box(490,100,226,156,{cls:'pur'}) + txt(603,122,'フェデレーション','bt','middle') +
    txt(502,148,'オンプレIdPがトークンに','lbl') + txt(502,166,'署名(ADFS 等)','lbl') +
    box(502,192,202,50,{cls:'off'}) + txt(603,210,'攻撃対象','bs','middle') + txt(603,228,'署名証明書窃取→Golden SAML','lbl','middle') +
    txt(370,286,'Entra Connect サーバはテナント全体に直結する Tier0 資産','lbl','middle'),
    'Hybrid authentication methods');

  /* ---- noPac / sAMAccountName spoofing ---- */
  F.nopac = svg(720, 264,
    txt(360,22,'noPac / sAMAccountName スプーフィング','figt','middle') +
    box(24,54,200,54,{t:'① マシンアカウント作成',s:'MAQ=10 で誰でも可'}) +
    box(260,54,200,54,{t:'② DC名へ改名',s:'sAMAccountName=DC01',cls:'off'}) +
    box(496,54,200,54,{t:'③ TGT 取得',s:'改名アカウントで'}) +
    arr(224,81,260,81,{kind:'off'}) + arr(460,81,496,81,{kind:'off'}) +
    arr(596,108,596,144,{kind:'off'}) +
    box(496,144,200,54,{t:'④ アカウント削除/改名',s:'DC01 を解決不能に',cls:'off'}) +
    box(260,144,200,54,{t:'⑤ KDC が $ を補完',s:'実在 DC01$ になりすまし',cls:'off'}) +
    box(24,144,200,54,{t:'⑥ DCSync',s:'ドメイン掌握',cls:'off'}) +
    arr(496,171,460,171,{kind:'off'}) + arr(260,171,224,171,{kind:'off'}) +
    txt(360,232,'CVE-2021-42278 + 42287 の連鎖。監視: 4741/4742/4781(旧名末尾$→DC名)。対策: KB5008102+380, MAQ=0','lbl','middle'),
    'noPac sAMAccountName spoofing');

  /* ---- Potato / SeImpersonate ---- */
  F.potato = svg(700, 282,
    txt(350,22,'Potato 系:SeImpersonate による SYSTEM 昇格','figt','middle') +
    box(24,96,158,64,{t:'低特権サービス',s:'SeImpersonate 保有',cls:'off'}) +
    arr(182,128,238,128,{kind:'off',t:'①誘発',dy:-6}) +
    box(238,96,196,64,{t:'攻撃者エンドポイント',s:'名前付きパイプ / RPC / DCOM',cls:'off'}) +
    box(238,196,196,48,{t:'SYSTEMコンポーネント',s:'spoolss / EFSRPC 等'}) +
    arr(336,196,336,160,{kind:'',t:'②SYSTEM認証',dy:2}) +
    arr(434,128,490,128,{kind:'off',t:'③トークン',dy:-6}) +
    box(490,96,186,64,{t:'SYSTEMトークン',s:'SeImpersonateで偽装',cls:'off'}) +
    arr(583,160,583,196,{kind:'off'}) +
    box(490,196,186,48,{t:'④ SYSTEMで実行',s:'任意プロセス起動',cls:'off'}) +
    txt(350,266,'変種は誘発手段の差(PrintSpoofer/GodPotato/EfsPotato…)。監視:4673/4674・異常な名前付きパイプ(Sysmon17/18)','lbl','middle'),
    'Potato SeImpersonate privilege escalation');

  /* ---- u2u: User-to-User (U2U) 認証とENC-TKT-IN-SKEY ---- */
  F.u2u = svg(720, 336, txt(360,20,'User-to-User (U2U) 認証:サービスチケットの暗号化鍵が変わる仕組み','figt','middle') + lane(16,40,688,118,'① 通常のTGS-REQ:相手(サービス)が長期鍵を保持','def') + box(30,72,192,60,{t:'Client',s:'サービスへアクセス要求'}) + box(284,72,200,60,{t:'KDC',s:'TGS Exchange',cls:'def'}) + box(520,64,180,80,{cls:'def'}) + txt(610,86,'Service Ticket','bt','middle') + txt(610,104,'サービスの長期鍵で暗号化','lbl','middle') + txt(610,120,'(NTハッシュ由来)','lbl','middle') + arr(222,102,284,102,{kind:'def',t:'TGS-REQ',dy:-8}) + arr(484,102,520,104,{kind:'def',t:'発行',dy:-8}) + lane(16,172,688,120,'② U2U:additional ticket同梱 + ENC-TKT-IN-SKEY指定','off') + box(30,204,192,80,{cls:'off'}) + txt(126,226,'Client (攻撃者)','bt','middle') + txt(126,244,'相手のTGT(既知の鍵)を保持','lbl','middle') + txt(126,260,'additional ticketとして同梱','lbl','middle') + box(284,204,200,80,{cls:'def'}) + txt(384,226,'KDC','bt','middle') + txt(384,244,'ENC-TKT-IN-SKEY','mono','middle') + txt(384,260,'(KDCOptions bit 28)','lbl','middle') + box(520,204,180,80,{cls:'off'}) + txt(610,226,'Service Ticket','bt','middle') + txt(610,244,'相手TGTのセッション鍵で暗号化','lbl','middle') + txt(610,260,'(攻撃者が既知の鍵)','lbl','middle') + arr(222,244,284,244,{kind:'off',t:'TGS-REQ',dy:-8}) + arr(484,244,520,244,{kind:'off',t:'発行',dy:-8}) + txt(360,316,'U2U(ENC-TKT-IN-SKEY)は相手TGTの鍵で暗号化させ、SPN不要でPACを取得可能にする(Sapphire Ticket等の土台)','lbl','middle'), 'User-to-User (U2U) 認証とENC-TKT-IN-SKEY');

  /* ---- ntlmmic: NTLM MIC と Drop the MIC (CVE-2019-1040) ---- */
  F.ntlmmic = svg(740,510,
  txt(370,22,'NTLM MIC (Message Integrity Code) と Drop the MIC','figt','middle') +
  lane(20,34,700,208,'NTLMv2 認証: MICが3メッセージ全体を保護','def') +
  txt(700,50,'※ MIC (id:integrity の完全性レベルとは別概念)','lbl','end') +
  box(50,64,130,40,{t:'Client',cls:'def'}) +
  box(560,64,130,40,{t:'Server',cls:'def'}) +
  arr(180,128,560,128,{t:'① NEGOTIATE_MESSAGE',dy:-6}) +
  arr(560,158,180,158,{t:'② CHALLENGE_MESSAGE',dy:-6}) +
  arr(180,188,560,188,{kind:'def',t:'③ AUTHENTICATE_MESSAGE (+MIC)',dy:-6}) +
  box(90,206,560,28,{t:'MIC = HMAC-MD5(ExportedSessionKey, ①+②+③[MIC=0])',cls:'def',mono:true}) +
  txt(370,259,'TargetInfoのMsvAvFlags bit 0x2=1 → ServerがMIC検証を実施','lbl','middle') +
  lane(20,276,700,190,'リレー攻撃: Drop the MIC (CVE-2019-1040)','off') +
  box(40,308,120,36,{t:'Client',s:'正規認証',cls:'def'}) +
  box(310,308,130,36,{t:'Attacker(MITM)',s:'relay',cls:'off'}) +
  box(580,308,120,36,{t:'Target Server'}) +
  arr(160,366,310,366,{t:'③ AUTHENTICATE+MIC',dy:-6}) +
  arr(440,366,580,366,{kind:'off',t:'MIC除去+SIGN解除→relay',dy:-6}) +
  box(60,386,620,48,{t:'除去: MICフィールド(16B) / NEGOTIATE_SIGN(0x10)・SEAL(0x20)等の署名フラグ',s:'NTLMSSP署名要求はSMB/LDAP側の署名(id:smbsigning)とは別レイヤ',cls:'off'}) +
  txt(370,450,'CVE-2025-54918: LDAPのPartial MIC Removalは署名/CB強制下でもrelayを許す','lbl','middle') +
  txt(370,484,'MICとNEGOTIATEフラグ、両方の改ざん検知を無効化して初めてNTLMリレーは成立する','lbl','middle'),
  'NTLM MIC と Drop the MIC (CVE-2019-1040)');

  /* ---- workloadidfed: ワークロード ID フェデレーション (FIC) の認証フロー ---- */
  F.workloadidfed = svg(740, 368,
txt(370,22,'ワークロード ID フェデレーション (FIC): シークレットレス認証の第3経路','figt','middle') +
box(14,44,175,58,{t:'外部ワークロード / IdP',s:'GitHub Actions/K8s/他クラウド',cls:'pur'}) +
box(252,44,232,58,{t:'Entra ID: FIC 検証',s:'issuer / subject / audience 一致',cls:'def'}) +
box(548,44,178,58,{t:'Entra ID',s:'/token でアクセストークン発行',cls:'pur'}) +
arr(189,132,252,132,{kind:'pur',t:'① OIDC IDトークン(JWT)を提示',dy:-8}) +
arr(484,132,548,132,{kind:'def',t:'② 3値一致→信頼→AT発行',dy:-8}) +
txt(40,140,'OAuth2 client_credentials は不変 — クライアント認証方式のみ置換','lbl') +
box(40,150,300,44,{t:'client_secret / 証明書',s:'FICでは一切不要(シークレットレス)'}) +
box(400,150,300,44,{t:'client_assertion = 外部JWT',s:'client_assertion_type=...jwt-bearer',cls:'def'}) +
arr(340,172,400,172,{kind:'def',t:'置換',dy:-8}) +
txt(40,204,'FIC の設定可否(オブジェクト種別)','lbl') +
box(40,214,330,50,{t:'設定可能',s:'App Registration・UAMI(ユーザー割り当てMI)',cls:'pur'}) +
box(400,214,300,50,{t:'設定不可',s:'システム割り当てMI(SAMI)'}) +
box(40,280,660,50,{t:'攻撃視点: BYOIDP による永続化',s:'外部発行者との信頼をひそかに追加(FIC追加)→シークレットなしで成り代わりトークン取得',cls:'off'}) +
txt(370,350,'FICはシークレット/証明書を使わず、issuer/subject/audienceの一致だけで信頼する(秘密なしの第3経路)','lbl','middle'),
'ワークロード ID フェデレーション (FIC) の認証フロー');

  /* ---- ssprwriteback: SSPR パスワードライトバック(クラウド→オンプレの逆方向同期) ---- */
  F.ssprwriteback = svg(720,340,
 txt(360,24,'SSPR パスワードライトバック(クラウド→オンプレの逆方向同期)','figt','middle') +
 lane(10,42,700,108,'クラウド側 (Entra ID)','pur') +
 lane(10,168,700,108,'オンプレミス AD DS','def') +
 box(20,72,170,56,{t:'攻撃者 / 侵害クラウドID',s:'AiTM・MFA疲労・GA奪取等',cls:'off'}) +
 box(275,72,170,56,{t:'Entra ID SSPR',s:'登録済みセキュリティ情報で認証',cls:'pur'}) +
 box(530,72,170,56,{t:'Entra Connect',s:'Password Writeback 有効',cls:'pur'}) +
 box(530,198,170,56,{t:'MSOL_ コネクタアカウント',s:'Reset Password 権限を委任',cls:'def'}) +
 box(275,198,170,56,{t:'オンプレ AD 対象ユーザー',s:'Tier0/特権も対象になり得る',cls:'off'}) +
 box(20,198,170,56,{t:'オンプレ特権奪取',s:'ドメイン侵入に直結',cls:'off'}) +
 arr(190,100,275,100,{kind:'off',t:'SSPR要求',dy:14}) +
 num(232,86,1) +
 arr(445,100,530,100,{kind:'off',t:'結果送信',dy:14}) +
 num(487,86,2) +
 arr(615,128,615,198,{kind:'off'}) +
 num(615,159,3) +
 txt(608,140,'暗号化チャネルで書き戻し','lbl','end') +
 arr(530,226,445,226,{kind:'off',t:'強制リセット',dy:14}) +
 num(487,212,4) +
 arr(275,226,190,226,{kind:'off',t:'Tier0特権侵害',dy:14}) +
 num(232,212,5) +
 txt(360,316,'SSPR書き戻しは数少ないクラウド→オンプレ方向の経路。特権アカウントはスコープ除外が必須','lbl','middle'),
 'SSPR パスワードライトバック(クラウド→オンプレの逆方向同期)');

  /* ---- actortoken: アクタートークンとS2S委任フロー ---- */
  F.actortoken = svg(720, 500,
  txt(360,22,'アクタートークン (actor token): S2S委任とテナント境界の死角','figt','middle') +
  box(20,45,200,50,{t:'Exchange 等 (第一者SP)',s:'actor アプリ (呼び出し元)',cls:'pur'}) +
  box(260,45,200,50,{t:'ACS',s:'旧: Access Control Service',cls:'def'}) +
  box(500,45,200,50,{t:'Azure AD Graph 等',s:'ターゲット (S2S 呼び出し先)',cls:'pur'}) +
  num(100,115,1) + arr(120,115,360,115,{t:'actor token 要求 (S2S 呼出)',dy:-8}) +
  num(340,150,2) + arr(360,150,120,150,{kind:'def',t:'actor token 発行 (ACS署名)',dy:14}) +
  num(72,143,3) + arr(90,98,90,188,{dash:true}) +
  txt(105,178,'wrapper JWT 構築 (actor token を格納 + nameid=netId)','lbl') +
  lane(140,190,440,140,'Wrapper JWT (alg: none, 未署名)') +
  box(170,225,200,60,{t:'actor token (ACS署名)',cls:'pur'}) +
  box(390,225,175,60,{t:'nameid claim',s:'= netId (対象ユーザー)',cls:'pur'}) +
  txt(360,300,'ACS署名 (trustedForDelegation: true=第一者 / false=それ以外)','lbl','middle') +
  txt(360,317,'netId ≒ 連番（通常のアクセストークンでは puid として出現）','lbl','middle') +
  num(540,200,4) + arr(560,214,600,97,{kind:'pur',t:'wrapper JWT 送信 (Bearer, as netId)',dy:-8}) +
  arr(360,330,360,345,{kind:'off',dash:true}) +
  box(40,345,640,110,{cls:'off'}) +
  txt(360,367,'攻撃面: netId 総当り × テナント境界チェック漏れ','bt','middle') +
  txt(60,388,'netId はほぼ連番 → 短時間の総当りで対象ユーザーを特定可能','lbl') +
  txt(60,406,'要求元テナントと対象 netId の所属テナント一致チェックが欠如','lbl') +
  txt(60,424,'CVE-2025-55241 (CVSS 10.0): 全テナントの任意ユーザー（Global Admin含む）に成りすまし','lbl') +
  txt(360,478,'サインイン/監査ログにほぼ痕跡が残らない — Entra最高深刻度技法の前提知識','lbl','middle'),
  'アクタートークンとS2S委任フロー');

  /* ---- enrollagent: 登録エージェント (Enrollment Agent) の委任モデルと悪用 (ESC3) ---- */
  F.enrollagent = svg(740, 456,
  txt(370,20,'登録エージェント (Enrollment Agent) による委任発行の悪用 (ESC3)','figt','middle') +
  num(22,36,1) + box(8,46,236,140,{cls:'off'}) +
  txt(126,68,'Enrollment Agent証明書取得','bt','middle') +
  txt(20,90,'EKU: Certificate Request Agent','lbl') +
  txt(20,110,'を持つテンプレートへ登録(ESC3)','lbl') +
  txt(20,130,'→ スマートカード発行代行が本来用途','lbl') +
  txt(20,150,'(攻撃では秘密鍵は攻撃者自身)','lbl') +
  num(266,36,2) + box(252,46,236,140,{cls:'off'}) +
  txt(370,68,'on-behalf-of 要求の構築','bt','middle') +
  txt(264,90,'内側要求(PKCS#10/CMC)に','lbl') +
  txt(264,110,'対象ユーザーの識別情報(SAN)','lbl') +
  txt(264,130,'エージェント秘密鍵でCMS署名','lbl') +
  txt(264,150,'(PKCS#7)としてCAへ送信','lbl') +
  num(510,36,3) + box(496,46,236,140,{cls:'def'}) +
  txt(614,68,'CA: 検証して発行','bt','middle') +
  txt(508,90,'外側の署名とEKUを検証','lbl') +
  txt(508,110,'登録エージェント制限をチェック','lbl') +
  txt(508,130,'内側要求の身元(SAN)で発行','lbl') +
  txt(508,150,'→ 対象ユーザー名義の証明書','lbl') +
  arr(244,116,252,116,{kind:'off'}) +
  arr(488,116,496,116,{kind:'off'}) +
  arr(370,186,370,210,{kind:'off',dash:true,t:'同じ効果を制限なく実現',dy:-4}) +
  arr(614,186,614,210,{kind:'def',t:'委任範囲を制限?',dy:-4}) +
  box(8,210,480,100,{cls:'off'}) +
  txt(248,234,'ESC15 (EKUwu): 同じ委任を制限なく再現','bt','middle') +
  txt(20,256,'V1テンプレート: 要求者が拡張を注入可能','lbl') +
  txt(20,276,'Application PolicyにCertificate Request Agentを注入','lbl') +
  txt(20,296,'→ EKU拡張は無視されApplication Policyが優先(実装の癖)','lbl') +
  box(496,210,236,100,{cls:'def'}) +
  txt(614,234,'登録エージェント制限','bt','middle') +
  txt(508,256,'CA>[登録エージェント]タブ','lbl') +
  txt(508,276,'既定 = 制限しない','lbl') +
  txt(508,296,'→ 任意ユーザーへ代理発行可','lbl') +
  arr(614,310,614,326,{kind:'def',t:'発行',dy:-4}) +
  box(496,326,236,84,{t:'発行された証明書',s:'Subject/SAN=対象ユーザー',cls:'pur'}) +
  arr(496,345,468,345,{kind:'off',t:'PKINIT要求→なりすまし成功',dy:-6}) +
  box(8,326,460,84,{cls:'off'}) +
  txt(238,352,'PKINITでなりすまし認証','bt','middle') +
  txt(20,374,'攻撃者が発行された証明書を使用','lbl') +
  txt(20,394,'対象ユーザー(例: Domain Admin)として認証成功','lbl') +
  txt(370,436,'秘密鍵の窃取や登録エージェント制限の不備/バイパスが本質的リスク','lbl','middle'),
  '登録エージェント (Enrollment Agent) による委任発行の悪用 (ESC3)');

  /* ---- shadowprincipal: シャドウセキュリティプリンシパルとPAM/PIMトラスト ---- */
  F.shadowprincipal = svg(740, 430,
  txt(370,24,'シャドウセキュリティプリンシパル (msDS-ShadowPrincipal) とPAM/PIMトラスト','figt','middle') +
  lane(16,44,290,278,'本番 (CORP) フォレスト','def') +
  lane(434,44,290,278,'管理/バスティオン (PRIV) フォレスト','pur') +
  box(36,80,250,64,{t:'特権グループ',s:'Domain Admins 等 (CORPの実グループ)',cls:'def'}) +
  box(454,80,250,64,{t:'Shadow Security Principal',s:'CN=Services配下 (Configuration NC)',cls:'pur'}) +
  box(312,168,120,70,{t:'PAM/PIM Trust',s:'CORP→PRIV (一方向)',cls:'off'}) +
  box(36,230,250,70,{t:'実効効果 (PRIVで一時取得)',s:'Domain Admins相当の権限でCORPへアクセス',cls:'off'}) +
  box(454,230,250,70,{t:'msDS-ShadowPrincipalSid',s:'値 = CORP特権グループのSID',cls:'off'}) +
  num(298,100,1) + arr(286,112,454,112,{kind:'off',t:'SID登録',dy:-8}) +
  num(442,253,2) + arr(454,265,286,265,{kind:'off',t:'SID History行使',dy:-8}) +
  box(40,332,660,64,{t:'netdom trust /EnableSIDHistory:yes /Quarantine:no /EnablePIMTrust:yes (CORP側で実行)',s:'SIDフィルタ/クォランティンを明示的に無効化し、高特権SIDの伝播を許可 — 悪用の核心',cls:'off'}) +
  txt(370,414,'※「PIM」はnetdomのEnablePIMTrust由来のオンプレミス用語、クラウドのEntra ID PIMとは別物','lbl','middle'),
  'シャドウセキュリティプリンシパルとPAM/PIMトラスト');

  /* ---- oxid: DCOM OXID解決とRogueOxidResolverリレー ---- */
  F.oxid = svg(740, 364,
  txt(370,24,'DCOM OXID解決とRogueOxidResolverによる認証リレー','figt','middle') +
  box(20,54,160,58,{t:'クライアント',s:'DCOMオブジェクト要求元'}) +
  box(280,54,180,58,{t:'RPCSS (OXIDリゾルバ)',s:'IObjectExporter @135/tcp',cls:'def'}) +
  box(560,54,150,58,{t:'DCOMサーバー',s:'OXIDで一意に識別'}) +
  num(195,83,1) + arr(210,83,280,83,{kind:'def',t:'ResolveOxid2',dy:-8}) +
  num(470,83,2) + arr(484,83,560,83,{kind:'def',t:'binding返却',dy:-8}) +
  num(95,118,3) + arr(108,118,628,118,{kind:'def',t:'ResolveOxid2結果で動的ポートへ直接接続',dy:14}) +
  lane(20,165,700,150,'悪用: RogueOxidResolverによる認証リレー攻撃','off') +
  box(35,200,170,56,{t:'被害者クライアント',s:'ログオン中ユーザー'}) +
  box(285,200,190,56,{t:'RogueOxidResolver',s:'偽OXIDリゾルバ(攻撃者)',cls:'off'}) +
  box(550,200,160,56,{t:'認証強制先サーバー',s:'NTLM/Kerberosリレー着弾',cls:'off'}) +
  num(215,228,4) + arr(230,228,285,228,{kind:'off',t:'DCOM誘導',dy:-8}) +
  num(485,228,5) + arr(500,228,550,228,{kind:'off',t:'偽装binding',dy:-8}) +
  num(105,272,6) + arr(120,272,632,272,{kind:'off',t:'NTLM/Kerberos認証をリレー(RemotePotato0/RemoteKrbRelay)',dy:14}) +
  txt(370,344,'検知ポイント: 135/tcp宛OXIDリゾルバ呼び出し→動的ポートへの後続接続を監視','lbl','middle'),
  'DCOM OXID解決とRogueOxidResolverによる認証リレー');

  // map several concept ids to the shared figures
  AD.FIGS = {
    userkernel: F.userkernel,
    token: F.token, privilege: F.token, integrity: F.token,
    sid: F.sid, rid: F.sid, wellknownsid: F.sid,
    secdesc: F.dacl, dacl: F.dacl, sacl: F.dacl,
    forest: F.forest, domain: F.forest, ou: F.forest, domaintree: F.forest,
    groupscope: F.groupscope, group: F.groupscope,
    kerberos: F.kerberos, tgt: F.kerberos, st: F.kerberos, krbmsgs: F.kerberos, kdc: F.kerberos,
    ntlm: F.ntlm, netntlm: F.ntlm,
    delegation: F.delegation, s4u: F.delegation,
    pac: F.pac,
    pkinit: F.pkinit,
    prt: F.prt, tokens: F.prt, oauth: F.prt,
    dc: F.dc, gc: F.dc, replication: F.dc, fsmo: F.dc,
    logontype: F.logontype,
    // --- added primitives / SOC ---
    creddump: F.creddump, lsasecrets: F.creddump, cachedcreds: F.creddump, nthash: F.creddump, sam: F.creddump, ntds: F.creddump, credman: F.creddump,
    pth: F.pth,
    goldenticket: F.tickets, silverticket: F.tickets, ptt: F.tickets,
    dcsync: F.dcsync, drsuapi: F.dcsync,
    ntlmrelay: F.ntlmrelay,
    coercion: F.coercion,
    procinjection: F.procinjection,
    killchain: F.killchain,
    edr: F.socstack, xdr: F.socstack, mde: F.socstack, mdi: F.socstack, siem: F.socstack, advhunting: F.socstack, sysmon: F.socstack, wef: F.socstack,
    tiermodel: F.tiermodel, paw: F.tiermodel,
    tokentheft: F.token,
    shadowcred: F.pkinit, keycredlink: F.pkinit,
    coerce: F.coercion,
    // --- added (coverage audit) ---
    dllhijack: F.dllhijack,
    bloodhound: F.bloodhound,
    entraroles: F.cloudauthz, azurerbac: F.cloudauthz, graphapi: F.cloudauthz, pim: F.cloudauthz,
    asep: F.asep, ifeo: F.asep,
    // --- added (SOC/AD deep-dive) ---
    proctree: F.proctree, ppidspoof: F.proctree,
    dll: F.dllhijack,
    triage: F.triage,
    pyramid: F.pyramid,
    diamondmodel: F.diamondmodel,
    logonevents: F.logonevents,
    acctmgmtevents: F.acctmgmtevents,
    emailauth: F.emailauth,
    ransomware: F.ransomware,
    malwaretypes: F.malwaretypes,
    remoteexec: F.remoteexec,
    adcsesc: F.adcsesc,
    hybridauth: F.hybridauth,
    nopac: F.nopac,
    potato: F.potato,
    reflectiveload: F.procinjection,
    unconstrained: F.delegation,
    u2u: F.u2u,
    ntlmmic: F.ntlmmic,
    workloadidfed: F.workloadidfed,
    ssprwriteback: F.ssprwriteback,
    actortoken: F.actortoken,
    enrollagent: F.enrollagent,
    shadowprincipal: F.shadowprincipal,
    oxid: F.oxid
  };
})(window.AD);
