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
    arr(360,154,360,196,{kind:'', t:'syscall (int 0x2e / syscall)  ↓  return  ↑', dy:-2}) +
    txt(50,172,'trap / transition boundary — only the kernel touches hardware & other processes','lbl'),
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
    box(360,150,320,44,{t:'RID 500=Administrator · 512=Domain Admins · 502=krbtgt',mono:true,cls:'def'}),
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
    box(280,42,160,40,{t:'Forest',s:'schema · config · Enterprise Admins',cls:'pur'}) +
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
    box(210,64,86,34,{t:'① EXEのフォルダ',mono:true}) +
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
    asep: F.asep, ifeo: F.asep
  };
})(window.AD);
