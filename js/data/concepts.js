window.AD = window.AD || {};
AD.CONCEPTS = AD.CONCEPTS || {};
AD.CONCEPTS.ja = [
  {
    "id": "userkernel",
    "term": "ユーザー空間 / カーネル空間",
    "en": "User Space / Kernel Space",
    "aka": "Ring 3, Ring 0, user mode, kernel mode",
    "cat": "os",
    "body": "x86/x64 CPU の特権リング機構により、コードはユーザーモード(Ring 3)かカーネルモード(Ring 0)のいずれかで実行される。ユーザーモードのプロセスは自身の仮想アドレス空間に隔離され、ハードウェアやカーネルメモリへ直接アクセスできず、システムコール経由でカーネルへ要求を渡す。カーネルモード(ntoskrnl.exe やドライバ)は全メモリと全命令にアクセスできるため、ここでのコード実行はセキュリティ境界の完全な崩壊を意味し、EDR や PPL(Protected Process Light)による保護すらバイパスされうる。ルートキットやBYOVD攻撃がカーネル空間を狙うのはこのためである。",
    "points": [
      "Ring 3=ユーザーモード、Ring 0=カーネルモード",
      "ユーザー↔カーネルの遷移はシステムコール(x64=syscall / x86=sysenter)経由",
      "カーネルコード実行=全メモリ・全特権を掌握",
      "BYOVD(署名済み脆弱ドライバの悪用)でRing 0を奪取"
    ],
    "related": [
      "process",
      "token",
      "lsass",
      "integrity"
    ]
  },
  {
    "id": "process",
    "term": "プロセス / スレッド",
    "en": "Process / Thread",
    "aka": "PID, TID, virtual address space",
    "cat": "os",
    "body": "プロセスは実行中プログラムのコンテナで、専用の仮想アドレス空間、ハンドルテーブル、プライマリトークンを持ち、一意なPID(プロセスID)で識別される。実際に命令を実行する単位はスレッド(一意なTIDを持つ)であり、1つのプロセスは複数スレッドを内包してアドレス空間を共有する。攻撃者はプロセスインジェクション(CreateRemoteThread、APC、プロセスホローイングなど)で正規プロセスに悪意あるスレッドを注入し、防御回避や権限のなりすましを行うため、プロセスとスレッドの親子関係・生成元は重要な検知データである。",
    "points": [
      "プロセス=アドレス空間+ハンドル+プライマリトークン、識別子はPID",
      "スレッド=実行単位、識別子はTID、同一プロセス内で空間共有",
      "親プロセスID(PPID)の偽装(PPID spoofing)は検知回避手法",
      "プロセスインジェクションはEDR回避の定番テクニック"
    ],
    "related": [
      "userkernel",
      "token",
      "lsass",
      "integrity",
      "proctree"
    ]
  },
  {
    "id": "token",
    "term": "アクセストークン",
    "en": "Access Token",
    "aka": "primary token, impersonation token, SID, group",
    "cat": "os",
    "body": "アクセストークンは主体のセキュリティコンテキストを保持するカーネルオブジェクトで、ログオンセッションを参照し、ユーザーのSID、所属グループのSID群、有効な特権リスト、整合性レベルを内包して、アクセスチェックの際に主体側の資格情報として使われる。プロセスはプライマリトークンを持ち、スレッドは一時的にインパーソネーショントークン(他ユーザーになりすます)を装着できる。攻撃者はトークン窃取・複製(DuplicateTokenEx)やトークンインパーソネーションで高権限プロセスのトークンを流用し権限昇格・横展開を行うため、SeImpersonatePrivilege を持つサービスアカウントは特に狙われる。",
    "points": [
      "中身: ユーザーSID+グループSID+特権リスト+整合性レベル",
      "プライマリトークン(プロセス) vs インパーソネーショントークン(スレッド)",
      "トークン窃取/なりすましで権限昇格(例: Potato系攻撃)",
      "フィルタ済み/制限付きトークンはUACの分割トークンで使用"
    ],
    "related": [
      "privilege",
      "integrity",
      "uac",
      "logonsession",
      "ppidspoof"
    ]
  },
  {
    "id": "privilege",
    "term": "特権",
    "en": "Privilege",
    "aka": "SeDebugPrivilege, SeImpersonatePrivilege, user right",
    "cat": "os",
    "body": "特権(privilege)は特定のシステム全体の操作を許可するトークン内の属性で、SeDebugPrivilege(任意プロセスへのデバッグ=メモリ読み書き)や SeImpersonatePrivilege(トークンのなりすまし)、SeBackupPrivilege(ACLを無視した全ファイル読み取り)などがある。オブジェクトごとのアクセス許可(DACL)とは異なり、特権はシステム操作そのものを対象とする点が特徴で、多くは既定で無効状態(disabled)で付与され使用時に有効化される。SeDebugPrivilege は LSASS からの資格情報窃取に、SeImpersonatePrivilege は権限昇格に悪用されるため、どのアカウントがどの特権を保持するかは重要な監査項目である。",
    "points": [
      "特権=システム操作の権利、DACL=オブジェクトへのアクセス権(別物)",
      "SeDebugPrivilege→LSASSメモリ読取(資格情報窃取)",
      "SeImpersonatePrivilege→トークンなりすまし(SYSTEM昇格)",
      "トークン内で既定は無効、AdjustTokenPrivilegesで有効化"
    ],
    "related": [
      "token",
      "lsass",
      "uac",
      "integrity"
    ]
  },
  {
    "id": "integrity",
    "term": "整合性レベル",
    "en": "Integrity Level",
    "aka": "Low/Medium/High/System, Mandatory Integrity Control",
    "cat": "os",
    "body": "整合性レベル(Mandatory Integrity Control, MIC)は主体とオブジェクトに信頼度を割り当てる仕組みで、S-1-16-x 形式のSIDで表現される: Untrusted(0x0000=0)、Low(0x1000=4096)、Medium(0x2000=8192)、High(0x3000=12288)、System(0x4000=16384)。低い整合性のプロセスは高い整合性のオブジェクトへ書き込めない(no-write-up)。標準ユーザーのプロセスはMedium、昇格プロセスはHigh、SYSTEMサービスはSystem、ブラウザのサンドボックス等はLowで動作し、UACの昇格やサンドボックス脱出の判断基準となる。",
    "points": [
      "SID形式 S-1-16-RID(Low=4096/0x1000, Medium=8192/0x2000)",
      "High=12288/0x3000、System=16384/0x4000、Untrusted=0",
      "規則: no-write-up(低→高への書込禁止)",
      "標準ユーザー=Medium、管理者昇格=High、SYSTEM=System"
    ],
    "related": [
      "token",
      "uac",
      "privilege",
      "process"
    ]
  },
  {
    "id": "uac",
    "term": "ユーザーアカウント制御 (UAC)",
    "en": "User Account Control (UAC)",
    "aka": "elevation, split token, admin approval mode",
    "cat": "os",
    "body": "ユーザーアカウント制御(UAC)は、管理者グループのユーザーでも既定では標準ユーザー相当の権限で動作させる仕組みである。ログオン時に「分割トークン(split token)」が生成され、フィルタ済みの標準権限トークン(Medium整合性)と完全な管理者トークン(High整合性)の2つが用意され、昇格が必要な操作では同意プロンプトを経て後者へ切り替わる(Admin Approval Mode)。UACはセキュリティ境界ではないとMicrosoftが明言しており、fodhelper 等の自動昇格バイナリを悪用したUACバイパスが多数存在するため、High整合性への昇格イベントは監視対象となる。",
    "points": [
      "分割トークン: 標準(Medium) + 管理者(High)の2トークン",
      "昇格=同意プロンプト後に管理者トークンへ切替(Admin Approval Mode)",
      "MicrosoftはUACを「セキュリティ境界ではない」と明言",
      "自動昇格バイナリ悪用(fodhelper等)でUACバイパス"
    ],
    "related": [
      "integrity",
      "token",
      "privilege",
      "process"
    ]
  },
  {
    "id": "logonsession",
    "term": "ログオンセッション",
    "en": "Logon Session",
    "aka": "LUID, interactive/network/service session",
    "cat": "os",
    "body": "ログオンセッションは認証成功時にLSASSが生成する論理コンテナで、64ビットの一意識別子LUID(Locally Unique Identifier)で識別され、当該ユーザーの資格情報素材(NTハッシュ、Kerberosチケット等)とトークンを紐づける。対話型・ネットワーク・サービス・バッチなど種別があり、同一ユーザーでも複数の並行セッションが存在しうる。攻撃者はLSASSのメモリからログオンセッションに紐づく平文パスワードやチケットを抽出する(mimikatz sekurlsa)ため、どのセッションがどのホストに存在するかは横展開経路の把握に直結する。",
    "points": [
      "LUID(64ビット一意ID)でセッションを識別",
      "LSASSが認証成功時に生成し資格情報素材を紐づける",
      "トークンはログオンセッションを参照する",
      "sekurlsa等はセッション紐付けの資格情報をLSASSから抽出"
    ],
    "related": [
      "logontype",
      "token",
      "lsass",
      "kerberos"
    ]
  },
  {
    "id": "logontype",
    "term": "ログオン種別",
    "en": "Logon Type",
    "aka": "Type 2/3/4/5/8/9/10, 4624",
    "cat": "os",
    "body": "ログオン種別は認証がどの経路で行われたかを示す番号で、Windowsセキュリティイベント4624(成功)/4625(失敗)のLogon Typeフィールドに記録される。主な値: 2=対話(コンソール直接)、3=ネットワーク(SMB/共有アクセス、Pass-the-Hashの多く)、4=バッチ(タスクスケジューラ)、5=サービス(SCMが起動)、7=ロック解除、8=NetworkCleartext(平文がネットワーク経由、IISのBasic認証等)、9=NewCredentials(runas /netonly、対外接続に別資格情報)、10=RemoteInteractive(RDP)、11=CachedInteractive(キャッシュ資格情報)。Type 3 と 10 は横展開の、Type 9 は別資格情報の持ち込み(runas /netonly)の検知に有用である。",
    "points": [
      "2=対話, 3=ネットワーク, 4=バッチ, 5=サービス",
      "7=ロック解除, 8=NetworkCleartext, 9=NewCredentials",
      "10=RemoteInteractive(RDP), 11=CachedInteractive",
      "4624=ログオン成功 / 4625=ログオン失敗 に記録",
      "Type 3=Pass-the-Hashの多く、Type 9=runas /netonly の痕跡"
    ],
    "related": [
      "logonsession",
      "eventlog",
      "ntlm",
      "kerberos"
    ]
  },
  {
    "id": "lsass",
    "term": "LSASS / LSA",
    "en": "LSASS / LSA",
    "aka": "Local Security Authority, lsass.exe, credential store",
    "cat": "os",
    "body": "LSASS(Local Security Authority Subsystem Service、lsass.exe)は、対話ログオンやトークン発行、パスワードポリシー適用、監査ログ生成などを司るWindowsの認証中核プロセスであり、その中でLSA(Local Security Authority)がセキュリティポリシーを管理する。NTLMハッシュ、Kerberosチケット(TGT/ST)、DPAPIマスターキー、平文資格情報(WDigest等)などの機密資格情報をメモリ上に保持するため、Mimikatzやprocdumpによる資格情報窃取(T1003.001)の第一標的となる。防御としてLSA Protection(RunAsPPL、lsass.exeをProtected Process Lightとして起動)やCredential Guardが提供され、非署名プロセスからのメモリ読取・コード注入を阻止する。SOCではlsass.exeへの不審なハンドル取得(Sysmon EID 10)やプロセスアクセスの異常を監視する。",
    "points": [
      "プロセスはlsass.exe、SYSTEM権限で常駐する単一インスタンス",
      "NTLMハッシュ・Kerberosチケット・DPAPIキー等をメモリ保持",
      "LSA Protection: レジストリRunAsPPL=1(UEFIロック付)/2(ロックなし)",
      "Credential Guard は VBS/仮想化で秘密を隔離する",
      "主要監視: lsass.exe へのハンドル取得(Sysmon EID 10)"
    ],
    "related": [
      "sam",
      "dpapi",
      "kerberos",
      "nthash",
      "token",
      "skeletonkey"
    ]
  },
  {
    "id": "sam",
    "term": "SAM",
    "en": "Security Account Manager (SAM)",
    "aka": "local accounts, SAM hive, NT hash",
    "cat": "os",
    "body": "SAM(Security Account Manager)は、Windowsのローカルユーザーアカウントとグループ、およびそのパスワード情報を格納するデータベースで、ドメインに参加していないマシンのローカル認証を担う。物理的にはレジストリハイブC:\\Windows\\System32\\config\\SAM(実行時はHKLM\\SAM)に保存され、パスワードはNTハッシュ(MD4)として格納される。ハッシュはSYSTEMハイブ内のブートキー(SYSKEY)由来の鍵で暗号化されているため、攻撃者はSAMとSYSTEMの両ハイブ(reg save や VSS(ボリュームシャドウコピー)、rawダンプ経由)を取得して secretsdump 等でオフライン抽出する(T1003.002)。ローカルAdministratorのハッシュが共通の場合、Pass-the-Hashによる横展開の温床となるため、LAPSでのパスワードランダム化が推奨される。",
    "points": [
      "ハイブ実体: %SystemRoot%\\System32\\config\\SAM(HKLM\\SAM)",
      "パスワードはNTハッシュ(MD4)で格納、SYSKEY由来鍵で暗号化",
      "抽出にはSAM+SYSTEMの両ハイブが必要",
      "ドメインの資格情報はSAMでなくNTDS.dit(ntds.dit)に格納",
      "共有ローカル管理者ハッシュ→PtH横展開のリスク、LAPSで緩和"
    ],
    "related": [
      "registry",
      "lsass",
      "nthash",
      "ntds",
      "ntlm"
    ]
  },
  {
    "id": "registry",
    "term": "レジストリ",
    "en": "Windows Registry",
    "aka": "HKLM, HKCU, hive, key/value",
    "cat": "os",
    "body": "Windowsレジストリは、OSとアプリケーションの構成・セキュリティポリシー・資格情報素材を格納する階層型データベースで、キー/サブキー/値(名前・型・データ)から構成される。主要ルートはHKLM(マシン全体)、HKCU(現在ユーザー)、HKU、HKCR、HKCC。物理的には%SystemRoot%\\System32\\config配下のハイブファイル(SYSTEM/SOFTWARE/SECURITY/SAM/DEFAULT)、およびユーザープロファイルのNTUSER.dat(HKCU)とUsrClass.dat(HKCR/HKCU\\Software\\Classes)に永続化される。各ハイブは変更を先行記録するトランザクションログ(<ハイブ名>.LOG1/.LOG2、トランザクショナルレジストリはconfig\\TxR配下の.regtrans-ms/.blf(CLFS形式))を伴い、reg save/RegRipper/ハイブパーサによるオフライン解析で削除キーや未コミットの直近改変を復元できる。HKLM\\HARDWARE等は揮発性で対応ファイルを持たず起動ごとにメモリ上へ再構築される。攻撃者は自動実行キー(Run、Winlogon、Services)で永続化し、SAM/SECURITYハイブから資格情報を窃取する。各キーはDACL/SACLで保護され、Sysmon EID 12/13/14で監視できる。",
    "points": [
      "ルートキー: HKLM / HKCU / HKU / HKCR / HKCC",
      "ハイブファイル: %SystemRoot%\\System32\\config の SYSTEM/SOFTWARE/SECURITY/SAM/DEFAULT + NTUSER.dat/UsrClass.dat",
      "トランザクションログ: <ハイブ>.LOG1/.LOG2 と config\\TxR の .regtrans-ms/.blf(CLFS)= 復元源",
      "揮発性ハイブ HKLM\\HARDWARE はファイル無しで起動時にメモリ再構築",
      "オフライン解析: reg save / RegRipper / hiveパーサで削除キー・未コミット改変を復元",
      "永続化キー Run/Winlogon/Services; DACL/SACL保護、監視 Sysmon EID 12/13/14"
    ],
    "related": [
      "sam",
      "service",
      "secdesc",
      "dacl",
      "sacl",
      "uacbypass"
    ]
  },
  {
    "id": "service",
    "term": "Windows サービス",
    "en": "Windows Service",
    "aka": "services.exe, SCM, svchost.exe, service account",
    "cat": "os",
    "body": "Windowsサービスは、ユーザーログオンに依存せずバックグラウンドで動作する常駐プログラムで、Service Control Manager(SCM、services.exe)が起動・停止・状態管理を行う。各サービスの構成(ImagePath実行パス、起動種別、実行アカウント)はレジストリHKLM\\SYSTEM\\CurrentControlSet\\Servicesに保存され、多くのサービスはsvchost.exeで共有ホストされる。実行アカウントはLocalSystem/LocalService/NetworkServiceの組込み仮想アカウント、または(g)MSAやドメインアカウント。攻撃者はサービス作成・改変(sc create、ImagePath改変、バイナリ置換、非引用パス悪用)で永続化・権限昇格・横展開(PsExecはADMIN$へバイナリ設置しSCMでサービス起動)を行う。監視はEvent ID 7045(新規サービス、Systemログ)や4697(Securityログ)が有効。",
    "points": [
      "管理はSCM(services.exe); 多くはsvchost.exeで共有ホスト",
      "構成はHKLM\\SYSTEM\\CurrentControlSet\\Services に保存",
      "実行アカウント: LocalSystem/LocalService/NetworkService, (g)MSA",
      "LocalSystem はSYSTEM権限=最高特権で危険",
      "監視: EID 7045(新規サービス,System), 4697(Security); 非引用パス脆弱性に注意"
    ],
    "related": [
      "registry",
      "process",
      "privilege",
      "gmsa",
      "smb",
      "remoteexec"
    ]
  },
  {
    "id": "namedpipe",
    "term": "名前付きパイプ",
    "en": "Named Pipe",
    "aka": "\\\\.\\pipe\\, IPC, SMB pipe",
    "cat": "os",
    "body": "名前付きパイプ(Named Pipe)は、Windowsのプロセス間通信(IPC)機構で、\\\\.\\pipe\\<名前>という名前空間でサーバーとクライアントを結ぶ。ローカルだけでなくSMB経由でリモートアクセス可能で、その場合445/tcpのIPC$共有を通じて\\\\<ホスト>\\pipe\\<名前>としてアクセスされる(RPC over Named Pipes(ncacn_np)やPsExecのsvcctlパイプがこれを利用)。名前付きパイプはimpersonation(なりすまし)をサポートするため、SYSTEMや高権限クライアントを誘導して接続させ、そのトークンを奪う「Named Pipe Impersonation」による権限昇格に悪用される。SOCではSysmon EID 17/18(パイプ作成/接続)で svcctl, atsvc, samr, lsarpc など横展開に使われるパイプを監視する。",
    "points": [
      "名前空間: \\\\.\\pipe\\<名前>(ローカル), \\\\host\\pipe\\<名前>(リモート)",
      "リモートアクセスはSMB 445/tcpのIPC$共有経由",
      "RPC over Named Pipes(ncacn_np)の搬送路",
      "impersonationを悪用したトークン奪取で権限昇格",
      "監視: Sysmon EID 17(作成)/18(接続); svcctl,samr,lsarpc等"
    ],
    "related": [
      "smb",
      "rpc",
      "token",
      "privilege",
      "service"
    ]
  },
  {
    "id": "rpc",
    "term": "RPC",
    "en": "Remote Procedure Call (RPC)",
    "aka": "MS-RPC, endpoint mapper, DCE/RPC, interface UUID",
    "cat": "os",
    "body": "RPC(Remote Procedure Call、MicrosoftのMS-RPCはDCE/RPC由来)は、あるプロセスが別プロセスやリモートホストの関数を、ローカル呼び出しのように実行させる通信基盤で、SMB/名前付きパイプ、DCOM、AD管理など多くのWindows機能の土台となる。各RPCサービスはインターフェースUUID(interface UUID)で識別され、Endpoint Mapper(EPM、TCP 135番で待受)にクエリして動的ポート(既定49152-65535)を解決してから接続する。搬送プロトコルはncacn_ip_tcp(TCP)、ncacn_np(名前付きパイプ)、ncacn_http等。攻撃者はMS-RPCインターフェースを悪用し、DCSync(DRSUAPI、UUID e3514235-...)、リモートサービス操作(svcctl)、タスク(atsvc/ITaskSchedulerService)、PrintNightmare(MS-RPRN)等を実行する。",
    "points": [
      "Endpoint Mapper(EPM)はTCP 135で待受、動的ポートを解決",
      "動的ポート範囲: 既定 49152-65535",
      "サービスはインターフェースUUIDで識別",
      "搬送: ncacn_ip_tcp, ncacn_np(名前付きパイプ), ncacn_http",
      "悪用例: DCSync(DRSUAPI), svcctl, MS-RPRN(PrintNightmare)"
    ],
    "related": [
      "namedpipe",
      "smb",
      "wmi",
      "dc",
      "replication",
      "oxid",
      "epmreg"
    ]
  },
  {
    "id": "smb",
    "term": "SMB",
    "en": "Server Message Block (SMB)",
    "aka": "445/tcp, CIFS, signing, IPC$",
    "cat": "os",
    "body": "SMB(Server Message Block)は、Windowsのファイル共有・プリンタ共有・IPC(名前付きパイプ経由のRPC)を担うネットワークプロトコルで、現在は直接445/tcpで通信する(旧来のNetBIOS over TCPは137-139)。IPC$管理共有を通じて名前付きパイプRPCが流れるため、PsExec、リモートサービス操作、DCSyncなど多数の横展開手法の搬送路となる。SMB署名(signing)はメッセージ改竄とNTLMリレー攻撃を防ぐ重要な防御で、SMB3ではAES-CMAC署名とAES暗号化をサポートする(SMB 3.1.1ではAES-GMAC署名/AES-GCM暗号化)。攻撃者はNTLMリレー(署名未強制時)、ADMIN$/C$への書込み、SMBの脆弱性(EternalBlue=MS17-010)を悪用する。監視はEvent ID 5140/5145(共有アクセス)が有効。",
    "points": [
      "現行は445/tcp直結(旧NetBIOS: 137-139)",
      "IPC$共有経由で名前付きパイプRPCが流れる",
      "SMB署名はNTLMリレー/改竄を防止、SMB3はAES暗号化対応",
      "管理共有: ADMIN$, C$, IPC$(PsExec等が悪用)",
      "脆弱性例: EternalBlue(MS17-010); 監視 EID 5140/5145"
    ],
    "related": [
      "namedpipe",
      "rpc",
      "ntlm",
      "netntlm",
      "wmi",
      "remoteexec"
    ]
  },
  {
    "id": "wmi",
    "term": "WMI",
    "en": "Windows Management Instrumentation (WMI)",
    "aka": "CIM, WQL, win32 classes, lateral movement",
    "cat": "os",
    "body": "WMI(Windows Management Instrumentation)は、DMTFのCIM(Common Information Model)標準に基づくWindowsの管理基盤で、OS・ハードウェア・プロセス等の情報取得と操作をWin32_*クラス群として公開し、WQL(WMI Query Language、SQL風)でクエリする。既定名前空間はroot\\cimv2で、リモート操作はDCOM(RPCベース、Endpoint Mapper TCP 135経由で動的ポート)またはWinRM(WS-Man、5985/5986)で行う。攻撃者はwmic/Invoke-WmiMethodで遠隔コード実行・横展開(Win32_Process.Create)を行い、root\\subscription名前空間に__EventFilter(WQLトリガ)+EventConsumer(実行)+__FilterToConsumerBindingの3点セットを作成してSYSTEM権限の永続化(T1546.003)を仕込む。実行はWmiPrvSE.exeが代理する。監視はWMI-Activity/Operationalログのイベント5857-5861(特に永続化に関わる5861)やSysmon EID 19/20/21が有効。",
    "points": [
      "CIM標準ベース; Win32_*クラスをWQLでクエリ",
      "既定名前空間 root\\cimv2; リモートはDCOM(135)またはWinRM(5985/5986)",
      "横展開: Win32_Process.Create による遠隔実行",
      "永続化: root\\subscription の __EventFilter+Consumer+Binding(SYSTEM実行)",
      "実行代理はWmiPrvSE.exe; 監視 WMI-Activity 5857-5861 / Sysmon EID 19/20/21"
    ],
    "related": [
      "rpc",
      "smb",
      "process",
      "wef",
      "sysmon",
      "remoteexec"
    ]
  },
  {
    "id": "dpapi",
    "term": "DPAPI",
    "en": "Data Protection API (DPAPI)",
    "aka": "master key, CryptProtectData, DPAPI_SYSTEM",
    "cat": "os",
    "body": "DPAPI（Data Protection API）は、アプリケーションが対称鍵管理を自前で実装せずにデータを暗号化・復号できるWindows標準の保護機構で、CryptProtectData / CryptUnprotectData（および後継のNCryptProtectSecret）を通じて利用される。ユーザーコンテキストのマスターキーはユーザーのパスワードハッシュから派生し %APPDATA%\\Microsoft\\Protect\\<ユーザーSID>\\ にGUID名で保存され、マシンコンテキストではLSAシークレット DPAPI_SYSTEM が用いられる。ブラウザ保存パスワード、資格情報マネージャー、EFS、Wi-Fi鍵、RDP資格情報などが保護され、攻撃者の主要な窃取対象となる。重要な点として、ドメインコントローラーはRSAのドメインバックアップキー（LSAシークレットとして保存）を保持し、これを奪取すればユーザーがパスワードを変更した後でも任意ドメインユーザーのDPAPIデータを復号できる。",
    "points": [
      "API: CryptProtectData / CryptUnprotectData（NCryptProtectSecretはCNG世代）",
      "ユーザーマスターキーはパスワードから派生、%APPDATA%\\Microsoft\\Protect\\<SID>\\ に格納",
      "マシン秘密はLSAシークレット DPAPI_SYSTEM で保護",
      "ドメインバックアップキーはRSA鍵ペアでDCにLSAシークレットとして保存・複製",
      "バックアップキー奪取でパスワード変更後も全ユーザーのBLOBを復号可能"
    ],
    "related": [
      "lsass",
      "sam",
      "registry",
      "sid",
      "secdesc"
    ]
  },
  {
    "id": "etw",
    "term": "ETW",
    "en": "Event Tracing for Windows (ETW)",
    "aka": "providers, consumers, telemetry, AMSI",
    "cat": "os",
    "body": "ETW（Event Tracing for Windows）は、カーネルモード/ユーザーモードのコンポーネントが高スループットな診断・監査イベントを発行するためのWindows組み込みトレース基盤である。アーキテクチャは4要素（イベントを発行するプロバイダー、トレースセッションを開始・停止するコントローラー、リアルタイムまたはETLファイルからイベントを読むコンシューマー、バッファを保持するセッション）から成り、各プロバイダーは128ビットGUIDで識別される。EDRやセキュリティ製品は、Microsoft-Windows-Threat-Intelligence（ETW-TI）などのプロバイダーや、AMSI（Microsoft-Antimalware-Scan-Interface）を消費して振る舞い検知を行うため、防御側の重要な可視性源となる。逆に攻撃者はプロバイダーの無効化やETWパッチ（ntdll!EtwEventWriteの改ざん等）でテレメトリを「盲目化」しようとするため、ETW自体の改ざん検知も監視対象となる。",
    "points": [
      "4構成要素: プロバイダー / コントローラー / コンシューマー / セッション",
      "プロバイダーは128ビットGUIDで識別、ログはETLファイル",
      "EDRはETW-TI（Microsoft-Windows-Threat-Intelligence）やAMSIを消費",
      "攻撃者はEtwEventWriteパッチやプロバイダー無効化でテレメトリを盲目化",
      "logman/wevtutilで列挙・制御可能"
    ],
    "related": [
      "sysmon",
      "eventlog",
      "wef",
      "lsass",
      "auditpolicy"
    ]
  },
  {
    "id": "principal",
    "term": "セキュリティプリンシパル",
    "en": "Security Principal",
    "aka": "user, group, computer, service — anything with a SID",
    "cat": "identity",
    "body": "セキュリティプリンシパル(Security Principal)とは、SIDを付与され、認証を経てアクセス制御の主体になり得るエンティティで、ユーザー、コンピューター(マシンアカウント)、セキュリティグループ、および組込みの特殊アカウントが該当する。Windowsのアクセス制御は、プリンシパルのSID群をアクセストークンに載せ、オブジェクトのセキュリティ記述子内のDACLと突き合わせて許可/拒否を判定する。重要な点として、トークンに載りアクセス制御に効くのはセキュリティ有効グループのSIDのみで、配布(distribution)グループはメール配信専用でSIDによる権限付与には使われない。組込みのwell-knownプリンシパルにはSYSTEM(S-1-5-18)、LocalService(S-1-5-19)、NetworkService(S-1-5-20)、Everyone(S-1-1-0)、Authenticated Users(S-1-5-11)、Administrators(S-1-5-32-544)などがある。フォレスト/ドメイン信頼を越えた参照では、相手側プリンシパルがForeign Security Principals(FSP)コンテナにSIDとして格納される。権限昇格・横展開は結局「どのSIDが何にアクセスできるか」に帰着するため、プリンシパルの理解はSOC分析の基礎となる。",
    "points": [
      "種類: ユーザー / コンピューター / セキュリティグループ / 組込み特殊アカウント(いずれもSID保有)",
      "SIDでアクセス制御に効くのはセキュリティ有効グループのみ; 配布グループはトークン非搭載",
      "well-knownプリンシパル: SYSTEM(S-1-5-18), LocalService(S-1-5-19), NetworkService(S-1-5-20)",
      "Everyone(S-1-1-0), Authenticated Users(S-1-5-11), Administrators(S-1-5-32-544)",
      "認証後、SID群はアクセストークンに格納→DACL評価で可否判定",
      "信頼越えの参照は Foreign Security Principals(FSP)コンテナにSIDで格納"
    ],
    "related": [
      "sid",
      "token",
      "group",
      "userobj",
      "computerobj"
    ]
  },
  {
    "id": "sid",
    "term": "SID",
    "en": "Security Identifier (SID)",
    "aka": "S-1-5-21-...-RID, objectSid",
    "cat": "identity",
    "body": "SID(Security Identifier)は、セキュリティプリンシパルを一意に識別する可変長の値で、S-1-<識別子権限(authority)>-<サブ権限...>-<RID> という構造を持つ。先頭のSはリテラル、1はリビジョン、続く識別子権限は例えば1=World、5=NT Authority、16=Mandatory Label(整合性レベル)を表す。ドメインアカウントでは S-1-5-21 に続く3つの32ビット値がドメインを一意化する識別子、末尾のRIDが個々のプリンシパルを表す。RIDには予約値があり、500=Administrator、501=Guest、502=krbtgt、512=Domain Admins、513=Domain Users、518=Schema Admins、519=Enterprise Admins、520=Group Policy Creator Owners で、通常作成されるプリンシパルのRIDは1000以降となる。ADオブジェクトでは objectSid 属性に格納され、名前変更やOU間移動を行ってもSIDは不変で、DACL/SACL・アクセストークン・Kerberos PACの中で参照される。SIDの偽装や履歴(SID History)悪用は権限昇格・信頼越えの典型手口である。",
    "points": [
      "構造: S-1-<authority>-<サブ権限>-<RID>、ドメインは S-1-5-21-<ドメイン識別子>-RID",
      "識別子権限の例: 1=World, 5=NT Authority, 16=Mandatory Label(整合性)",
      "予約RID(アカウント): 500=Administrator, 501=Guest, 502=krbtgt",
      "予約RID(グループ): 512=Domain Admins, 513=Domain Users, 519=Enterprise Admins, 518=Schema Admins, 520=GPCO",
      "通常プリンシパルのRIDは1000以降; objectSid属性に格納され名前変更・移動でも不変",
      "DACL/SACL・アクセストークン・Kerberos PACで参照; SID History悪用に注意"
    ],
    "related": [
      "rid",
      "wellknownsid",
      "principal",
      "secdesc",
      "token"
    ]
  },
  {
    "id": "rid",
    "term": "RID",
    "en": "Relative Identifier (RID)",
    "aka": "500 Administrator, 512 Domain Admins, 502 krbtgt",
    "cat": "identity",
    "body": "RID（Relative Identifier）は、SIDの末尾に付く相対的な数値で、同一ドメイン（またはローカルSAM）内でプリンシパルを一意に区別する部分である（完全なSIDは S-1-5-21-<ドメイン識別子>-<RID>）。既定アカウントには固定RIDが割り当てられ、500=Administrator、501=Guest、502=krbtgt のほか、グループでは 512=Domain Admins、513=Domain Users、516=Domain Controllers、518=Schema Admins、519=Enterprise Admins、520=Group Policy Creator Owners、498=Enterprise RODCs、521=RODCs、526=Key Admins、527=Enterprise Key Admins など、Tier-0監視に必須の値が並ぶ。1000未満は組み込み予約で、通常のユーザー・グループには1000以降が付与される。各DCはRID Master（FSMOの一つ）から配布されたRIDプール（既定500刻み）を消費してSIDを発行するため、RID枯渇も運用監視対象になる。攻撃面では、SYSTEM権限でSAMハイブを改ざんし低権限アカウントの末尾RIDを500に書き換えるRIDハイジャック（隠れ管理者化）が既知で、Andariel等の実例がある。",
    "points": [
      "完全SID構造: S-1-5-21-<ドメイン識別子>-<RID>、1000未満は組み込み予約",
      "固定RID: 500 Administrator / 501 Guest / 502 krbtgt",
      "グループ: 512 Domain Admins / 513 Domain Users / 516 Domain Controllers / 518 Schema Admins / 519 Enterprise Admins / 520 GPO Creator Owners",
      "RODC/Key系: 498 Enterprise RODCs / 521 RODCs / 526 Key Admins / 527 Enterprise Key Admins",
      "RID Master(FSMO)がRIDプール(既定500刻み)をDCへ配布し枯渇も監視対象",
      "RIDハイジャック: HKLM\\SAM\\SAM\\Domains\\Account\\Users\\<RID>\\F の offset 0x30 を little-endian で 0x1F4(=500) に改ざん (要SYSTEM、Andariel事例)"
    ],
    "related": [
      "sid",
      "wellknownsid",
      "krbtgt",
      "fsmo",
      "group",
      "primarygroupid"
    ]
  },
  {
    "id": "wellknownsid",
    "term": "Well-known SID",
    "en": "Well-known SID",
    "aka": "S-1-1-0 Everyone, S-1-5-18 SYSTEM, S-1-5-32-544",
    "cat": "identity",
    "body": "Well-known SID（既知のSID）は、すべてのWindowsで値が一定に定められた特別なSIDで、汎用的なユーザー・グループ・論理的主体を表す。ログオン文脈では S-1-1-0（Everyone）、S-1-5-7（Anonymous）、S-1-5-11（Authenticated Users）、S-1-5-2（Network）、S-1-5-4（Interactive）、S-1-5-9（Enterprise Domain Controllers）があり、サービス系は S-1-5-18（Local System / SYSTEM）/19（Local Service）/20（Network Service）である。組み込みドメイン S-1-5-32 配下には S-1-5-32-544（Administrators）/545（Users）に加え、権限昇格経路として重要な 548（Account Operators）/549（Server Operators）/550（Print Operators）/551（Backup Operators）/554（Pre-Windows 2000 Compatible Access）/555（Remote Desktop Users）が並ぶ。さらに完全性レベルは authority 16 で表され、S-1-16-4096（Low）/8192（Medium）/12288（High）/16384（System）が SACL 内のラベルとして使われる。値がドメイン・マシン非依存で一定なため、DACL/SACL・トークン・4662等のログを即座に読み解ける点が重要で、Everyone/Authenticated Users を含む緩ACEは設定ミスの兆候となる。",
    "points": [
      "ログオン文脈: S-1-1-0 Everyone / S-1-5-7 Anonymous / S-1-5-11 Authenticated Users / S-1-5-2 Network / S-1-5-4 Interactive / S-1-5-9 Enterprise DCs",
      "サービス: S-1-5-18 SYSTEM / S-1-5-19 Local Service / S-1-5-20 Network Service",
      "組み込み S-1-5-32: 544 Administrators / 545 Users / 548 Account Ops / 549 Server Ops / 551 Backup Ops / 555 Remote Desktop Users",
      "昇格に直結する組み込み群: Backup/Server/Account/Print Operators, 554 Pre-Windows 2000 Compatible Access",
      "完全性レベル(authority 16): S-1-16-4096 Low / 8192 Medium / 12288 High / 16384 System (SACLのラベル)",
      "値はドメイン非依存で一定、緩ACE(Everyone/Authenticated Users)は設定ミスの兆候"
    ],
    "related": [
      "sid",
      "rid",
      "principal",
      "secdesc",
      "dacl"
    ]
  },
  {
    "id": "guid",
    "term": "GUID",
    "en": "Globally Unique Identifier (GUID)",
    "aka": "objectGUID, UUID, schemaIDGUID, extended-rights GUID",
    "cat": "identity",
    "body": "GUID（Globally Unique Identifier、RFC 4122のUUIDに相当）は128ビットの一意識別子で、通常 8-4-4-4-12 桁の16進数（例: 1131f6ad-9c07-11d1-f79f-00c04fc2dcd2）で表記される。Active Directoryでは各オブジェクトが objectGUID 属性を持ち、これはフォレスト内での名前変更・OU間移動・ドメイン間移動でも変わらない不変の識別子で、DNやsAMAccountNameが変化しても追跡の基準になる（SIDはドメイン移動で変わり得る点と対照的）。スキーマ定義では各クラス・属性が schemaIDGUID を持ち、拡張権限（制御アクセス権）は構成パーティションの Extended-Rights コンテナで rightsGUID により識別される。オブジェクト型ACE内でこれらのGUIDが使われるため、例えば DS-Replication-Get-Changes-All（1131f6ad-9c07-11d1-f79f-00c04fc2dcd2）を含むACEはDCSyncの権限付与としてSOCが重点監視する。",
    "points": [
      "128ビット、8-4-4-4-12桁の16進表記(RFC 4122 UUID)",
      "objectGUID はフォレスト内の名前変更・移動でも不変の追跡基準",
      "schemaIDGUID=スキーマクラス/属性、rightsGUID=拡張権限を識別",
      "オブジェクト型ACEでGUIDにより特定権限を指定",
      "DS-Replication-Get-Changes-All = 1131f6ad-9c07-11d1-f79f-00c04fc2dcd2 (DCSync)"
    ],
    "related": [
      "objectguidsid",
      "secdesc",
      "dacl",
      "schema",
      "sid"
    ]
  },
  {
    "id": "secdesc",
    "term": "セキュリティ記述子 (SD)",
    "en": "Security Descriptor",
    "aka": "owner, group, DACL, SACL, SDDL",
    "cat": "identity",
    "body": "セキュリティ記述子（Security Descriptor, SD）は、保護対象オブジェクトに紐づくアクセス制御メタデータの集合体で、オーナーSID、プライマリグループSID（POSIX互換用の名残）、DACL（許可/拒否を定義）、SACL（監査とラベルを定義）、および制御フラグから成る。DACL内の各ACE（アクセス制御エントリ）は、SIDとアクセスマスクの組で誰が何をできるかを規定し、SACLはどのアクセスを監査ログに残すかを定める。テキスト表現のSDDL（例: O:BAG:DUD:...）で表され、ADオブジェクトでは nTSecurityDescriptor 属性に格納される。オーナーは自身のオブジェクトのDACLを常に変更でき（WriteDACL/WriteOwnerの悪用と併せ）権限昇格の起点になるため、SDの読み解きはSOC/レッドチーム双方の必須スキルである。",
    "points": [
      "構成: オーナーSID / グループSID / DACL / SACL / 制御フラグ",
      "DACL=許可・拒否のACE群、SACL=監査とラベル",
      "各ACEはSID+アクセスマスクで権限を規定",
      "テキスト表現はSDDL、AD属性は nTSecurityDescriptor",
      "オーナー/WriteDACL/WriteOwner悪用は権限昇格の起点"
    ],
    "related": [
      "dacl",
      "sacl",
      "sid",
      "guid",
      "adminsdholder"
    ]
  },
  {
    "id": "dacl",
    "term": "DACL / ACE",
    "en": "DACL / ACE",
    "aka": "discretionary ACL, access control entry, allow/deny, mask",
    "cat": "identity",
    "body": "DACL (Discretionary Access Control List) は、セキュリティ記述子の一部で、どのプリンシパル (SID) がオブジェクトに対してどのアクセスを許可/拒否されるかを定義するACE (Access Control Entry) の順序付きリストです。各ACEはトラスティのSID、ACEタイプ (Access Allowed / Access Denied)、そして許可される権利を表すアクセスマスク (32ビット) を持ちます。Windowsのアクセスチェックはトークン内のグループSIDとACEを順に照合し、正規順序 (canonical order) では拒否ACEが許可ACEより前に配置されるため先に評価されます。DACLが存在しない (NULL) 場合は全アクセス許可、空のDACLは全アクセス拒否を意味し、ADではWriteDACLやGenericAll等の危険な権利が権限昇格経路となります。",
    "points": [
      "ACEタイプ: Access Allowed / Access Denied が基本",
      "アクセスマスクは32ビット (汎用/標準/オブジェクト固有権利)",
      "正規順序では拒否ACEが許可ACEより前に置かれ先に評価される",
      "NULL DACL=全許可、空DACL=全拒否",
      "WriteDACL/GenericAll/WriteOwnerはAD攻撃で悪用される"
    ],
    "related": [
      "secdesc",
      "sacl",
      "sid",
      "privilege",
      "token"
    ]
  },
  {
    "id": "sacl",
    "term": "SACL",
    "en": "System ACL (SACL)",
    "aka": "auditing, 4662, object access",
    "cat": "identity",
    "body": "SACL (System Access Control List) はセキュリティ記述子内で監査を制御するACLで、どのアクセスが成功/失敗したときにセキュリティイベントログへ記録するかを監査ACE (Audit ACE) で指定します。DACLがアクセスを許可/拒否するのに対し、SACLは動作そのものを変えず、監査証跡の生成のみを担います。ドメインコントローラーではディレクトリサービスアクセス (Directory Service Access) 監査により、オブジェクトアクセスがイベントID 4662 (An operation was performed on an object) として記録され、SDDL上は「S:」で表現されます。SACLの読み書きにはSeSecurityPrivilege (ACCESS_SYSTEM_SECURITY) が必要で、攻撃者のディレクトリ列挙やDCSyncの検知に有用です。",
    "points": [
      "監査ACEで「成功」「失敗」を個別に指定できる",
      "DCのオブジェクトアクセスはイベントID 4662",
      "SDDLでは S: プレフィックスで表現される",
      "SACL操作にはSeSecurityPrivilege (ACCESS_SYSTEM_SECURITY) が必要",
      "DACLと違いアクセス可否は変えず監査のみ"
    ],
    "related": [
      "dacl",
      "secdesc",
      "auditpolicy",
      "eventlog",
      "ntds",
      "dschanges"
    ]
  },
  {
    "id": "objectguidsid",
    "term": "objectSID と objectGUID",
    "en": "objectSID vs objectGUID",
    "aka": "immutable identity, SID history,移動時の挙動",
    "cat": "identity",
    "body": "objectSIDとobjectGUIDはADオブジェクトの2種類の一意識別子です。objectSID (S-1-5-21-<ドメイン識別子>-<RID>) はドメイン単位で発行され認可 (ACL照合) に使われますが、オブジェクトを別ドメインへ移動すると新ドメインのSIDが再発行されます。一方objectGUID (128ビットのGUID) はオブジェクト生成時に付与され、名前変更・OU移動・ドメイン間移動でも不変で、フォレスト全体で一意です。ドメイン移行時には旧SIDがsIDHistory属性に保持され既存リソースへのアクセスを維持しますが、sIDHistoryのインジェクションは権限昇格に悪用されるため監視対象です。",
    "points": [
      "objectSIDはドメイン固有、ドメイン移動で再発行される",
      "objectGUIDは128ビットで生成時から不変・フォレスト一意",
      "認可はSID、恒久的な参照はGUIDで行う",
      "移行時は旧SIDをsIDHistoryに保持しアクセス継続",
      "sIDHistoryインジェクションは権限昇格に悪用される"
    ],
    "related": [
      "sid",
      "rid",
      "guid",
      "domain",
      "dacl"
    ]
  },
  {
    "id": "upn",
    "term": "UPN",
    "en": "User Principal Name (UPN)",
    "aka": "user@domain, alternate login, implicit UPN",
    "cat": "identity",
    "body": "UPN (User Principal Name) はuser@domainの形式を取るインターネット標準スタイルのログイン名で、userPrincipalName属性に格納されます。sAMAccountName (DOMAIN\\user) と異なりフォレスト全体で一意であるべき識別子で (DC機能レベル2012 R2以降では作成時に一意性が強制される)、Kerberos/最新の認証やEntra IDとのハイブリッド同期で主要な識別子となります。UPNサフィックスは実際のDNSドメイン名と一致する必要はなく、代替UPNサフィックスを設定できます。明示的なUPNが未設定の場合は「sAMAccountName@ドメインのDNS名」という暗黙のUPNが使われます。",
    "points": [
      "形式は user@domain、userPrincipalName属性に格納",
      "フォレスト全体で一意であるべき (2012 R2以降のDC機能レベルで強制)",
      "サフィックスは実DNSと不一致でも可 (代替UPNサフィックス)",
      "明示UPN未設定時は sAMAccountName@DNSドメイン が暗黙UPN",
      "Entra ID同期・最新認証での主識別子"
    ],
    "related": [
      "samaccount",
      "principal",
      "entra",
      "kerberos",
      "userobj"
    ]
  },
  {
    "id": "spn",
    "term": "SPN",
    "en": "Service Principal Name (SPN)",
    "aka": "service/host, HTTP/MSSQLSvc, servicePrincipalName, Kerberoast",
    "cat": "identity",
    "body": "SPN (Service Principal Name) はKerberosでサービスインスタンスを一意に識別する名前で、クライアントが正しいサービスチケット (ST) を要求するために使われ、servicePrincipalName属性に格納されます。形式は「サービスクラス/ホスト[:ポート][/サービス名]」で、例としてHTTP/web.contoso.com、MSSQLSvc/db.contoso.com:1433、CIFS/host、HOST/host などがあります。KDCはSPNを対応するアカウントに解決し、そのアカウントのパスワードから導出した鍵でSTを暗号化します。ユーザーアカウントに登録されたSPNはKerberoasting (ST要求→オフラインでパスワードクラック) の標的となるため、強力なパスワードやgMSAの使用が重要です。",
    "points": [
      "形式: serviceclass/host[:port][/servicename]",
      "servicePrincipalName属性に格納、Kerberosのチケット要求に使用",
      "例: HTTP/…, MSSQLSvc/…:1433, CIFS/…, HOST/…",
      "STはSPN所有アカウントのパスワード派生鍵で暗号化",
      "ユーザーアカウントのSPNはKerberoastingの標的"
    ],
    "related": [
      "kerberos",
      "st",
      "samaccount",
      "gmsa",
      "kdc"
    ]
  },
  {
    "id": "samaccount",
    "term": "sAMAccountName",
    "en": "sAMAccountName",
    "aka": "pre-Windows 2000 name, DOMAIN\\\\user, machine$",
    "cat": "identity",
    "body": "sAMAccountNameは「Windows 2000より前のログオン名」とも呼ばれる従来型のアカウント名で、DOMAIN\\user 形式のログオンやレガシー互換に使われます。後方互換のため最長20文字に制限され、\" / \\ : ; | = , + * ? < > などの文字は使用できません。ドメイン内で一意である必要があり、コンピューターアカウントでは末尾に「$」が付きます (例: PC01$)。UPNとは独立した属性で、多くの環境では両者を揃えますが必須ではなく、NTLMやログオン時の主要識別子として今も広く参照されます。",
    "points": [
      "別名: pre-Windows 2000 logon name (DOMAIN\\user)",
      "最長20文字、一部記号 (\" / \\ : ; | = , + * ? < >) は使用不可",
      "ドメイン内で一意",
      "コンピューターアカウントは末尾に $ (例: PC01$)",
      "UPNとは別属性、NTLM/ログオンで参照される"
    ],
    "related": [
      "upn",
      "principal",
      "machineacct",
      "ntlm",
      "userobj"
    ]
  },
  {
    "id": "dn",
    "term": "識別名 (DN)",
    "en": "Distinguished Name (DN)",
    "aka": "CN=..,OU=..,DC=.., RDN, LDAP path",
    "cat": "identity",
    "body": "DN (Distinguished Name / 識別名) はディレクトリツリー内でオブジェクトを一意に特定する完全パスで、LDAPの基本的なアドレッシング機構です。CN=Jane Doe,OU=Sales,DC=contoso,DC=com のように、相対識別名 (RDN) をコンマで連結し、右端がルート (ドメイン) 側になります。コンポーネントにはCN (共通名)、OU (組織単位)、DC (ドメインコンポーネント)、O、L などがあり、最も左のRDNがそのオブジェクトの親内での名前です。DNはオブジェクトの名前変更やOU移動で変化するため、恒久的な参照にはobjectGUIDを用いるべきで、LDAPバインドや検索のベースDN指定に日常的に使われます。",
    "points": [
      "RDNをコンマ連結、右端がドメイン (ルート) 側",
      "構成要素: CN, OU, DC, O, L など",
      "最左のRDNが親内でのオブジェクト名",
      "名前変更/OU移動でDNは変化する (不変はGUID)",
      "LDAPのバインド・検索ベースDNで使用"
    ],
    "related": [
      "ldap",
      "objectguidsid",
      "ou",
      "domain",
      "userobj"
    ]
  },
  {
    "id": "machineacct",
    "term": "マシンアカウント",
    "en": "Machine Account",
    "aka": "COMPUTER$, 120-char password, msDS-MachineAccountQuota",
    "cat": "identity",
    "body": "マシンアカウント (コンピューターアカウント) はドメイン参加した各コンピューターをADの一級プリンシパルとして表すアカウントで、sAMAccountNameは末尾に「$」が付きます (例: WKS01$)。参加時にランダムな120文字 (UTF-16、240バイト) のマシンパスワードが生成され、既定では30日ごとにクライアント (Netlogon) 側で自動的にローテーションされます (Maximum machine account password age)。なおこのパスワードは有効期限で失効するわけではなく30日は既定のローテーション間隔です。このパスワードのNTハッシュはローカルのHKLM\\SECURITY (LSAシークレット $MACHINE.ACC) に保存され、SYSTEM権限があれば取得可能で、コンピューターアカウントはSPN登録やKerberos認証に利用されます。既定のmsDS-MachineAccountQuotaは10で、任意の認証済みユーザーが最大10台のマシンアカウントを作成でき、RBCDやnoPac等の攻撃に悪用されるため0への変更が推奨されます。",
    "points": [
      "sAMAccountNameは末尾に $ (例: WKS01$)",
      "マシンパスワードはランダム120文字 (UTF-16 / 240バイト)",
      "既定で30日ごとにクライアント (Netlogon) が自動ローテーション (失効ではない)",
      "NTハッシュはHKLM\\SECURITY (LSAシークレット $MACHINE.ACC) に保存",
      "msDS-MachineAccountQuota既定=10 → 0への変更を推奨"
    ],
    "related": [
      "samaccount",
      "spn",
      "kerberos",
      "computerobj",
      "lsass"
    ]
  },
  {
    "id": "adds",
    "term": "Active Directory (AD DS)",
    "en": "Active Directory Domain Services",
    "aka": "directory service, LDAP, Kerberos, x.500",
    "cat": "adstruct",
    "body": "Active Directory Domain Services (AD DS) は、Windows 2000 で導入された Microsoft のディレクトリサービスで、ユーザー・コンピュータ・グループなどのオブジェクトを X.500 に由来する階層構造で一元管理する。ディレクトリの読み書きには LDAP (TCP 389 / LDAPS 636)、認証には主に Kerberos (TCP/UDP 88) を用い、データは各ドメインコントローラの NTDS.dit に格納される。企業ネットワークの ID・認証・ポリシー配布の中核であるため、AD DS の侵害はドメイン全体の掌握に直結し、攻撃者の最終目標となりやすい。",
    "points": [
      "LDAP は 389 / LDAPS 636、Kerberos は 88、Global Catalog は 3268/3269",
      "ディレクトリ実体は各 DC の NTDS.dit (ESE データベース)",
      "論理構造: フォレスト > ドメイン(ツリー) > OU > オブジェクト",
      "認証(Kerberos/NTLM)・認可・GPO 配布を提供"
    ],
    "related": [
      "domain",
      "dc",
      "ldap",
      "kerberos",
      "ntds"
    ]
  },
  {
    "id": "forest",
    "term": "フォレスト",
    "en": "Forest",
    "aka": "security boundary, schema, Enterprise Admins, config partition",
    "cat": "adstruct",
    "body": "フォレストは AD の最上位コンテナであり、Windows 環境における真のセキュリティ境界である。フォレスト内の全ドメインは単一のスキーマと構成 (Configuration) ネーミングコンテキストを共有し、フォレスト全体を制御する Enterprise Admins グループを持つ。最初に作成されたドメインがフォレストルートドメインとなり、内部のドメイン間は既定で双方向・推移的な Kerberos 信頼で結ばれるため、あるドメインの完全な侵害は同一フォレスト内の他ドメインへ波及し得る。",
    "points": [
      "セキュリティ境界はドメインではなくフォレスト",
      "単一のスキーマ NC と構成 NC をフォレスト全体で共有",
      "Enterprise Admins / Schema Admins はフォレストルートドメインに存在",
      "内部ドメイン間は既定で双方向・推移的な信頼"
    ],
    "related": [
      "domain",
      "schema",
      "trust",
      "domaintree",
      "adds"
    ]
  },
  {
    "id": "domain",
    "term": "ドメイン",
    "en": "Domain",
    "aka": "replication/policy boundary, NetBIOS/FQDN, partition",
    "cat": "adstruct",
    "body": "ドメインは AD のレプリケーションおよび管理・ポリシーの境界となる区画 (パーティション/ネーミングコンテキスト) で、ユーザー・コンピュータ・グループなどのオブジェクトを保持する。DNS 形式の FQDN (例: corp.example.com) とレガシーな NetBIOS 名 (例: CORP) の両方で識別される。重要な点として、ドメインは管理境界ではあってもセキュリティ境界ではなく、その役割はフォレストが担う。",
    "points": [
      "ドメイン NC は同一ドメインの全 DC 間でレプリケートされる",
      "DNS FQDN と NetBIOS 名の 2 つの名前を持つ",
      "レプリケーション・GPO・アカウントポリシーの境界",
      "セキュリティ境界ではない (境界はフォレスト)"
    ],
    "related": [
      "forest",
      "dc",
      "ou",
      "replication",
      "domaintree"
    ]
  },
  {
    "id": "domaintree",
    "term": "ドメインツリー",
    "en": "Domain Tree",
    "aka": "contiguous namespace, parent/child, automatic trust",
    "cat": "adstruct",
    "body": "ドメインツリーは、連続した (contiguous) DNS 名前空間を共有し親子関係で結ばれた 1 つ以上のドメインの集合である。子ドメイン (例: emea.corp.example.com) は親ドメイン (corp.example.com) の名前空間を継承する。親子ドメイン間には作成時に自動的に双方向・推移的な Kerberos 信頼が確立されるため、ツリー内の認証は透過的に行われる。",
    "points": [
      "連続した DNS 名前空間 (親名を子が継承)",
      "親子ドメイン間は自動で双方向・推移的信頼",
      "1 フォレストは複数の非連続ツリーを含み得る",
      "信頼の推移性によりツリー全体で認証が伝播"
    ],
    "related": [
      "forest",
      "domain",
      "trust"
    ]
  },
  {
    "id": "ou",
    "term": "組織単位 (OU)",
    "en": "Organizational Unit (OU)",
    "aka": "container, GPO link, delegation, hierarchy",
    "cat": "adstruct",
    "body": "組織単位 (OU) はドメイン内でオブジェクトを整理するためのコンテナで、階層的にネスト可能である。OU はグループポリシー (GPO) をリンクする主要な対象であり、また ACL を用いた管理権限の委任 (delegation) の単位でもある。OU 自体はセキュリティプリンシパルではなくグループのようにアクセス制御に使うものではないが、OU 上の ACL や委任の設定ミスは権限昇格経路になり得るため監査対象となる。",
    "points": [
      "GPO リンクと権限委任の主要な対象",
      "階層的にネスト可能 (継承あり)",
      "セキュリティプリンシパルではない (SID を持たない)",
      "OU 上の危険な ACL (GenericAll 等) は昇格経路"
    ],
    "related": [
      "domain",
      "gpo",
      "dacl",
      "delegation"
    ]
  },
  {
    "id": "dc",
    "term": "ドメインコントローラ (DC)",
    "en": "Domain Controller (DC)",
    "aka": "KDC, LDAP server, NTDS.dit host, RODC",
    "cat": "adstruct",
    "body": "ドメインコントローラ (DC) は AD DS を実行するサーバで、書き込み可能な AD データベース NTDS.dit を保持し、Kerberos の鍵配布センター (KDC) および LDAP サーバとして動作する。ドメイン内のすべての認証・認可要求を処理するため、DC の掌握はドメイン全体の掌握に等しい。書き込み不可でシークレットのキャッシュを制限する RODC (読み取り専用 DC) は、支店など物理的に安全でない拠点向けの変種である。",
    "points": [
      "書き込み可能な NTDS.dit を保持し KDC/LDAP として動作",
      "DC 掌握 = ドメイン掌握 (DCSync や NTDS.dit 窃取の標的)",
      "RODC は読み取り専用でシークレットのキャッシュを制限",
      "昇格には Domain Admins 等の特権が必要"
    ],
    "related": [
      "adds",
      "ntds",
      "kdc",
      "kerberos",
      "ldap"
    ]
  },
  {
    "id": "gc",
    "term": "グローバルカタログ (GC)",
    "en": "Global Catalog (GC)",
    "aka": "3268/3269, partial forest-wide replica, UPN lookup",
    "cat": "adstruct",
    "body": "グローバルカタログ (GC) は、自ドメインの完全なレプリカに加え、フォレスト内の他の全ドメインのオブジェクトについて属性の一部だけを保持する読み取り専用の部分レプリカ (Partial Attribute Set) を提供する DC の役割である。LDAP は TCP 3268、SSL/TLS 付きは 3269 で待ち受ける。UPN でのログオン、フォレスト横断の検索、ユニバーサルグループのメンバーシップ解決に不可欠で、どの属性を GC に複製するかはスキーマ (isMemberOfPartialAttributeSet) で制御される。",
    "points": [
      "ポート: LDAP 3268 / LDAPS 3269 (通常の 389/636 とは別)",
      "自ドメインは完全、他ドメインは部分属性セット (PAS) のみ",
      "UPN ログオンとユニバーサルグループ解決に必須",
      "GC 複製属性はスキーマ (PAS フラグ) で定義"
    ],
    "related": [
      "dc",
      "forest",
      "replication",
      "schema",
      "ldap"
    ]
  },
  {
    "id": "schema",
    "term": "スキーマ",
    "en": "Schema",
    "aka": "classSchema, attributeSchema, Schema Admins, forest-wide",
    "cat": "adstruct",
    "body": "スキーマは AD 内に作成できる全オブジェクトの設計図で、オブジェクトクラスを定義する classSchema オブジェクトと属性を定義する attributeSchema オブジェクトから成る。スキーマはフォレスト全体で単一かつ共通で、全 DC に複製され、変更は Schema Admins グループのメンバーが Schema マスター FSMO 役割を持つ DC 上でのみ行える。スキーマの変更は基本的に取り消せず (削除ではなく無効化のみ)、フォレスト全体に影響するため厳重に管理すべき対象である。",
    "points": [
      "classSchema (クラス) と attributeSchema (属性) で構成",
      "フォレスト全体で単一・共通、全 DC に複製",
      "変更は Schema Admins かつ Schema マスター FSMO 上のみ",
      "変更は原則取り消し不可 (削除不可、無効化のみ)"
    ],
    "related": [
      "forest",
      "adds",
      "fsmo",
      "guid"
    ]
  },
  {
    "id": "ntds",
    "term": "NTDS.dit",
    "en": "NTDS.dit",
    "aka": "AD database, ESE, secrets, DCSync target",
    "cat": "adstruct",
    "body": "NTDS.dit は Active Directory データベースの実体で、既定で各ドメインコントローラーの %SystemRoot%\\NTDS\\ntds.dit に置かれる ESE (Extensible Storage Engine / JET Blue) 形式のファイルです。ユーザー・グループ・コンピューターなどのオブジェクトを datatable と link_table に格納し、アカウントの NT ハッシュや Kerberos 鍵、krbtgt シークレット、LAPS/信頼パスワードといった機密属性を含みます。これらの二次暗号化に使われる PEK(パスワード暗号化キー)はレジストリの SYSTEM ハイブ内 BootKey(SYSKEY)で保護されるため、攻撃者は ntds.dit と SYSTEM ハイブの両方を必要とします。ボリュームシャドウコピーや ntdsutil による IFM 作成、あるいは DCSync でのオフライン抽出が代表的な窃取手口で、ドメイン内全アカウントの侵害に直結するため最重要防御対象です。",
    "points": [
      "既定パス: %SystemRoot%\\NTDS\\ntds.dit(ESE/JET Blue DB)",
      "主要テーブル: datatable(オブジェクト)と link_table(リンク値属性)",
      "機密属性は PEK で暗号化、PEK は SYSTEM ハイブの BootKey で保護",
      "抽出には ntds.dit と SYSTEM ハイブの両方が必要",
      "窃取手口: VSS、ntdsutil IFM、DCSync"
    ],
    "related": [
      "dc",
      "replication",
      "dpapi",
      "krbtgt",
      "sam"
    ]
  },
  {
    "id": "sysvol",
    "term": "SYSVOL",
    "en": "SYSVOL",
    "aka": "GPO storage, scripts, DFSR/FRS, \\\\domain\\SYSVOL",
    "cat": "adstruct",
    "body": "SYSVOL は各ドメインコントローラーで共有される公開フォルダーで、既定では %SystemRoot%\\SYSVOL に置かれ、\\\\<domain>\\SYSVOL および \\\\<dc>\\SYSVOL としてネットワーク公開されます。グループポリシー(GPO のファイル部分=Policies フォルダー内の GUID 名サブフォルダー)、ログオン/スタートアップスクリプトなどを格納し、全 DC 間で複製されるため認証済みユーザーは既定で内容を読み取れます。複製は 2008 ドメイン機能レベル以降は DFSR、それ以前は FRS(ファイル複製サービス)が担います。セキュリティ上は、Group Policy Preferences の cpassword(AES 鍵が MSDN で公開済み)や、スクリプト内の平文資格情報が SYSVOL 上に残ることが典型的な情報漏えい経路になります。",
    "points": [
      "既定パス %SystemRoot%\\SYSVOL、共有 \\\\<domain>\\SYSVOL",
      "GPO のファイル部分(Policies\\{GUID})とログオンスクリプトを格納",
      "認証済みユーザーは既定で読み取り可能",
      "複製: DFSR(2008 DFL 以上)/ 旧来の FRS",
      "漏えい例: GPP cpassword、スクリプト内平文パスワード"
    ],
    "related": [
      "gpo",
      "replication",
      "dc",
      "domain",
      "smb"
    ]
  },
  {
    "id": "replication",
    "term": "レプリケーション",
    "en": "Replication",
    "aka": "DRSUAPI, USN, multi-master, DCSync",
    "cat": "adstruct",
    "body": "AD のレプリケーションはドメインコントローラー間でディレクトリ変更を同期する仕組みで、書き込み可能な DC が対等に更新を受け付けるマルチマスター方式です(RODC を除く)。変更は 64 ビットの USN(Update Sequence Number)で順序付けされ、各 DC は「high-watermark(上位ウォーターマーク)」と「up-to-dateness vector」で相手ごとの取得済み位置を管理して重複や収束遅延を抑えます。DC 間の実データ転送は RPC 上の DRSUAPI(Directory Replication Service Remote Protocol)で行われ、変更取得の中核は IDL_DRSGetNCChanges 呼び出しです。攻撃者が DS-Replication-Get-Changes / -All 拡張権限を悪用してこの正規の複製 API を呼び、unicodePwd などの秘密属性を引き出すのが DCSync 攻撃です。",
    "points": [
      "マルチマスター方式(RODC は読み取り専用の例外)",
      "変更順序付けは 64 ビット USN",
      "状態追跡: high-watermark と up-to-dateness vector",
      "転送プロトコル: RPC 上の DRSUAPI、核は IDL_DRSGetNCChanges",
      "DCSync は DS-Replication-Get-Changes(-All) 権限を悪用"
    ],
    "related": [
      "dc",
      "ntds",
      "fsmo",
      "rpc",
      "sites"
    ]
  },
  {
    "id": "fsmo",
    "term": "FSMO 役割",
    "en": "FSMO Roles",
    "aka": "PDC Emulator, RID/Schema/Domain-naming/Infrastructure master",
    "cat": "adstruct",
    "body": "FSMO(Flexible Single Master Operations)役割は、マルチマスター複製では衝突が問題になる特定操作を単一の DC に集約する仕組みで、合計 5 種類あります。フォレスト全体で 1 つずつのスキーママスターとドメイン名前付けマスター、各ドメインに 1 つずつの RID マスター・PDC エミュレーター・インフラストラクチャマスターです。RID マスターは各 DC に RID プールを払い出して SID の一意性を保証し、PDC エミュレーターはパスワード変更・アカウントロックアウトの優先処理と権威時刻同期を担うため、Kerberos やセキュリティ運用上とりわけ重要です。役割保持 DC を把握しておくことは、DCSync/Golden Ticket などの調査や障害時の seize(強制移管)判断で不可欠です。",
    "points": [
      "合計 5 役割: 2 つはフォレスト全体、3 つはドメインごと",
      "フォレスト: スキーママスター、ドメイン名前付けマスター",
      "ドメイン: RID マスター、PDC エミュレーター、インフラストラクチャマスター",
      "RID マスターが RID プールを配布し SID の一意性を保証",
      "PDC エミュレーターはパスワード/ロックアウト処理と権威時刻源"
    ],
    "related": [
      "dc",
      "domain",
      "forest",
      "rid",
      "replication"
    ]
  },
  {
    "id": "sites",
    "term": "サイトとサブネット",
    "en": "Sites & Subnets",
    "aka": "replication topology, DC locator, KCC",
    "cat": "adstruct",
    "body": "サイトとサブネットは AD の物理トポロジ表現で、サイトは高速リンクで結ばれたネットワーク領域を表し、IP サブネットをサイトに関連付けることで各 DC やクライアントが自分の所属サイトを判別します。KCC(Knowledge Consistency Checker)がサイト内・サイト間の複製トポロジ(接続オブジェクト)を自動生成し、サイト間ではサイトリンクのコストとスケジュールに従って複製が最適化されます。クライアントの DC ロケーターは、DNS の SRV レコードとサイト情報を用いて最寄りの DC を選択します。セキュリティ観点では、サブネット未定義や誤ったサイト割り当てが認証を遠隔 DC に誘導し、監視や可視性の死角を生むことがあります。",
    "points": [
      "サイト=高速リンクのネットワーク領域、サブネットをサイトへ関連付け",
      "KCC がサイト内/サイト間の複製トポロジを自動生成",
      "サイト間複製はサイトリンクのコストとスケジュールで最適化",
      "DC ロケーターは DNS SRV レコード + サイト情報で最寄り DC を選択",
      "誤ったサブネット/サイト割り当ては監視の死角を生む"
    ],
    "related": [
      "dc",
      "replication",
      "domain",
      "adds",
      "kerberos"
    ]
  },
  {
    "id": "trust",
    "term": "信頼関係 (Trust)",
    "en": "Trust",
    "aka": "one/two-way, transitive, external/forest, SID filtering",
    "cat": "adstruct",
    "body": "信頼(Trust)は、あるドメイン/フォレストの認証結果を別のドメイン/フォレストが受け入れるための関係で、信頼の「方向(一方向/双方向)」と「推移性(transitive)」で性質が決まります。種類には親子・ツリールート(フォレスト内で自動生成、推移的)、外部トラスト(非推移的、通常ドメイン間)、フォレストトラスト(2 フォレストのルート間、フォレスト内では推移的)、レルムトラスト(Kerberos レルム=非 Windows)、ショートカットトラストなどがあります。各信頼は TDO(Trusted Domain Object)としてディレクトリに保持され、信頼鍵は認証の要になります。セキュリティ上は SID フィルタリング(SID history の悪用や外部 SID の注入を遮断)や、フォレストトラストにおける selective authentication の有無が横展開の可否を左右します。",
    "points": [
      "性質は方向(一方向/双方向)と推移性で決まる",
      "種類: 親子/ツリールート(自動・推移的)、外部、フォレスト、レルム、ショートカット",
      "各信頼は TDO(Trusted Domain Object)として保持",
      "SID フィルタリングが SID history 悪用/外部 SID 注入を遮断",
      "フォレストトラストの selective authentication が横展開を制限"
    ],
    "related": [
      "forest",
      "domain",
      "kerberos",
      "sid",
      "domaintree",
      "shadowprincipal"
    ]
  },
  {
    "id": "ldap",
    "term": "LDAP",
    "en": "Lightweight Directory Access Protocol (LDAP)",
    "aka": "389/636/3268, bind, search filter, LDAPS, signing",
    "cat": "adstruct",
    "body": "LDAP(Lightweight Directory Access Protocol)は AD のディレクトリを読み書き・検索するための標準プロトコルで、DC は平文/StartTLS の 389 番、SSL/TLS の 636 番(LDAPS)で待ち受けます。加えてグローバルカタログ用に 3268 番(GC)と 3269 番(GC over SSL)を提供し、GC 経由ではフォレスト全体の部分的属性セットを検索できます。操作は bind(認証: 匿名/simple/SASL=Kerberos や NTLM)と search(RFC 4515 の検索フィルタ)が中心で、BloodHound などの列挙もこの検索を多用します。セキュリティ上は、simple bind の平文資格情報漏えいを防ぐ LDAP シグニチャ(署名)とチャネルバインディングの強制が中間者・リレー攻撃対策として重要です。",
    "points": [
      "ポート: 389(LDAP)、636(LDAPS)",
      "グローバルカタログ: 3268(GC)、3269(GC over SSL)",
      "中心操作: bind(認証)と search(RFC 4515 フィルタ)",
      "SASL bind は Kerberos/NTLM を利用可",
      "LDAP 署名 + チャネルバインディング強制がリレー対策の要"
    ],
    "related": [
      "dc",
      "gc",
      "adws",
      "kerberos",
      "ntlm"
    ]
  },
  {
    "id": "adws",
    "term": "AD Web Services (ADWS)",
    "en": "AD Web Services (ADWS)",
    "aka": "9389, ActiveDirectory PowerShell module, SOAPHound",
    "cat": "adstruct",
    "body": "AD Web Services(ADWS)は、Windows Server 2008 R2 以降のすべての DC で既定有効となるサービスで、TCP 9389 番で待ち受けます。ActiveDirectory PowerShell モジュール(Get-ADUser 等)や Active Directory 管理センターが利用する SOAP ベースのインターフェースで、内部的には LDAP クエリを SOAP/XML メッセージにラップし、暗号化された NetTCPBinding チャネル経由で DC に送り、DC 側で解いてローカルの LDAP へ転送します。セキュリティ上は、SOAPHound / SoaPy / soaphound.py といったツールが ADWS を悪用し、直接 LDAP(389/636)を発行せずに AD を列挙することで、LDAP に偏った監視をすり抜けるステルス収集を行う点が注目されています。したがって Blue チームは 9389 番の異常なアクセスや ADWS 経由の大量クエリも監視対象に含めるべきです。",
    "points": [
      "TCP 9389、2008 R2 以降の DC で既定有効",
      "ActiveDirectory PowerShell モジュール / ADAC のバックエンド",
      "LDAP を SOAP/XML にラップし NetTCPBinding で伝送",
      "SOAPHound/SoaPy が直接 LDAP を回避したステルス列挙に悪用",
      "9389 の監視が LDAP 偏重の検知の死角を埋める"
    ],
    "related": [
      "ldap",
      "dc",
      "adds",
      "etw",
      "rpc"
    ]
  },
  {
    "id": "userobj",
    "term": "ユーザーオブジェクト",
    "en": "User Object",
    "aka": "userAccountControl, memberOf, pwdLastSet, attributes",
    "cat": "objects",
    "body": "ユーザーオブジェクト(objectClass=user、継承は top→person→organizationalPerson→user)は AD に登録された人間のアカウントで、認証・認可の主体(セキュリティプリンシパル)となる。objectSid、sAMAccountName、userPrincipalName、pwdLastSet(Windows FILETIME、0 は次回ログオン時変更必須)などの属性を持つ。要となる userAccountControl はビットマスクで、代表値は ACCOUNTDISABLE=0x2(無効)、PASSWD_NOTREQD=0x20、DONT_EXPIRE_PASSWORD=0x10000、NORMAL_ACCOUNT=0x200、TRUSTED_FOR_DELEGATION=0x80000(非制約委任)、DONT_REQ_PREAUTH=0x400000(事前認証不要=ASREP-Roasting 対象)、TRUSTED_TO_AUTH_FOR_DELEGATION=0x1000000(制約委任/プロトコル遷移)。特に委任系(0x80000/0x1000000)や事前認証不要(0x400000)のビットが立つアカウントは直接攻撃面になる。memberOf はグループの member 属性から自動維持されるバックリンク(リンク属性)であり、権限監査では UAC ビットと memberOf を併せて確認する必要がある。ログオン追跡には複製される lastLogonTimestamp と各 DC ローカルの lastLogon の違いにも注意する。",
    "points": [
      "継承: top→person→organizationalPerson→user、RID(SID 末尾)は通常 1000 以上",
      "UAC 主要ビット: ACCOUNTDISABLE=0x2、PASSWD_NOTREQD=0x20、DONT_EXPIRE_PASSWORD=0x10000",
      "攻撃対応ビット: DONT_REQ_PREAUTH=0x400000(ASREP)、TRUSTED_FOR_DELEGATION=0x80000(非制約委任)、TRUSTED_TO_AUTH_FOR_DELEGATION=0x1000000(制約委任)",
      "pwdLastSet=0 は次回ログオン時パスワード変更必須(FILETIME)",
      "memberOf は member から自動維持されるバックリンク",
      "SPN を持つユーザーは Kerberoasting、UAC 0x400000 は ASREP-Roasting の標的"
    ],
    "related": [
      "principal",
      "sid",
      "uacflags",
      "samaccount",
      "group"
    ]
  },
  {
    "id": "computerobj",
    "term": "コンピュータオブジェクト",
    "en": "Computer Object",
    "aka": "machine account, dNSHostName, SPN, LAPS",
    "cat": "objects",
    "body": "コンピュータオブジェクト(objectClass=computer、userのサブクラス)はドメイン参加したマシンのアカウントで、sAMAccountName は末尾が「$」になる。マシンアカウントとしてKerberos認証を行い、dNSHostName、servicePrincipalName(HOST/、CIFS/等)を保持し、マシンパスワードは既定で30日ごとにローテーションされる。ローカル管理者パスワードの一元管理には LAPS(旧 ms-Mcs-AdmPwd、Windows LAPS では msLAPS-Password 系属性)が使われ、RBCD(msDS-AllowedToActOnBehalfOfOtherIdentity)などの委任攻撃の起点にもなる。",
    "points": [
      "objectClass=computer は user のサブクラス",
      "sAMAccountName は末尾が「$」",
      "マシンパスワードは既定30日でローテーション",
      "SPN と dNSHostName を保持(Kerberos の要)",
      "LAPS 属性・RBCD(msDS-AllowedToActOnBehalfOfOtherIdentity)が要注意"
    ],
    "related": [
      "machineacct",
      "spn",
      "userobj",
      "delegation",
      "principal"
    ]
  },
  {
    "id": "group",
    "term": "グループ (セキュリティ/配布)",
    "en": "Group (Security / Distribution)",
    "aka": "member, memberOf, token, mailing list",
    "cat": "objects",
    "body": "グループは複数のプリンシパルをまとめるADオブジェクトで、種別に「セキュリティ」と「配布」がある。セキュリティグループはSIDを持ちアクセストークンに展開されて認可(DACL評価)に使われる。一方、配布グループはセキュリティプリンシパルではなくSIDを持たないため、ACLでは使えずトークンにも展開されず、主にメール配信用である。メンバーシップは member 属性(前方リンク)で定義され、memberOf(後方リンク)で参照される。ネスト(入れ子)によりトークンに間接的な権限が展開されるため、実効権限の把握には再帰的な展開が必要となる。",
    "points": [
      "セキュリティグループのSIDのみアクセストークンに展開される",
      "配布グループはメール用・SIDなしでトークン非展開・ACL不可",
      "member=前方リンク / memberOf=後方リンク",
      "ネストにより権限が間接展開される",
      "groupType 属性で種別とスコープを判別(セキュリティビット=0x80000000)"
    ],
    "related": [
      "groupscope",
      "token",
      "sid",
      "dacl",
      "principal",
      "primarygroupid"
    ]
  },
  {
    "id": "groupscope",
    "term": "グループスコープ",
    "en": "Group Scope",
    "aka": "Domain Local / Global / Universal, AGDLP",
    "cat": "objects",
    "body": "グループスコープはメンバーに含められる範囲と付与できる権限の範囲を規定し、Domain Local / Global / Universal の3種がある。Global はドメイン内のメンバーをまとめ他ドメインでも使え、Domain Local は権限付与(リソース側)に使い任意ドメインのメンバーを含められ、Universal はフォレスト全体で使えメンバーシップがグローバルカタログ(GC)に複製・キャッシュされる。マイクロソフト推奨のネスト設計は AGDLP(Account→Global→Domain Local→Permission)で、Universal 変更は GC 複製を伴う点も運用上重要。",
    "points": [
      "3種:Domain Local(0x4)/ Global(0x2)/ Universal(0x8)",
      "Universal のメンバーシップは GC に複製される",
      "推奨設計は AGDLP",
      "Domain Local はリソース(権限付与)側で使用",
      "スコープ変換には一定の制約がある"
    ],
    "related": [
      "group",
      "gc",
      "domain",
      "forest",
      "sid"
    ]
  },
  {
    "id": "gmsa",
    "term": "gMSA / dMSA",
    "en": "gMSA / dMSA",
    "aka": "managed service account, msDS-ManagedPassword, KDS root key",
    "cat": "objects",
    "body": "gMSA(グループ管理サービスアカウント)はサービス用アカウントのパスワードをADが自動生成・管理する仕組みで、msDS-ManagedPassword(BLOB)としてKDSルートキーと msDS-ManagedPasswordId から決定論的に導出され、既定30日(msDS-ManagedPasswordInterval、作成時に指定し以後変更不可)でローテーションされる。パスワード取得は msDS-GroupMSAMembership(PrincipalsAllowedToRetrieveManagedPassword)で認可され、この読取権限を持つ主体は事実上そのアカウントを乗っ取れる(ReadGMSAPassword)。dMSA は Windows Server 2025 で導入された委任型で、msDS-ManagedAccountPrecededByLink と msDS-DelegatedMSAState=2(移行完了)を悪用する BadSuccessor 権限昇格(Event 4662 で検知)で注目されている。",
    "points": [
      "パスワードは KDS ルートキーから決定論的に導出される",
      "既定30日で自動ローテーション(msDS-ManagedPasswordInterval)",
      "msDS-ManagedPassword(BLOB)を取得できる主体が乗っ取り可能",
      "認可属性:msDS-GroupMSAMembership",
      "dMSA(Server 2025):BadSuccessor 昇格(state=2)、監視は Event 4662"
    ],
    "related": [
      "machineacct",
      "krbtgt",
      "kerberos",
      "dacl",
      "computerobj"
    ]
  },
  {
    "id": "gpo",
    "term": "グループポリシー (GPO)",
    "en": "Group Policy Object (GPO)",
    "aka": "gPLink, SYSVOL, gpupdate, computer/user config",
    "cat": "objects",
    "body": "GPO(グループポリシーオブジェクト)はレジストリ設定・スクリプト・セキュリティ設定などをドメイン内のマシンやユーザーに一元適用する仕組みで、実体は2つに分かれる:AD内のGPC(CN=Policies,CN=System配下、GUID名)と、SYSVOL共有上のGPT(実ファイル)。適用対象はサイト/ドメイン/OUに gPLink 属性でリンクされ、LSDOU順に評価される。既定でメンバは約90分(0〜30分のランダム揺らぎ付き)、DCは約5分ごとに更新され、コンピュータ/ユーザーの2構成を持つ。SYSVOLやGPOのDACLへの書込権限は攻撃者にとって強力な横展開・昇格経路となる。",
    "points": [
      "GPC(AD、GUID名)+ GPT(SYSVOL)の2構成",
      "gPLink でサイト/ドメイン/OUにリンク、LSDOU順で評価",
      "既定更新間隔:メンバ約90分(+0〜30分揺らぎ)、DC約5分",
      "コンピュータ構成とユーザー構成を持つ",
      "SYSVOL/GPO DACL への書込は昇格・横展開経路"
    ],
    "related": [
      "sysvol",
      "ou",
      "dacl",
      "domain",
      "dc"
    ]
  },
  {
    "id": "krbtgt",
    "term": "krbtgt アカウント",
    "en": "krbtgt Account",
    "aka": "KDC service key, Golden Ticket, RID 502,双方向鍵",
    "cat": "objects",
    "body": "krbtgt はKDC(鍵配布センター)のサービスアカウントで、各ドメインに存在し RID は 502、既定で無効化されている。そのパスワードから導出される鍵(RC4は NTハッシュ、AESは専用導出鍵)で全ての TGT が暗号化され、PAC の KDC 署名にも使われる。この鍵を入手した攻撃者は任意のユーザー・任意のグループSIDを含む TGT を偽造でき、これが Golden Ticket 攻撃である。鍵は履歴が2世代保持されるため、確実な無効化にはパスワードを(複製間隔を空けて)2回リセットする必要がある。",
    "points": [
      "RID は 502、各ドメインに1つ、既定で無効",
      "全 TGT の暗号化と PAC の KDC 署名に使われる",
      "krbtgt 鍵の入手 = Golden Ticket 偽造が可能",
      "鍵は2世代保持されるため無効化にはパスワード2回リセット",
      "RC4 は NTハッシュ、AES は専用導出鍵を使用"
    ],
    "related": [
      "kdc",
      "tgt",
      "pac",
      "kerberos",
      "nthash"
    ]
  },
  {
    "id": "uacflags",
    "term": "userAccountControl フラグ",
    "en": "userAccountControl (UAC flags)",
    "aka": "DONT_REQ_PREAUTH, TRUSTED_FOR_DELEGATION, PASSWD_NOTREQD",
    "cat": "objects",
    "body": "userAccountControl(UAC)はユーザー/コンピュータオブジェクトのアカウント状態を1つの整数(ビットマスク)で表す属性で、各ビットが個別のフラグを表す。セキュリティ上重要なフラグとして、ACCOUNTDISABLE=0x2、PASSWD_NOTREQD=0x20(パスワード不要)、DONT_EXPIRE_PASSWORD=0x10000、TRUSTED_FOR_DELEGATION=0x80000(無制限委任)、DONT_REQ_PREAUTH=0x400000(Kerberos事前認証不要=AS-REP Roasting可能)などがある。攻撃者はこれらのフラグを列挙・改変して昇格や資格情報窃取の足掛かりとするため、監査対象として重要。※Windowsログオン時のUAC(User Account Control)とは別物である点に注意。",
    "points": [
      "整数のビットマスク属性(各ビットが1フラグ)",
      "DONT_REQ_PREAUTH=0x400000 → AS-REP Roasting 可",
      "TRUSTED_FOR_DELEGATION=0x80000 → 無制限委任",
      "PASSWD_NOTREQD=0x20 / DONT_EXPIRE_PASSWORD=0x10000",
      "ACCOUNTDISABLE=0x2、Windowsのログオン確認UACとは無関係"
    ],
    "related": [
      "userobj",
      "delegation",
      "preauth",
      "kerberos",
      "computerobj"
    ]
  },
  {
    "id": "protectedusers",
    "term": "Protected Users グループ",
    "en": "Protected Users Group",
    "aka": "no NTLM/RC4/delegation, credential hardening",
    "cat": "objects",
    "body": "Protected Users は Windows Server 2012 R2 で導入された組み込みグローバルセキュリティグループ（RID 525、SID は S-1-5-21-<ドメイン>-525）で、特権アカウントの資格情報露出を抑えるためのものです。メンバーはクライアント側で WDigest/CredSSP による平文キャッシュや NT ハッシュ（NTOWF）のキャッシュが停止され、DC 側（ドメイン機能レベル 2012 R2 以上が必要）では NTLM 認証が禁止、Kerberos の DES/RC4 鍵生成が停止して AES のみとなり、制約付き/制約なし委任の対象にできず、TGT の既定寿命が 4 時間で更新不可になります。これにより Pass-the-Hash や委任悪用のリスクが大幅に低減されますが、RC4 依存や NTLM 依存のサービスでは認証が壊れる副作用に注意が必要です。",
    "points": [
      "組み込み RID 525、SID = S-1-5-21-<ドメイン>-525",
      "DC 側保護にはドメイン機能レベル 2012 R2 以上が必要",
      "メンバーは NTLM 不可、Kerberos は DES/RC4 不可（AES のみ）",
      "委任（制約付き/制約なし）の対象にできない",
      "TGT 既定寿命 4 時間・更新不可、平文/NT ハッシュのキャッシュ停止"
    ],
    "related": [
      "nthash",
      "kerberos",
      "delegation",
      "ntlm",
      "adminsdholder"
    ]
  },
  {
    "id": "adminsdholder",
    "term": "adminCount / AdminSDHolder",
    "en": "adminCount / AdminSDHolder",
    "aka": "SDProp, protected groups, ACL restoration",
    "cat": "objects",
    "body": "AdminSDHolder は各ドメインの CN=AdminSDHolder,CN=System,DC=... に存在する特殊オブジェクトで、その DACL が「特権グループとそのメンバー」に強制適用されるテンプレートとして機能します。SDProp（Security Descriptor Propagator）が PDC エミュレータ上で既定 60 分ごと（レジストリ AdminSDProtectFrequency、60〜7200 秒）に実行され、保護対象（Domain Admins、Enterprise Admins、krbtgt など約 20 のグループとそのメンバー）の ACL を AdminSDHolder のものへ上書きし、adminCount 属性を 1 に設定して継承（inheritance）を無効化します。攻撃者が AdminSDHolder の DACL に自分の権利を書き込むと SDProp が全特権アカウントへ伝播させるため、ステルス性の高い永続化バックドアとして悪用され、逆に adminCount=1 のまま残った孤児オブジェクトは監査上の要注意対象になります。",
    "points": [
      "場所: CN=AdminSDHolder,CN=System,DC=...",
      "SDProp は PDCe 上で既定 60 分ごと実行（AdminSDProtectFrequency 60〜7200 秒）",
      "保護対象は約 20 の特権グループ+メンバー、adminCount=1 が付与され継承が無効化",
      "AdminSDHolder の DACL 改ざんは特権全体への永続化手口",
      "adminCount=1 の孤児アカウントは残留権限の監査ポイント"
    ],
    "related": [
      "dacl",
      "secdesc",
      "group",
      "fsmo",
      "krbtgt",
      "dsheuristics"
    ]
  },
  {
    "id": "authnz",
    "term": "認証と認可",
    "en": "Authentication vs Authorization",
    "aka": "AuthN, AuthZ, identity vs access",
    "cat": "auth",
    "body": "認証（Authentication / AuthN）は「あなたは誰か」を検証するプロセスで、パスワード・ハッシュ・チケット・証明書などの資格情報によって主体（プリンシパル）の身元を確認します。認可（Authorization / AuthZ）は「あなたは何を許可されているか」を判断するプロセスで、Windows ではアクセストークン内の SID とグループ、対象オブジェクトのセキュリティ記述子（DACL）を突き合わせてアクセス可否を決定します。両者は独立しており、認証が成功しても認可で拒否されることがあり、SOC 分析では「なりすまし（AuthN 侵害）」と「権限昇格（AuthZ 侵害）」を区別して考えることが重要です。",
    "points": [
      "AuthN = 身元の検証、AuthZ = 権限の判断（別工程）",
      "Windows の AuthZ はアクセストークンの SID/グループ vs DACL",
      "認証成功でも認可で拒否されうる",
      "なりすまし=AuthN 侵害、権限昇格=AuthZ 侵害"
    ],
    "related": [
      "token",
      "sid",
      "dacl",
      "kerberos",
      "principal"
    ]
  },
  {
    "id": "ntlm",
    "term": "NTLM 認証",
    "en": "NTLM Authentication",
    "aka": "challenge/response, NTLMSSP, relay, pass-the-hash",
    "cat": "auth",
    "body": "NTLM はチャレンジ/レスポンス方式の認証プロトコル（NTLMSSP セキュリティパッケージ）で、Kerberos が使えない場合（IP 直接接続、ワークグループ、ローカルアカウント、レガシーアプリ）にフォールバックとして使われます。サーバがチャレンジ（nonce）を送り、クライアントが NT ハッシュを鍵として応答（Net-NTLM レスポンス）を計算する仕組みで、パスワードそのものは送りませんが、NT ハッシュがあれば応答を生成できるため Pass-the-Hash が成立します。相互認証がなくメッセージ署名がオプションであることから NTLM リレー攻撃に脆弱で、Microsoft は Kerberos への移行と NTLM の段階的廃止を進めています。",
    "points": [
      "チャレンジ/レスポンス方式、SSPI パッケージ名は NTLMSSP",
      "Kerberos 不可時のフォールバック（IP 接続、ローカル/ワークグループ）",
      "NT ハッシュを鍵に応答を計算 → Pass-the-Hash が可能",
      "相互認証なし・署名がオプション → NTLM リレーに脆弱"
    ],
    "related": [
      "nthash",
      "netntlm",
      "kerberos",
      "sspi",
      "authnz",
      "ntlmmic"
    ]
  },
  {
    "id": "nthash",
    "term": "NT ハッシュ",
    "en": "NT Hash",
    "aka": "MD4(UTF-16 password), unsalted, pass-the-hash",
    "cat": "auth",
    "body": "NT ハッシュ（NTLM ハッシュ、NTOWF）は、ユーザーパスワードを UTF-16LE でエンコードし MD4 を一度適用したもので、ソルトなし・反復なしの 16 バイト値です。ローカルでは SAM、ドメインでは NTDS.dit に格納され、Kerberos の RC4-HMAC 事前認証鍵としても使われるため、AD 認証の中核をなす資格情報です。ソルトがないため同一パスワードは常に同一ハッシュとなり、レインボーテーブルや高速オフラインクラックの対象になるうえ、NTLM 認証では NT ハッシュ自体が実効的な秘密となるため、平文パスワードなしでも認証できる Pass-the-Hash が成立します。",
    "points": [
      "NT ハッシュ = MD4(UTF-16LE(パスワード))、16 バイト",
      "ソルトなし・反復なし → 同一パスワードは同一ハッシュ",
      "保存先: ローカル=SAM、ドメイン=NTDS.dit",
      "Kerberos の RC4-HMAC（etype 0x17）鍵としても機能",
      "ハッシュ自体で認証可能 → Pass-the-Hash"
    ],
    "related": [
      "ntlm",
      "sam",
      "ntds",
      "kerberos",
      "etype",
      "kerbsalt"
    ]
  },
  {
    "id": "netntlm",
    "term": "Net-NTLMv1 / v2",
    "en": "Net-NTLMv1 / v2",
    "aka": "network response, crackable, relay-able, not the NT hash",
    "cat": "auth",
    "body": "Net-NTLMv1/v2 は NTLM のチャレンジ/レスポンスで実際にネットワーク上を流れる応答値であり、NT ハッシュそのものではありません（Pass-the-Hash には使えない）。Net-NTLMv1 はサーバチャレンジに対し NT ハッシュを 3 分割した DES 鍵で計算するため弱く、サーバチャレンジを既知の固定値（例 1122334455667788、Responder の --disable-ess 等で NTLMv1 へダウングレード）にできれば、公開レインボーテーブルや crack.sh により NT ハッシュを実質即時に復元できます。Net-NTLMv2 は HMAC-MD5 とクライアント側チャレンジ/タイムスタンプ（blob）を含みリプレイ耐性がありますが、オフラインでのパスワード辞書クラックや、SMB/LDAP 署名がなければ NTLM リレーで別ホストへ中継される攻撃（Responder + ntlmrelayx）の対象になります。",
    "points": [
      "ネットワーク上の応答値。NT ハッシュそのものではない → PtH 不可",
      "v1: NT ハッシュを 3 分割した DES ベースで弱い",
      "サーバチャレンジ固定 → レインボーテーブル/crack.sh で NT ハッシュ復元",
      "v2: HMAC-MD5 + クライアントチャレンジ/タイムスタンプでリプレイ耐性",
      "署名なしなら NTLM リレー（Responder/ntlmrelayx）で悪用"
    ],
    "related": [
      "ntlm",
      "nthash",
      "smb",
      "ldap",
      "sspi",
      "ntlmmic"
    ]
  },
  {
    "id": "kerberos",
    "term": "Kerberos (概要)",
    "en": "Kerberos (Overview)",
    "aka": "ticket-based, mutual auth, KDC, 88/tcp-udp",
    "cat": "auth",
    "body": "Kerberos は AD の既定の認証プロトコル（RFC 4120、Windows は Microsoft 拡張と PAC を追加）で、チケットベースかつ相互認証をサポートし、パスワード/ハッシュをネットワーク上で繰り返し送らずに済みます。クライアントは KDC の AS からまず TGT を取得し、その TGT を提示して TGS からサービスチケット（ST）を得て対象サービスへアクセスするという 3 者間モデルで動作し、共有鍵暗号とタイムスタンプによりリプレイを防ぎます。通信ポートは 88/tcp・88/udp（パスワード変更は kpasswd 464）で、時刻同期（既定 5 分の許容差）に依存するため、Kerberoasting、AS-REP Roasting、Golden/Silver Ticket など多くの攻撃の起点にもなります。",
    "points": [
      "RFC 4120 ベース、チケット式・相互認証、Windows は PAC を追加",
      "3 者モデル: クライアント / KDC(AS+TGS) / サービス",
      "ポート 88/tcp・88/udp、kpasswd は 464",
      "時刻同期依存（既定の許容差 5 分）",
      "攻撃起点: Kerberoasting、AS-REP Roasting、Golden/Silver Ticket"
    ],
    "related": [
      "kdc",
      "tgt",
      "st",
      "krbtgt",
      "pac",
      "nopac",
      "u2u",
      "kdcerrcode"
    ]
  },
  {
    "id": "kdc",
    "term": "KDC",
    "en": "Key Distribution Center (KDC)",
    "aka": "AS + TGS, runs on DC, krbtgt key",
    "cat": "auth",
    "body": "KDC（鍵配布センター）は Kerberos の中核サービスで、各ドメインコントローラ上で LSASS 内の kdcsvc.dll として稼働し、認証サーバ（AS）とチケット許可サーバ（TGS）の 2 つの機能を提供します。AS はクライアントの事前認証を検証して TGT を発行し、TGS は有効な TGT を提示したクライアントに対象サービスのチケット（ST）を発行します。発行される TGT は krbtgt アカウントの鍵で暗号化・署名されるため、この krbtgt ハッシュを窃取すると任意の TGT を偽造できる Golden Ticket 攻撃が成立し、KDC はドメインの信頼の根幹をなします。",
    "points": [
      "KDC = AS（TGT 発行）+ TGS（ST 発行）",
      "各 DC 上で稼働（LSASS 内の kdcsvc.dll）",
      "TGT は krbtgt アカウントの鍵で暗号化・署名",
      "krbtgt ハッシュ窃取 → Golden Ticket で TGT 偽造",
      "ポート 88（Kerberos）でリッスン"
    ],
    "related": [
      "kerberos",
      "tgt",
      "st",
      "krbtgt",
      "dc"
    ]
  },
  {
    "id": "tgt",
    "term": "TGT",
    "en": "Ticket Granting Ticket (TGT)",
    "aka": "krbtgt-encrypted, PAC, 10h lifetime, Golden Ticket",
    "cat": "auth",
    "body": "TGT (Ticket Granting Ticket) は、AS 交換で KDC が発行するチケットで、以降 KDC の TGS へサービスチケットを要求する際の身分証明として使われる。KDC の内部アカウント krbtgt の長期鍵で暗号化されるため、クライアント自身は中身を復号できず、認可情報である PAC(ユーザー/グループ SID)を内包する。既定の有効期間は 10 時間、更新可能期間は 7 日。krbtgt ハッシュを窃取すると任意の PAC を持つ TGT を偽造でき、これが Golden Ticket 攻撃で、ドメイン(信頼構成次第でフォレスト)を実質的に掌握される。",
    "points": [
      "krbtgt の長期鍵で暗号化(クライアントは復号不可)",
      "PAC(SID/グループ)を内包し認可情報を運ぶ",
      "既定 10 時間、更新 7 日",
      "krbtgt ハッシュ窃取 → Golden Ticket 偽造",
      "KDC(ポート 88)の AS 交換で発行"
    ],
    "related": [
      "krbtgt",
      "pac",
      "kdc",
      "st",
      "krbmsgs"
    ]
  },
  {
    "id": "st",
    "term": "サービスチケット (ST)",
    "en": "Service Ticket (ST / TGS)",
    "aka": "service-key-encrypted, SPN, Silver Ticket, Kerberoast",
    "cat": "auth",
    "body": "サービスチケット (ST、Kerberos 用語では TGS チケット) は、TGS 交換で KDC が発行し、クライアントが特定のサービスへアクセスする際に AP-REQ で提示するチケット。宛先サービスの SPN に対応するアカウントの長期鍵(コンピューターアカウント鍵、またはサービス実行ユーザーのパスワード由来鍵)で暗号化され、サービスはその鍵で復号して PAC を得る。KDC はクライアントの TGT を検証するだけで、宛先サービスにパスワードは問い合わせないため、サービス鍵が弱いと Kerberoasting(RC4 暗号化 ST を要求し、パスワードをオフライン解読)が成立する。サービス鍵(NT ハッシュ)を握れば任意 PAC の ST を偽造でき、これが Silver Ticket。",
    "points": [
      "宛先 SPN のアカウント鍵で暗号化",
      "TGS 交換で発行、AP-REQ で提示",
      "RC4 の ST 要求 → Kerberoasting でオフライン解読",
      "サービス鍵入手 → Silver Ticket 偽造",
      "KDC はサービスへ問い合わせない(検証は TGT のみ)"
    ],
    "related": [
      "spn",
      "tgt",
      "krbmsgs",
      "kerberos",
      "pac"
    ]
  },
  {
    "id": "krbmsgs",
    "term": "AS/TGS/AP 交換",
    "en": "AS / TGS / AP Exchange",
    "aka": "AS-REQ/REP, TGS-REQ/REP, AP-REQ/REP",
    "cat": "auth",
    "body": "Kerberos は 3 つのサブプロトコル交換で成り立つ。AS 交換 (AS-REQ/AS-REP) では事前認証を経て KDC の認証サービスから TGT を得る。TGS 交換 (TGS-REQ/TGS-REP) では TGT を提示し、目的サービスの SPN に対するサービスチケットを得る。AP 交換 (AP-REQ/AP-REP) はクライアントとサービス間で行われ、ST を提示して認証を確立する(AP-REP は相互認証要求時のみ返る)。各交換のメッセージ種別やエラー(KRB_ERROR 内の KDC_ERR_PREAUTH_REQUIRED 等)は、攻撃検知やチケット解析の基本となる。",
    "points": [
      "AS 交換 → TGT 取得(事前認証を含む)",
      "TGS 交換 → SPN に対する ST 取得",
      "AP 交換 → クライアント↔サービスの認証(相互認証は任意)",
      "エラーは KRB_ERROR で返る(例: PREAUTH_REQUIRED)",
      "AS/TGS は KDC の UDP/TCP 88 宛、AP は対サービス"
    ],
    "related": [
      "tgt",
      "st",
      "preauth",
      "kdc",
      "kerberos"
    ]
  },
  {
    "id": "pac",
    "term": "PAC",
    "en": "Privilege Attribute Certificate (PAC)",
    "aka": "group SIDs in ticket, KDC signature, authorization data",
    "cat": "auth",
    "body": "PAC (Privilege Attribute Certificate) は、Microsoft が Kerberos チケットの認可データ領域に格納する構造体で、ユーザーの SID・所属グループ SID・特権・ログオン情報などを運ぶ。これにより各サービスは LDAP を引かずにトークンを構築できる。PAC は複数の署名で保護され、古典的にはサービス鍵による Server Signature と krbtgt 鍵による KDC Signature の 2 つ、加えて改ざん対策として Ticket Signature(CVE-2020-17049 対応)や Extended KDC Signature(CVE-2022-37967 対応)が追加された。Golden/Silver Ticket は偽の PAC を注入する攻撃であり、PAC 検証と署名強制がその防御の要となる。",
    "points": [
      "ユーザー SID・グループ SID・特権を運ぶ",
      "Server Signature(サービス鍵)+ KDC Signature(krbtgt 鍵)",
      "Ticket/Extended KDC 署名で偽造を強化(CVE-2020-17049 / 2022-37967)",
      "偽 PAC 注入 = Golden/Silver Ticket",
      "サービスがトークン構築に使用"
    ],
    "related": [
      "tgt",
      "st",
      "sid",
      "krbtgt",
      "token"
    ]
  },
  {
    "id": "preauth",
    "term": "事前認証",
    "en": "Kerberos Pre-authentication",
    "aka": "encrypted timestamp, AS-REP Roasting, DONT_REQ_PREAUTH",
    "cat": "auth",
    "body": "事前認証 (Kerberos Pre-authentication) は、AS-REQ に PA-ENC-TIMESTAMP(クライアントの長期鍵で暗号化した現在時刻)を含めることで、要求者が本当にパスワードを知っていることを KDC に証明させる仕組み。これによりオフライン辞書攻撃を抑止する。アカウントに DONT_REQ_PREAUTH フラグ(userAccountControl 0x400000)が立つと事前認証が不要となり、攻撃者はそのユーザーの AS-REP(クライアント鍵で暗号化された部分)を要求してオフライン解読できる。これが AS-REP Roasting。",
    "points": [
      "PA-ENC-TIMESTAMP をクライアント鍵で暗号化して提示",
      "オフライン辞書攻撃を防ぐ",
      "DONT_REQ_PREAUTH = userAccountControl 0x400000",
      "フラグ有効時 → AS-REP Roasting が可能",
      "監視は Event ID 4768(RC4/事前認証なし)/ 4771(失敗)"
    ],
    "related": [
      "krbmsgs",
      "tgt",
      "uacflags",
      "etype",
      "kerberos",
      "kdcerrcode"
    ]
  },
  {
    "id": "etype",
    "term": "暗号化種別 (etype)",
    "en": "Encryption Types (etype)",
    "aka": "RC4 0x17, AES128 0x11, AES256 0x12, downgrade",
    "cat": "auth",
    "body": "暗号化種別 (etype) は、Kerberos が鍵導出・チケット暗号化・チェックサムに用いる暗号アルゴリズムの識別番号。現行環境の主なものは RC4-HMAC = 23 (0x17)、AES128-CTS-HMAC-SHA1-96 = 17 (0x11)、AES256-CTS-HMAC-SHA1-96 = 18 (0x12) で、旧式の DES(1/3)は既定で無効。RC4 は NT ハッシュを鍵に直接使うため、Kerberoasting/オフライン解読で狙われやすく、攻撃者はしばしば RC4 への意図的なダウングレードを試みる。防御側は msDS-SupportedEncryptionTypes での AES 強制と、RC4 使用の監視(Event 4769 の Ticket Encryption Type 0x17)が重要。",
    "points": [
      "RC4-HMAC = 23 (0x17)",
      "AES128 = 17 (0x11)、AES256 = 18 (0x12)",
      "DES(1/3)は既定で無効",
      "RC4 は NT ハッシュを鍵に直結 → Kerberoast 標的",
      "AES 強制と RC4 ダウングレード監視(Event 4769)"
    ],
    "related": [
      "kerberos",
      "st",
      "nthash",
      "preauth",
      "kdc",
      "kerbsalt",
      "sessionkey"
    ]
  },
  {
    "id": "sspi",
    "term": "SSPI / SSP",
    "en": "SSPI / SSP",
    "aka": "Negotiate, Kerberos/NTLM/Digest, security package",
    "cat": "auth",
    "body": "SSPI (Security Support Provider Interface) は、Windows がアプリケーションに認証・完全性・機密性サービスを提供する統一 API で、その裏で実際の処理を担うプラグインを SSP (Security Support Provider) と呼ぶ。代表的 SSP には Kerberos、NTLM、Negotiate(SPNEGO)、Digest、Schannel(TLS)、CredSSP があり、Negotiate は Kerberos が使えれば Kerberos を、駄目なら NTLM を選択する。SSP は %windir%\\System32 の DLL として実装され、LSASS が読み込む対象は HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\Security Packages(REG_MULTI_SZ、および OSConfig\\Security Packages)に列挙される。攻撃者はこの仕組みを悪用し、独自の悪性 SSP を登録して平文資格情報を窃取・永続化できる。ディスク永続化では mimikatz の mimilib.dll をドロップして Security Packages に登録し、捕捉した平文資格情報を C:\\Windows\\System32\\kiwissp.log に記録する。misc::memssp は再起動で消えるインメモリ注入で、既定ログは mimilsa.log となる。上記レジストリ値の変更や当該ログ生成の監視が防御の要となる(MITRE ATT&CK T1547.005)。",
    "points": [
      "SSPI = API、SSP = 実装プラグイン(Kerberos/NTLM/Negotiate/Digest/Schannel/CredSSP)",
      "Negotiate(SPNEGO)が Kerberos↔NTLM を選択、NTLM フォールバックが弱点",
      "SSP DLL は %windir%\\System32、登録は HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\Security Packages(REG_MULTI_SZ)",
      "悪性 SSP 永続化: mimilib.dll ドロップ→Security Packages 登録(kiwissp.log)/ misc::memssp はインメモリ(mimilsa.log)、T1547.005",
      "検知: 当該レジストリ値の変更監視 + kiwissp.log / mimilsa.log の生成監視"
    ],
    "related": [
      "kerberos",
      "ntlm",
      "lsass",
      "authnz",
      "namedpipe"
    ]
  },
  {
    "id": "delegation",
    "term": "Kerberos 委任",
    "en": "Kerberos Delegation",
    "aka": "unconstrained/constrained/RBCD, TRUSTED_FOR_DELEGATION",
    "cat": "auth",
    "body": "Kerberos 委任は、サービスがクライアントの身分でバックエンドリソースへアクセスできる仕組みで、3 形態がある。非制約委任 (Unconstrained) は TRUSTED_FOR_DELEGATION フラグ(UAC 0x80000)を持つホストが接続元の TGT をメモリに保持でき、DC を誘導すると Domain Admin の TGT を捕捉され極めて危険。制約委任 (Constrained) は msDS-AllowedToDelegateTo で許可先 SPN を限定し、プロトコル遷移には TRUSTED_TO_AUTH_FOR_DELEGATION(0x1000000、S4U2Self)を用いる。リソースベース制約委任 (RBCD) は委任先リソース側の msDS-AllowedToActOnBehalfOfOtherIdentity で許可を管理し、対象オブジェクトへの書き込み権限があれば攻撃者が悪用しやすい。",
    "points": [
      "非制約: TRUSTED_FOR_DELEGATION(UAC 0x80000)、TGT をメモリ保持",
      "制約: msDS-AllowedToDelegateTo で許可先 SPN を限定",
      "プロトコル遷移: TRUSTED_TO_AUTH_FOR_DELEGATION(0x1000000)+ S4U2Self",
      "RBCD: msDS-AllowedToActOnBehalfOfOtherIdentity(リソース側)",
      "対象への書込権限があれば RBCD は悪用容易"
    ],
    "related": [
      "s4u",
      "spn",
      "tgt",
      "uacflags",
      "kerberos",
      "unconstrained"
    ]
  },
  {
    "id": "s4u",
    "term": "S4U (S4U2Self / S4U2Proxy)",
    "en": "S4U (S4U2Self / S4U2Proxy)",
    "aka": "protocol transition, constrained delegation, impersonation",
    "cat": "auth",
    "body": "S4U (Service for User) は Kerberos の拡張で、サービスがユーザーに代わってチケットを取得できるようにする延長機能です。S4U2Self はユーザーが Kerberos で認証していなくても(例: フォーム認証や NTLM)、サービスが自分自身宛ての転送可能な(forwardable)サービスチケットを取得できる「プロトコル遷移」を提供します。S4U2Proxy は取得したユーザーのチケットを使い、msDS-AllowedToDelegateTo に列挙された別サービス宛てのチケットを要求する「制約付き委任」の中核です。攻撃面としては、SPN 書き込み権限や RBCD(msDS-AllowedToActOnBehalfOfOtherIdentity)の悪用により任意ユーザー(管理者含む)への成りすましが可能になるため、委任設定の監査が重要です。",
    "points": [
      "S4U2Self = プロトコル遷移(非Kerberos認証ユーザーへの成りすまし)",
      "S4U2Proxy = 制約付き委任、msDS-AllowedToDelegateTo を参照",
      "RBCD は msDS-AllowedToActOnBehalfOfOtherIdentity 属性で構成",
      "S4U2Self の転送可能チケットが従来型委任(KCD)悪用の鍵",
      "PA-FOR-USER 構造でターゲットユーザーを指定"
    ],
    "related": [
      "delegation",
      "kerberos",
      "st",
      "spn",
      "pac",
      "nopac",
      "u2u"
    ]
  },
  {
    "id": "realm",
    "term": "レルム (Realm)",
    "en": "Realm",
    "aka": "Kerberos realm = domain (uppercase), cross-realm",
    "cat": "auth",
    "body": "レルム(Realm)は Kerberos における認証境界であり、単一の KDC 権限が管理する principal の集合を指します。Active Directory では通常、DNS ドメイン名を大文字にしたものがレルム名になります(例: DNS が corp.example.com ならレルムは CORP.EXAMPLE.COM)。principal 名は user@REALM や service/host@REALM の形式で表現されます。異なるレルム間の認証(クロスレルム)では、共有された信頼鍵に基づく紹介チケット(referral TGT, krbtgt/TARGETREALM)を用いて認証がチェーンされ、AD の信頼(trust)がこの仕組みを利用します。",
    "points": [
      "レルム名は慣例上 DNS ドメイン名を大文字化したもの",
      "principal 表記: user@REALM, service/host@REALM",
      "クロスレルムは krbtgt/TARGETREALM の紹介チケットを使用",
      "AD の信頼(trust)= Kerberos クロスレルム認証の実装"
    ],
    "related": [
      "kerberos",
      "kdc",
      "trust",
      "domain",
      "krbtgt"
    ]
  },
  {
    "id": "pki",
    "term": "PKI",
    "en": "Public Key Infrastructure (PKI)",
    "aka": "public/private key, CA, trust chain, X.509",
    "cat": "pki",
    "body": "PKI(公開鍵基盤)は、公開鍵暗号を用いて公開鍵と実体(ユーザー・デバイス・サービス)の結び付きを、認証局(CA)の署名によって保証する仕組みです。X.509 証明書、CA 階層(ルート CA と下位 CA が形成する信頼チェーン)、失効機構(CRL/OCSP)を主要構成要素とします。検証者は証明書チェーンをルートまで辿り、各署名・有効期限・失効状態・用途(EKU)を確認して信頼を判断します。Windows/AD では認証、コード署名、暗号化(EFS)、そして Kerberos の証明書ログオン(PKINIT)の基盤となり、AD CS がこれをドメインに提供します。",
    "points": [
      "X.509 証明書 = 公開鍵と実体の署名付きバインディング",
      "信頼チェーン: リーフ → 下位 CA → ルート CA",
      "失効確認は CRL または OCSP",
      "AD では PKINIT による証明書ログオンの基盤"
    ],
    "related": [
      "adcs",
      "ca",
      "kerberos",
      "pkinit",
      "eku"
    ]
  },
  {
    "id": "adcs",
    "term": "AD CS",
    "en": "Active Directory Certificate Services (AD CS)",
    "aka": "CA, enrollment, templates, ESCx",
    "cat": "pki",
    "body": "AD CS(Active Directory 証明書サービス)は、Windows Server の役割で、ドメイン内に PKI を構築するためのコンポーネント群です。エンタープライズ CA は AD 統合され、証明書テンプレートに基づいて自動登録(auto-enrollment)や DCOM(MS-WCCE)/RPC(MS-ICPR)経由の登録を提供します。エンタープライズ CA の証明書は AD の NTAuth ストア(NTAuthCertificates)に登録され、これにより発行証明書での Kerberos 認証(PKINIT)が可能になります。テンプレートやアクセス権の設定ミスは ESC1〜ESC16 といったドメイン権限昇格経路を生むため、SOC/レッドチームの重点監査対象です。",
    "points": [
      "エンタープライズ CA は AD 統合、テンプレートで発行制御",
      "CA 証明書は NTAuthCertificates に登録され PKINIT を有効化",
      "登録は auto-enrollment / DCOM(MS-WCCE)/ RPC(MS-ICPR)経由",
      "ESC1〜ESC16: テンプレート・権限誤設定による昇格経路"
    ],
    "related": [
      "ca",
      "template",
      "pki",
      "pkinit",
      "eku",
      "adcsesc",
      "enrollagent",
      "caperm",
      "issuancepolicy"
    ]
  },
  {
    "id": "ca",
    "term": "認証局 (CA)",
    "en": "Certificate Authority (CA)",
    "aka": "issuing/root CA, CA key, signing, revocation",
    "cat": "pki",
    "body": "CA(認証局)は、証明書要求を検証し秘密鍵で署名して X.509 証明書を発行する、PKI の信頼の起点となる実体です。階層は自己署名のルート CA と、それに署名された下位(発行/中間)CA から成り、実際のエンドエンティティ証明書は通常オフラインのルートを保護するため発行 CA が発行します。CA は署名鍵の機密性が全体の信頼を左右し、失効(CRL/OCSP)によって危殆化・無効化された証明書を通知します。CA 秘密鍵の窃取(いわゆる Golden Certificate)や AD CS の ESC7/ESC8 などの悪用はフォレスト全体の成りすましを許すため、CA サーバーは最重要保護資産です。",
    "points": [
      "ルート CA(自己署名)→ 下位/発行 CA の階層",
      "エンドエンティティ証明書は通常オフライン root を守り発行 CA が発行",
      "失効は CRL / OCSP で公開",
      "CA 秘密鍵の窃取 = Golden Certificate によるフォレスト成りすまし"
    ],
    "related": [
      "adcs",
      "pki",
      "template",
      "eku",
      "kerberos"
    ]
  },
  {
    "id": "template",
    "term": "証明書テンプレート",
    "en": "Certificate Template",
    "aka": "enrollment rights, ENROLLEE_SUPPLIES_SUBJECT, EKU, ESC1",
    "cat": "pki",
    "body": "証明書テンプレート(Certificate Template)は、エンタープライズ CA が発行する証明書の設定を定義する AD オブジェクト(CN=...,CN=Certificate Templates,CN=Public Key Services,CN=Services,CN=Configuration,...)です。EKU(用途)、サブジェクト名の供給方法、鍵仕様、そして誰が登録できるか(登録権限 ACL)や発行に管理者承認が必要かなどを規定します。重要な危険設定が CT_FLAG_ENROLLEE_SUPPLIES_SUBJECT(要求者がサブジェクト/SAN を自由指定できる)で、これが認証系 EKU・低権限ユーザーの登録許可・承認不要・署名要求なしと組み合わさると ESC1 となり、任意ユーザーへの成りすましが可能になります。",
    "points": [
      "AD オブジェクトとして Configuration パーティションに格納",
      "EKU・サブジェクト供給方法・登録 ACL・承認要否を定義",
      "CT_FLAG_ENROLLEE_SUPPLIES_SUBJECT = 要求者が SAN を指定可",
      "ESC1 条件: 上記フラグ + 認証 EKU + 低権限登録可 + 承認/署名不要"
    ],
    "related": [
      "adcs",
      "ca",
      "eku",
      "san",
      "authnz",
      "adcsesc",
      "enrollagent",
      "apppolicy"
    ]
  },
  {
    "id": "eku",
    "term": "EKU",
    "en": "Extended Key Usage (EKU)",
    "aka": "Client Auth 1.3.6.1.5.5.7.3.2, Any Purpose, purpose OID",
    "cat": "pki",
    "body": "EKU(拡張キー使用法 / Enhanced Key Usage)は X.509 証明書の拡張で、その証明書の秘密鍵が使用を許される具体的な用途を OID の列挙で示します。代表例は クライアント認証(1.3.6.1.5.5.7.3.2)、サーバー認証(1.3.6.1.5.5.7.3.1)、スマートカードログオン(1.3.6.1.4.1.311.20.2.2)、PKINIT クライアント認証(1.3.6.1.5.2.3.4)、コード署名(1.3.6.1.5.5.7.3.3)です。AD へのログオン(PKINIT)にはクライアント認証系の EKU が必要で、Any Purpose(2.5.29.37.0)や EKU 無しの証明書は用途無制限として振る舞います。攻撃者はこの認証系 EKU を含むテンプレートを標的にして証明書ベースの成りすましを狙います。",
    "points": [
      "Client Authentication = 1.3.6.1.5.5.7.3.2",
      "Smart Card Logon = 1.3.6.1.4.1.311.20.2.2",
      "PKINIT Client Authentication = 1.3.6.1.5.2.3.4",
      "Any Purpose = 2.5.29.37.0(用途無制限として振る舞う)",
      "PKINIT ログオンには認証系 EKU が必須"
    ],
    "related": [
      "template",
      "pkinit",
      "adcs",
      "san",
      "kerberos",
      "apppolicy",
      "issuancepolicy"
    ]
  },
  {
    "id": "san",
    "term": "SAN",
    "en": "Subject Alternative Name (SAN)",
    "aka": "UPN/DNS in cert, identity claim, impersonation",
    "cat": "pki",
    "body": "SAN(サブジェクト代替名 / Subject Alternative Name)は X.509 証明書の拡張で、Subject フィールドとは別に、証明書が表す実体の識別子(DNS 名、UPN、メール、IP など)を複数記述できます。AD の証明書認証(PKINIT)では、KDC/DC は多くの場合 SAN 内の otherName=UPN を用いてユーザーを AD アカウントにマッピングします。したがって攻撃者が任意の SAN(例: 管理者の UPN)を要求に含められる場合、その証明書で管理者として認証でき、これが ESC1 の本質です。Microsoft は 2022 年の強力な証明書マッピング(KB5014754)でこの緩い UPN マッピングを、SID を証明書拡張(OID 1.3.6.1.4.1.311.25.2)に埋め込む SID ベースの厳格マッピングへ移行しました。",
    "points": [
      "SAN は複数の実体識別子(UPN/DNS/メール/IP)を保持",
      "PKINIT では KDC/DC が otherName=UPN でユーザーを AD にマッピング",
      "任意 SAN 指定可 = 任意ユーザー成りすまし(ESC1)",
      "KB5014754: SID ベースの強力な証明書マッピング(拡張 1.3.6.1.4.1.311.25.2)へ移行"
    ],
    "related": [
      "template",
      "eku",
      "pkinit",
      "upn",
      "certmapping"
    ]
  },
  {
    "id": "pkinit",
    "term": "PKINIT",
    "en": "PKINIT (Certificate-based Kerberos)",
    "aka": "cert -> TGT, NTLM via UnPAC-the-hash, smart card",
    "cat": "pki",
    "body": "PKINIT（Public Key Cryptography for Initial Authentication）は、パスワード/NTハッシュの代わりにX.509証明書の秘密鍵でKerberosのAS-REQを署名し、TGTを取得するKerberos事前認証拡張であり、スマートカードログオンやWindows Hello for Businessの基盤である。KDCは証明書を検証し、その主体（プリンシパル）にTGTを発行する。取得したTGTのPACには当該アカウントのNTLM_SUPPLEMENTAL_CREDENTIAL（NTハッシュ）が含まれ得るが、これはkrbtgt鍵で暗号化されているため、攻撃者は証明書からTGTを得た後にS4U2Self＋U2U（ユーザー対ユーザー）のTGS-REQでセッション鍵により再暗号化させて自分のNTハッシュを回収できる（UnPAC-the-hash）。証明書の窃取・偽造（ADCSの各種攻撃）はパスワードを知らずに認証を成立させる強力な手段となる。",
    "points": [
      "AS-REQを証明書の秘密鍵で署名しTGTを取得（パスワード不要）",
      "スマートカード / Windows Hello for Business の基盤",
      "TGTのPACにNTハッシュ（NTLM_SUPPLEMENTAL_CREDENTIAL）が含まれ得るがkrbtgt鍵で暗号化",
      "S4U2Self＋U2U のTGS-REQでセッション鍵により復号し自身のNTハッシュを回収（UnPAC-the-hash）",
      "ADCS攻撃（ESC1等）や偽造証明書と組み合わせて悪用される"
    ],
    "related": [
      "kerberos",
      "tgt",
      "pac",
      "adcs",
      "certmapping",
      "adcsesc",
      "u2u",
      "sessionkey"
    ]
  },
  {
    "id": "certmapping",
    "term": "証明書マッピング",
    "en": "Certificate Mapping",
    "aka": "implicit/explicit, SID extension, KB5014754, strong binding",
    "cat": "pki",
    "body": "証明書マッピングは、認証に提示されたX.509証明書をAD/Entraのアカウントに結び付ける仕組みで、暗黙的（UPNやDNSからのSAN照合）と明示的（altSecurityIdentities属性に手動登録）に大別される。CVE-2022-26923等を受けKB5014754が導入され、CA発行証明書に発行対象（要求者）のSIDを埋め込む非クリティカル拡張（OID 1.3.6.1.4.1.311.25.2 = szOID_NTDS_CA_SECURITY_EXT）が追加された。DC側はStrongCertificateBindingEnforcementレジストリ値（0=無効,1=互換,2=完全強制）でマッピングの強度を制御し、2025年2月11日の更新以降、明示設定のないDCは既定で完全強制（弱いマッピングは失敗）となった（互換モードへの後退はKB5014754に基づき2025年9月まで可能）。弱いマッピング（UPN/emailベース等）はなりすましに悪用されるため、SIDベースの強いマッピングが必須である。",
    "points": [
      "暗黙マッピング（SANのUPN/DNS照合）と明示マッピング（altSecurityIdentities）",
      "SID埋め込み拡張 OID 1.3.6.1.4.1.311.25.2（szOID_NTDS_CA_SECURITY_EXT）",
      "StrongCertificateBindingEnforcement: 0=無効 / 1=互換 / 2=完全強制",
      "2025年2月11日の更新から既定で完全強制、弱いマッピングは失敗",
      "CVE-2022-26923 / CVE-2022-26931 / CVE-2022-34691 が契機"
    ],
    "related": [
      "pkinit",
      "adcs",
      "san",
      "sid",
      "kerberos"
    ]
  },
  {
    "id": "entra",
    "term": "Entra ID (Azure AD)",
    "en": "Microsoft Entra ID (Azure AD)",
    "aka": "cloud IdP, tenant, OAuth/OIDC/SAML, service principal",
    "cat": "cloud",
    "body": "Microsoft Entra ID（旧Azure AD）は、Microsoftのクラウド型IDプロバイダ（IdP）であり、オンプレADのようなKerberos/LDAPドメインコントローラではなく、OAuth 2.0 / OpenID Connect / SAML / WS-Fed といったWebベースのプロトコルでSaaSやAzureへの認証・認可を提供する。テナント単位で管理され、ユーザー・グループ・アプリ登録・サービスプリンシパル・条件付きアクセス等を保持する。オンプレADとはEntra Connect（同期）やフェデレーションで連携する。クラウドとオンプレをまたぐ横展開（PRT窃取、同意フィッシング、サービスプリンシパル悪用等）の主戦場となるため、ハイブリッド環境の防御では中核をなす。",
    "points": [
      "クラウドIdP：OAuth2.0/OIDC/SAML/WS-Fedで認証（KerberosやLDAP DCではない）",
      "テナント単位で管理し、アプリ登録・サービスプリンシパルを保持",
      "オンプレADとはEntra Connectやフェデレーションで連携",
      "条件付きアクセスがセッション認可の要",
      "ハイブリッド横展開の主要ターゲット"
    ],
    "related": [
      "tenant",
      "oauth",
      "saml",
      "prt",
      "entraconnect"
    ]
  },
  {
    "id": "tenant",
    "term": "テナント",
    "en": "Tenant",
    "aka": "directory instance, tenant ID, cross-tenant",
    "cat": "cloud",
    "body": "テナントは、Entra ID（およびMicrosoft 365/Azure）における組織専用のディレクトリインスタンスであり、独立した境界としてユーザー・グループ・アプリ・ポリシーを保持する。各テナントは一意のテナントID（GUID）と1つ以上の検証済みドメイン（例：contoso.onmicrosoft.com）で識別される。トークン内のtidクレームやissuer(iss)のURLにこのテナントIDが現れ、マルチテナントアプリやゲスト(B2B)アクセス、クロステナント設定の分析に重要である。テナントは信頼と権限の境界であるため、どのテナントが発行/受領したトークンかを見極めることがクラウド侵害調査の基本となる。",
    "points": [
      "組織専用のディレクトリインスタンス＝信頼と権限の境界",
      "一意のテナントID（GUID）で識別",
      "初期ドメインは <name>.onmicrosoft.com",
      "トークンのtidクレーム / issuer URL にテナントIDが出現",
      "B2Bゲストやマルチテナントアプリでクロステナント参照が発生"
    ],
    "related": [
      "entra",
      "oauth",
      "tokens",
      "guid",
      "saml"
    ]
  },
  {
    "id": "oauth",
    "term": "OAuth 2.0 / OIDC",
    "en": "OAuth 2.0 / OpenID Connect",
    "aka": "authorization, scopes, consent, id_token",
    "cat": "cloud",
    "body": "OAuth 2.0は「認可（authorization）」のフレームワークで、リソースへのアクセスをアクセストークンとして委任し、OpenID Connect（OIDC）はその上に「認証（authentication）」層を追加してID情報をid_token（JWT）で返す。Entraでは認可コードフロー等でスコープ（scope/scp）や委任アクセス許可・アプリ許可（roles）を要求し、ユーザーまたは管理者の同意（consent）を得てトークンが発行される。攻撃者は正規のOAuthアプリを装った同意フィッシング（illicit consent grant）で、パスワードを奪わずにメール読取等の永続的アクセスを得る。したがってアプリの同意・権限付与の監査はクラウド防御の要点である。",
    "points": [
      "OAuth2.0=認可、OIDC=認証層（id_tokenを追加）",
      "スコープ(scp)＝委任許可、roles＝アプリ許可",
      "トークン発行にユーザー/管理者の同意(consent)が必要",
      "同意フィッシング（illicit consent grant）でパスワード不要の永続化",
      "id_tokenはJWT、認証結果を表す"
    ],
    "related": [
      "entra",
      "tokens",
      "tenant",
      "saml",
      "sp",
      "foci",
      "workloadidfed"
    ]
  },
  {
    "id": "tokens",
    "term": "アクセス/リフレッシュ/IDトークン",
    "en": "Access / Refresh / ID Token",
    "aka": "JWT, bearer, lifetime, replay",
    "cat": "cloud",
    "body": "OAuth/OIDCでは3種のトークンが使われる。アクセストークン(access_token)はリソースAPIへの認可を表すベアラートークンで、Entraでは通常JWT・寿命は既定で60-90分（平均約75分のランダム値）。IDトークン(id_token)はユーザーの認証事実を表すJWTでクライアントが検証する。リフレッシュトークン(refresh_token)は不透明な長寿命トークンで、再認証なしに新しいアクセストークンを取得する（既定で最大非アクティブ90日等）。ベアラートークンは所持=利用可能のため、盗難トークンの再生（token replay / Pass-the-Token・Pass-the-PRT）はMFAを回避し得る。トークンの寿命・スコープ・aud/iss検証が重要。",
    "points": [
      "access_token＝APIへの認可（JWT、既定60-90分・平均約75分）",
      "id_token＝認証事実を表すJWT（クライアントが検証）",
      "refresh_token＝不透明・長寿命（既定で最大非アクティブ90日等）で更新に使用",
      "ベアラー方式：所持だけで利用可能 → トークン再生でMFA回避",
      "aud（対象）/ iss（発行者）/ exp（失効）の検証が要"
    ],
    "related": [
      "oauth",
      "prt",
      "entra",
      "condaccess",
      "saml",
      "actortoken"
    ]
  },
  {
    "id": "saml",
    "term": "SAML",
    "en": "SAML",
    "aka": "assertion, token-signing cert, Golden/Silver SAML, federation",
    "cat": "cloud",
    "body": "SAML（Security Assertion Markup Language）はXMLベースのフェデレーション認証標準で、IdPが署名済みのアサーション（SAMLトークン）を発行し、SP（サービスプロバイダ）がそれを検証してSSOを実現する。信頼の要はIdPのトークン署名証明書（token-signing certificate）であり、ADFSやEntraがこの秘密鍵でアサーションに署名する。攻撃者がこの署名鍵（ADFSではDKMで保護）を窃取すると、任意ユーザー・任意クレームの有効なアサーションを自作でき（Golden SAML）、MFAや認証ログを回避して長期的になりすませる。一方Silver SAMLは、アプリ（SP）単位でEntra ID等に登録された外部生成のトークン署名証明書の秘密鍵を悪用し、そのアプリ向けに偽SAMLレスポンスを作る手口で、IdP自体を侵害せず個々のアプリになりすます。",
    "points": [
      "XMLベースのフェデレーション：IdPが署名アサーションを発行、SPが検証",
      "信頼の要はトークン署名証明書（token-signing certificate）の秘密鍵",
      "IdPの署名鍵窃取で任意アサーションを偽造＝Golden SAML（IdP認証ログを回避）",
      "ADFSの署名鍵はDKM（分散鍵管理）で保護",
      "Silver SAML＝アプリ単位の外部生成署名証明書を悪用し個々のアプリになりすます（IdPは侵害せず）"
    ],
    "related": [
      "entra",
      "oauth",
      "tokens",
      "sp",
      "pki"
    ]
  },
  {
    "id": "prt",
    "term": "PRT",
    "en": "Primary Refresh Token (PRT)",
    "aka": "device-bound, SSO, CloudAP, session key",
    "cat": "cloud",
    "body": "PRT（Primary Refresh Token）は、Entra参加/登録デバイス上でMicrosoft純正のトークンブローカーに発行される、デバイスに紐付いたJWTで、OS全体のアプリSSOを実現する主要な資格情報である。PRTと共にセッションキー（対称鍵）が発行され、これはデバイスのトランスポートキー(tkpub)で暗号化され、TPM搭載時はTPMで秘密鍵が保護される。アプリはPRTクッキー（PRT本体＋nonce＋派生鍵で署名したコンテキスト）を使ってトークンを取得する。攻撃者がPRTとセッションキー（またはTPMのproof-of-possession）を奪うとSSOを乗っ取り、Pass-the-PRTでMFA済みセッションを再現できるため、条件付きアクセスやデバイス信頼の防御が重要。",
    "points": [
      "デバイス紐付けのJWT、OS全体のアプリSSOを実現",
      "セッションキーはトランスポートキー(tkpub)で暗号化、TPMで保護",
      "PRTクッキー＝PRT＋nonce＋派生鍵署名のコンテキスト",
      "Pass-the-PRTでMFA済みセッションを再現可能",
      "CloudAP(Cloud Authentication Provider)が処理を担う"
    ],
    "related": [
      "entra",
      "tokens",
      "oauth",
      "condaccess",
      "devicejoin",
      "actortoken",
      "foci"
    ]
  },
  {
    "id": "condaccess",
    "term": "条件付きアクセス",
    "en": "Conditional Access",
    "aka": "policy, MFA, device compliance, sign-in risk",
    "cat": "cloud",
    "body": "条件付きアクセス(Conditional Access)は、Microsoft Entra ID の認可エンジンで、サインインの「シグナル」を評価し「制御」を適用する if-then ポリシーの集合である。シグナルにはユーザー/グループ、場所/IP、デバイスの状態(準拠/ハイブリッド参加)、クライアントアプリ、Identity Protection によるサインイン/ユーザーリスクが含まれ、付与制御として MFA の要求、準拠デバイスの要求、アクセスのブロック等を行える。認証成功後・リソースアクセス前に評価されるゲートであり、盗まれた資格情報だけでは突破できないようにする防御の要である。CA 自体の利用には Entra ID P1、リスクベースの条件(Identity Protection)には P2 が必要で、レガシー認証や設定ミス(除外・レポート専用モード)が回避経路となりやすい。",
    "points": [
      "シグナル(条件)→ 付与/セッション制御 の if-then 評価エンジン",
      "付与制御例: MFA 要求 / 準拠デバイス要求 / ハイブリッド参加要求 / ブロック",
      "CA 自体は Entra ID P1、リスクベース(サインイン/ユーザーリスク)は P2 が必要",
      "レガシー認証・除外グループ・レポート専用モードが典型的な回避経路",
      "認証(AuthN)後、リソースアクセス前に評価される認可レイヤー"
    ],
    "related": [
      "entra",
      "tokens",
      "devicejoin",
      "oauth",
      "prt"
    ]
  },
  {
    "id": "entraconnect",
    "term": "Entra Connect (同期)",
    "en": "Entra Connect (Sync)",
    "aka": "PHS/PTA/federation, MSOL account, source anchor",
    "cat": "cloud",
    "body": "Entra Connect(旧 Azure AD Connect)は、オンプレミス AD DS のオブジェクトとパスワードを Microsoft Entra ID へ同期するハイブリッド ID の同期エンジンである。認証方式にはパスワードハッシュ同期(PHS、NT ハッシュを再ハッシュして同期)、パススルー認証(PTA、エージェント経由でオンプレ検証)、フェデレーション(AD FS)がある。既定では約30分ごとに差分同期し、AD 側の AD DS コネクタアカウント(MSOL_ で始まる)は PHS 有効時にディレクトリレプリケーション(パスワードハッシュ読み取り=DCSync 相当)の高権限を持ち、ソースアンカーには ms-DS-ConsistencyGuid が推奨される。同期サーバーは AD と Entra 双方への足がかりとなる Tier0 級の高価値標的で、侵害されるとコネクタアカウント資格情報の復号や DCSync が起こりうる。",
    "points": [
      "認証方式: PHS(NT ハッシュを再ハッシュ) / PTA(エージェント検証) / フェデレーション(AD FS)",
      "既定の同期間隔は約30分の差分同期",
      "MSOL_ コネクタアカウントは PHS 時に DCSync 相当の高権限",
      "ソースアンカー(immutableId)は ms-DS-ConsistencyGuid を推奨",
      "同期サーバーは Tier0 相当の高価値標的"
    ],
    "related": [
      "entra",
      "dpapi",
      "adds",
      "nthash",
      "tenant",
      "hybridauth",
      "ssprwriteback"
    ]
  },
  {
    "id": "sp",
    "term": "サービスプリンシパル / アプリ登録",
    "en": "Service Principal / App Registration",
    "aka": "app identity, client secret/cert, app roles, Graph",
    "cat": "cloud",
    "body": "アプリ登録(Application)とサービスプリンシパル(Service Principal)は Entra ID における「アプリの ID」を表す。アプリ登録はホームテナントに1つ存在するグローバル定義(AppId/クライアント ID、リダイレクト URI、公開する権限などのブループリント)で、サービスプリンシパルは各テナント内でそのアプリを実体化したローカル ID(サインインやロール割り当ての対象)である。アプリはクライアントシークレットまたは証明書で認証し、Microsoft Graph 等に対して委任されたアクセス許可(ユーザーとして)またはアプリケーションのアクセス許可(アプリ自身として)を持つ。攻撃者は既存 SP に新たな資格情報を追加したり、高権限アプリ権限(例: RoleManagement.ReadWrite.Directory, Application.ReadWrite.All)を悪用して永続化・権限昇格を行うため、資格情報の追加は重要な監視点である。",
    "points": [
      "Application = ホームテナントのグローバル定義 / SP = テナント内のローカル ID",
      "認証はクライアントシークレット または 証明書",
      "権限モデル: 委任(ユーザーとして) vs アプリケーション(アプリ自身として)",
      "AppId=クライアント ID。SP への資格情報追加は永続化の兆候",
      "高権限 Graph 権限の悪用で管理者相当に昇格しうる"
    ],
    "related": [
      "entra",
      "tenant",
      "oauth",
      "tokens",
      "principal",
      "workloadidfed"
    ]
  },
  {
    "id": "devicejoin",
    "term": "デバイス参加",
    "en": "Device Join",
    "aka": "Entra joined / hybrid joined / registered, device object",
    "cat": "cloud",
    "body": "デバイス参加は、Windows デバイスを Entra ID に登録して「デバイスオブジェクト」を作成する仕組みで、3つの状態がある。Entra 登録済み(Registered、個人所有 BYOD の Workplace Join)、Entra 参加済み(Joined、組織所有のクラウドのみ参加)、ハイブリッド Entra 参加済み(Hybrid Joined、オンプレ AD と Entra の両方に参加)。参加/登録したデバイスにはプライマリ更新トークン(PRT)が発行され、SSO と条件付きアクセスのデバイス条件に利用される。デバイスの状態(準拠・参加)は CA の重要なシグナルであり、PRT の窃取やデバイスオブジェクトの悪用は SSO のなりすましにつながるため防御上重要である。",
    "points": [
      "3状態: Entra 登録済み / Entra 参加済み / ハイブリッド Entra 参加済み",
      "参加/登録デバイスに PRT(プライマリ更新トークン)が発行される",
      "デバイスオブジェクトが Entra ID に作成される",
      "デバイスの準拠/参加状態は条件付きアクセスの主要シグナル",
      "PRT 窃取は SSO なりすましの温床"
    ],
    "related": [
      "entra",
      "condaccess",
      "prt",
      "tokens",
      "entraconnect"
    ]
  },
  {
    "id": "eventlog",
    "term": "Windows イベントログ",
    "en": "Windows Event Log",
    "aka": "Security/System/Application, EVTX, channels",
    "cat": "logging",
    "body": "Windows イベントログは、OS・サービス・アプリケーションが記録する構造化ログの基盤で、Windows Event Log サービス(EventLog)が管理する。従来の主要チャネルは Security・System・Application で、これに加え「アプリケーションとサービス ログ」以下に多数の運用チャネル(例: Microsoft-Windows-.../Operational)が存在する。実体は %SystemRoot%\\System32\\winevt\\Logs 配下の EVTX 形式ファイルで、Security ログは LSASS が書き込み、認証・特権・オブジェクトアクセス等の監査証跡を提供する。SOC の一次情報源であり、Security ログのクリア(EID 1102)や無効化は攻撃者の証跡隠滅として重要な検知対象である。",
    "points": [
      "主要チャネル: Security / System / Application + 運用チャネル多数",
      "保存形式は EVTX、格納先は %SystemRoot%\\System32\\winevt\\Logs",
      "Security ログは LSASS が書き込む(監査証跡)",
      "EID 1102 = Security 監査ログのクリア(証跡隠滅の兆候)",
      "Windows Event Log サービス(EventLog)が管理"
    ],
    "related": [
      "auditpolicy",
      "lsass",
      "sysmon",
      "wef",
      "etw",
      "eventlogclear",
      "dschanges"
    ]
  },
  {
    "id": "auditpolicy",
    "term": "監査ポリシー",
    "en": "Audit Policy",
    "aka": "advanced audit, subcategories, 4662 DS Access",
    "cat": "logging",
    "body": "監査ポリシーは、どのセキュリティイベントを Security ログに記録するかを決める設定で、9カテゴリの基本監査と、約60のサブカテゴリを持つ高度な監査ポリシー構成(Advanced Audit Policy Configuration)がある。GPO(コンピューターの構成 → セキュリティ設定)で成功/失敗ごとに構成でき、Account Logon・Logon/Logoff・Object Access・DS Access・Privilege Use 等のカテゴリを制御する。AD の DS Access 監査を有効化すると EID 4662(オブジェクトに対する操作)などが記録されるが、多くのオブジェクトアクセス監査は対象オブジェクトの SACL 設定も併せて必要である。適切な監査設定なしでは 4624/4688/4662 等の重要イベントが欠落するため、検知の前提となる基盤設定である。",
    "points": [
      "基本監査9カテゴリ vs 高度な監査(約60サブカテゴリ)",
      "GPO で成功/失敗を個別に構成",
      "DS Access 監査で EID 4662(オブジェクト操作)を記録",
      "オブジェクトアクセス監査は対象の SACL 設定も必要",
      "監査未設定だと 4624/4688 等の重要イベントが欠落"
    ],
    "related": [
      "eventlog",
      "sacl",
      "sysmon",
      "ntds",
      "wef",
      "dschanges",
      "wfpaudit",
      "dhcpdnsauditlog"
    ]
  },
  {
    "id": "sysmon",
    "term": "Sysmon",
    "en": "Sysmon",
    "aka": "process/network/pipe events, EID 1/3/17, config",
    "cat": "logging",
    "body": "Sysmon(System Monitor)は Sysinternals のドライバ+サービスで、標準の監査より詳細なテレメトリを Microsoft-Windows-Sysmon/Operational チャネルに記録する。代表的なイベント ID は 1(プロセス作成、コマンドラインとハッシュ)、3(ネットワーク接続)、7(イメージロード)、8(CreateRemoteThread)、10(プロセスアクセス、LSASS 読み取り検知)、11(ファイル作成)、13(レジストリ値の設定)、17/18(名前付きパイプの作成/接続)、22(DNS クエリ)である。XML 構成ファイルで対象を絞り込み、SwiftOnSecurity や Olaf Hartong の設定が広く使われる。EDR がない環境でも高精度な検知・脅威ハンティングの基盤を提供する。",
    "points": [
      "EID 1=プロセス作成 / 3=ネットワーク / 13=レジストリ値 / 17=パイプ作成",
      "EID 10=プロセスアクセス(LSASS メモリ読み取り検知に有用)",
      "EID 22=DNS クエリ、8=CreateRemoteThread(インジェクション)",
      "出力先は Microsoft-Windows-Sysmon/Operational チャネル",
      "XML 構成でフィルタ(SwiftOnSecurity / Olaf Hartong が定番)"
    ],
    "related": [
      "eventlog",
      "auditpolicy",
      "process",
      "namedpipe",
      "lsass",
      "dnslogging",
      "logonevents"
    ]
  },
  {
    "id": "wef",
    "term": "WEF",
    "en": "Windows Event Forwarding (WEF)",
    "aka": "collector, subscription, WEC, AMA",
    "cat": "logging",
    "body": "Windows イベント転送(WEF)は、多数のソースコンピューターのイベントを中央のコレクター(WEC)へ集約する Windows 標準機能で、WS-Management(WinRM)プロトコルを用いる。サブスクリプションには、ソースが GPO 設定に基づいてコレクターへ送る「ソース起動(プッシュ)」と、コレクターが指定ソースから取得する「コレクター起動(プル)」の2方式がある。通信は WinRM の TCP 5985(HTTP)または 5986(HTTPS)を使い、ドメイン参加機ではソース起動が Kerberos で認証され、HTTP(5985)でも Kerberos がイベントペイロードをアプリ層で暗号化する(トランスポート自体は平文)。転送先はコレクターの ForwardedEvents チャネルで、エージェント不要のためログ集約に広く使われ、近年は Azure Monitor Agent(AMA)が代替手段となる。",
    "points": [
      "2方式: ソース起動(プッシュ) / コレクター起動(プル)",
      "WS-Management(WinRM)経由、TCP 5985(HTTP)/ 5986(HTTPS)",
      "転送先はコレクター(WEC)の ForwardedEvents チャネル",
      "ソース起動は Kerberos 認証、HTTP でもペイロードを暗号化、GPO で構成",
      "エージェント不要。AMA(Azure Monitor Agent)が近年の代替"
    ],
    "related": [
      "eventlog",
      "sysmon",
      "auditpolicy",
      "gpo",
      "kerberos"
    ]
  },
  {
    "id": "vss",
    "term": "ボリュームシャドウコピー (VSS)",
    "en": "Volume Shadow Copy (VSS)",
    "aka": "VSS,Shadow Copy,vssadmin,diskshadow",
    "cat": "os",
    "body": "ボリュームシャドウコピーサービス(VSS)は、使用中でロックされたファイルであってもポイントインタイムのスナップショットを作成できるWindowsの機能。攻撃者はvssadmin、diskshadow、wmic shadowcopy call create、esentutlなどを用いてシャドウコピーを作成し、通常はロックされているNTDS.ditやSAM/SYSTEMハイブをコピーして資格情報を窃取する。ドメインコントローラー上での不正なシャドウコピー作成は、NTDS.dit窃取(T1003.003)の典型的な前段動作であり監視対象となる。ランサムウェアがvssadmin delete shadowsで復旧手段を破壊するのも代表的な悪用例。",
    "points": [
      "ロックされたNTDS.dit/SAMをコピーするために悪用される",
      "ツール: vssadmin, diskshadow, wmic shadowcopy call create, esentutl",
      "MITRE: T1003.003 (NTDS), T1490 (Inhibit System Recovery)",
      "DC上でのシャドウコピー作成とNTDS.ditアクセスを監視"
    ],
    "related": [
      "ntds",
      "sam",
      "registry",
      "dcsync",
      "dc",
      "ntfsart"
    ]
  },
  {
    "id": "schtask",
    "term": "スケジュールタスク",
    "en": "Scheduled Task",
    "aka": "schtasks,atexec,ITaskScheduler,Scheduled Task",
    "cat": "os",
    "body": "スケジュールタスクはWindowsのタスクスケジューラ(Task Scheduler)によって指定時刻や条件で任意のコマンドを実行する仕組みで、永続化とリモート実行の両方に悪用される。schtasks.exeやPowerShellのScheduledTasksモジュール、あるいは\\PIPE\\atsvc上のRPC(MS-TSCHのITaskSchedulerServiceインターフェース)で作成でき、Impacketのatexec.pyはこのRPCインターフェースを使ってリモートコマンド実行を行う。タスクはSYSTEM権限や別ユーザーのコンテキストで実行できるため権限昇格にも使われる。",
    "points": [
      "永続化(T1053.005)とリモート実行の両方に悪用",
      "atexec.pyは\\PIPE\\atsvc(ITaskSchedulerService)経由でリモート実行",
      "イベントID: 4698(作成), 4699(削除), 4700/4702(有効化/更新)",
      "タスク定義XMLは\\Windows\\System32\\Tasksに格納"
    ],
    "related": [
      "service",
      "namedpipe",
      "rpc",
      "smb",
      "eventlog"
    ]
  },
  {
    "id": "com",
    "term": "COM / DCOM",
    "en": "COM / DCOM",
    "aka": "Component Object Model,Distributed COM,CLSID,MMC20,ShellWindows",
    "cat": "os",
    "body": "COM(Component Object Model)はソフトウェアコンポーネント間のバイナリインターフェース標準で、DCOMはそれをネットワーク越しにRPC(TCP 135のエンドポイントマッパー経由)で呼び出せるよう拡張したもの。攻撃者はMMC20.Application、ShellWindows、ShellBrowserWindow、Excel.ApplicationなどのDCOMオブジェクトをCLSIDで指定してインスタンス化し、リモートホスト上で任意コマンドを実行する横展開(T1021.003)を行う。COMハイジャック(レジストリのCLSIDエントリ改ざん)は永続化手法としても悪用される。",
    "points": [
      "DCOMはRPC上で動作しTCP 135(エンドポイントマッパー)+動的高位ポートを使用",
      "横展開: MMC20.Application, ShellWindows, ShellBrowserWindowなど",
      "MITRE: T1021.003 (DCOM), T1546.015 (COM Hijacking)",
      "オブジェクトはCLSID/ProgIDで識別されHKLM/HKCUのCLSIDキーに登録"
    ],
    "related": [
      "rpc",
      "wmi",
      "registry",
      "namedpipe",
      "service",
      "oxid"
    ]
  },
  {
    "id": "winrm",
    "term": "WinRM / PowerShell リモート処理",
    "en": "WinRM / PowerShell Remoting",
    "aka": "WinRM, PSRemoting, WS-Management, evil-winrm, Enter-PSSession",
    "cat": "os",
    "body": "WinRMはWS-Management(WSMan)プロトコルのMicrosoft実装で、HTTP(TCP 5985)/HTTPS(TCP 5986)上でリモート管理とPowerShellリモート処理(PSRemoting)を提供する。Enter-PSSessionやInvoke-Command、攻撃側のevil-winrmを通じてリモートでコマンドを実行する横展開(T1021.006)に悪用され、認証はNegotiate(Kerberos/NTLM)やCredSSPで行われる。CredSSPを用いると資格情報がリモートに委任されるため、資格情報窃取のリスクが高まる。",
    "points": [
      "ポート: HTTP 5985 / HTTPS 5986",
      "ツール: Enter-PSSession, Invoke-Command, evil-winrm",
      "MITRE: T1021.006 (Windows Remote Management)",
      "認証はKerberos/NTLM/CredSSP、CredSSPは資格情報を委任し危険"
    ],
    "related": [
      "kerberos",
      "ntlm",
      "delegation",
      "pslogging",
      "rdp"
    ]
  },
  {
    "id": "lsasecrets",
    "term": "LSA Secrets",
    "en": "LSA Secrets",
    "aka": "HKLM\\SECURITY\\Policy\\Secrets, サービスアカウントパスワード",
    "cat": "os",
    "body": "LSA Secretsはローカルセキュリティ機関(LSA)が機密データを保存する領域で、レジストリのHKLM\\SECURITY\\Policy\\Secretsに置かれ、LSA/ブートキー(SYSKEY)由来の鍵で暗号化されている。サービスアカウントの平文パスワード、コンピューターアカウントパスワード($MACHINE.ACC)、自動ログオンのDefaultPassword、DPAPIのマシンキー、キャッシュ資格情報の鍵(NL$KM)などが含まれ、SYSTEM権限で復号可能。mimikatzのlsadump::secretsやImpacketのsecretsdump.pyで抽出され、平文パスワード取得の主要な標的となる(T1003.004)。",
    "points": [
      "レジストリ: HKLM\\SECURITY\\Policy\\Secrets(SYSTEM権限で読取)",
      "$MACHINE.ACC(マシンパスワード), DefaultPassword, NL$KM等を格納",
      "ツール: mimikatz lsadump::secrets, secretsdump.py",
      "MITRE: T1003.004 (LSA Secrets)"
    ],
    "related": [
      "lsass",
      "registry",
      "dpapi",
      "machineacct",
      "cachedcreds"
    ]
  },
  {
    "id": "cachedcreds",
    "term": "キャッシュされたドメイン資格情報",
    "en": "Cached Domain Credentials",
    "aka": "DCC2, MSCACHEv2, mscash",
    "cat": "os",
    "body": "キャッシュされたドメイン資格情報は、ドメインコントローラーに接続できないオフライン時でもドメインユーザーがログオンできるよう、DC検証済みログオンの検証子をローカルに保存したもの。Windows Vista以降の形式はDCC2(MS-Cache v2/mscash2)で、レジストリのHKLM\\SECURITY\\Cache(NL$1〜NL$n)に暗号化保存され、PBKDF2-HMAC-SHA1を既定10,240回反復して算出されるためパス・ザ・ハッシュには使えず、オフラインでのパスワードクラックが必要となる。既定で最大10件キャッシュされ、CachedLogonsCountで0〜50に調整可能。",
    "points": [
      "形式: DCC2/MS-Cache v2、PBKDF2-HMAC-SHA1で既定10,240反復",
      "レジストリ: HKLM\\SECURITY\\Cache のNL$1..(既定10件、CachedLogonsCountで制御)",
      "パス・ザ・ハッシュ不可、オフラインクラックが必要(hashcat -m 2100)",
      "MITRE: T1003.005、ツール: mimikatz lsadump::cache, secretsdump.py"
    ],
    "related": [
      "lsasecrets",
      "registry",
      "nthash",
      "kerberos",
      "lsass"
    ]
  },
  {
    "id": "ppl",
    "term": "保護プロセスライト (PPL)",
    "en": "Protected Process Light (PPL)",
    "aka": "PPL,RunAsPPL,PsProtectedSigner,protected process",
    "cat": "os",
    "body": "保護プロセスライト(PPL)は、署名者の階層(signer level)に基づいて低い保護レベルのプロセスから高い保護レベルのプロセスへのアクセス(メモリ読取やコード注入)をカーネルが拒否する仕組み。LSA Protection(RunAsPPL)はこれをLSASSに適用し、HKLM\\SYSTEM\\CurrentControlSet\\Control\\LsaのRunAsPPL=1で有効化され、EPROCESSのProtectionフィールドが0x41(PsProtectedSignerLsa-Light)に設定される。管理者権限があってもmimikatzで直接LSASSメモリを読めなくなるため資格情報窃取の防御となるが、署名済み脆弱ドライバ(BYOVD)やmimidrv.sys、PPLdump系のユーザーランド手法でバイパスされうる。",
    "points": [
      "RunAsPPL: HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa = 1で有効化",
      "LSASSのProtection=0x41 (PsProtectedSignerLsa-Light)",
      "バイパス: BYOVD/mimidrv.sys(SeLoadDriver), PPLdump, PPLKiller",
      "Credential Guard(仮想化ベース保護)と併用でさらに堅牢"
    ],
    "related": [
      "lsass",
      "byovd",
      "credguard",
      "abusableprivs",
      "procinjection",
      "vbs"
    ]
  },
  {
    "id": "abusableprivs",
    "term": "悪用される特権 (Se*Privilege)",
    "en": "Abusable Privileges",
    "aka": "SeImpersonate, SeBackup, SeRestore, SeLoadDriver, SeManageVolume, SeTakeOwnership",
    "cat": "os",
    "body": "Se*Privilegeはトークンに割り当てられるユーザー権利で、一部は権限昇格や資格情報アクセスに悪用される。SeImpersonatePrivilege(サービスアカウントに既定付与)はPrintSpoofer/JuicyPotato/RoguePotatoなどのPotato系攻撃でSYSTEMトークンを偽装奪取でき、SeBackupPrivilege/SeRestorePrivilegeはACLを無視してSAM/SYSTEM/NTDS.ditを読み書きできる。SeLoadDriverPrivilegeはBYOVDによる脆弱ドライバのロードを、SeTakeOwnershipPrivilegeは任意オブジェクトの所有権奪取を、SeDebugPrivilegeはLSASSを含む任意プロセスのメモリアクセスを可能にする。",
    "points": [
      "SeImpersonate → Potato系(PrintSpoofer/JuicyPotato)でSYSTEM奪取",
      "SeBackup/SeRestore → ACL無視でSAM/NTDS.dit読取",
      "SeLoadDriver → BYOVD、SeTakeOwnership → 所有権奪取、SeDebug → LSASSアクセス",
      "MITRE: T1134(Access Token Manipulation), T1548(Abuse Elevation Control Mechanism)"
    ],
    "related": [
      "privilege",
      "token",
      "tokentheft",
      "byovd",
      "lsass",
      "potato"
    ]
  },
  {
    "id": "sccm",
    "term": "SCCM / MECM",
    "en": "System Center Configuration Manager",
    "aka": "MECM, ConfigMgr, NAA, Management Point",
    "cat": "os",
    "body": "SCCM(現MECM/ConfigMgr)は端末へのソフトウェア・OS・更新配布と資産管理を行うMicrosoftのエンタープライズ管理基盤であり、大規模なSYSTEM権限コード実行能力を持つため攻撃者にとって高価値な標的となる。クライアントはネットワークアクセスアカウント(NAA)の資格情報を含むコンピュータポリシーを管理ポイント(MP)から取得し、ローカルのCIM/WMIリポジトリ(%windir%\\System32\\wbem\\Repository\\OBJECTS.DATA)にSYSTEM/マシンのDPAPIで暗号化保存するため、SharpSCCMやSCCMSecrets.pyでマシンアカウントや管理者権限を用いてこれを復号・窃取できる。PXEブート(特にパスワード無し/弱いパスワードの構成)ではPXETHIEFでメディア変数内の資格情報を回収でき、MP/サイトサーバへのNTLMリレーやCMPivotによる横展開・特権昇格も可能。防御ではNAAの廃止、SCCM基盤の階層0(Tier0)扱い、SMB署名/EPAとPKI(HTTPS)強制が重要。",
    "points": [
      "NAA資格情報はコンピュータポリシー経由で配布されOBJECTS.DATAにDPAPIで暗号化保存(WMI経由/ディスク直読の両手法で復号可)",
      "主要ツール: SharpSCCM, PXETHIEF, SCCMSecrets.py, Misconfiguration-Manager(攻撃手法カタログ)",
      "PXEの弱設定・MP/サイトサーバへのNTLMリレーが代表的な資格情報窃取/昇格経路",
      "MPは既定でTCP80(HTTP)/443(HTTPS)、NAAがDomain Adminsの構成は致命的",
      "対策: NAA廃止、SCCM基盤をTier0扱い、SMB署名/EPA/HTTPS強制"
    ],
    "related": [
      "ntlmrelay",
      "dpapi",
      "wmi",
      "machineacct",
      "tiermodel"
    ]
  },
  {
    "id": "handle",
    "term": "オブジェクトハンドル / マネージャ",
    "en": "Object Handle / Object Manager",
    "aka": "Handle,NtQueryObject,\\Device,\\BaseNamedObjects",
    "cat": "os",
    "body": "オブジェクトマネージャはWindowsカーネル(Executive)のサブシステムで、プロセス・スレッド・ファイル・レジストリキー・ミューテックス等のカーネルオブジェクトを統一的な名前空間(\\Device、\\BaseNamedObjects、\\GLOBAL??等)で管理する。プロセスはオブジェクトへ直接ポインタを持たず、EPROCESS内のハンドルテーブルへのインデックスであるハンドル値を介して参照し、各ハンドルには許可されたアクセスマスクが紐づく。攻撃者はNtQueryObject/NtDuplicateObjectで既存ハンドルを列挙・複製し、LSASSへの高権限ハンドルを乗っ取ってメモリダンプやトークン窃取を行う(ハンドルハイジャック)ため、ハンドルの権限とプロセス間複製の監視が重要。",
    "points": [
      "ハンドルはプロセス毎のハンドルテーブルのインデックスで、アクセスマスクとオブジェクト参照を保持",
      "主要名前空間: \\Device, \\BaseNamedObjects, \\GLOBAL??, \\KnownDlls",
      "関連API: NtQueryObject, NtQuerySystemInformation(SystemHandleInformation), NtDuplicateObject",
      "調査ツール: Process Hacker/System Informer, handle.exe(Sysinternals)",
      "LSASSへの既存高権限ハンドルの複製は資格情報窃取の一手法(EDRフック回避に利用)"
    ],
    "related": [
      "process",
      "token",
      "lsass",
      "syscall",
      "accessmask"
    ]
  },
  {
    "id": "syscall",
    "term": "ネイティブAPI / システムコール (Nt/Zw)",
    "en": "Native API / Syscall",
    "aka": "NTAPI,Nt/Zw functions,direct syscall,ntdll",
    "cat": "os",
    "body": "ネイティブAPI(NTAPI)はWin32サブシステム(kernel32/advapi32等)の下層でntdll.dllが公開するNt*/Zw*関数群であり、ユーザモードからカーネルへの正規の入口となる。各関数はシステムサービス番号(SSN)をレジスタに設定しsyscall命令(x86の旧来はint 2eh/sysenter)でカーネルに遷移し、SSNはSSDT(KiServiceTable)のインデックスとしてカーネル実装へ分岐する。EDRはntdll内のNt*関数先頭にユーザランドフックを仕掛けて監視するため、攻撃者はSysWhispers/Hell's Gate/Halo's Gate等でSSNを自前解決し直接/間接syscallを発行してフックを回避する。ntdll上ではNt*とZw*は同一だが、カーネル内ではZw*がPreviousMode=KernelModeを設定し、Nt*が呼び出し元モードに基づくアクセス/引数検証を行う点が異なる。",
    "points": [
      "Nt*/Zw*はntdll.dllが公開、syscall命令でカーネルへ遷移(SSNがSSDT/KiServiceTableのインデックス)",
      "直接/間接syscallはntdllのユーザランドEDRフックを迂回する回避技術",
      "代表技法/ツール: SysWhispers2/3, Hell's Gate, Halo's Gate, FreshyCalls",
      "カーネル内でZw*はPreviousMode=Kernelを設定しユーザモード由来の引数検証を省く(ntdll上はNt/Zw同一)",
      "SSNはWindowsビルド毎に変動するため実行時解決が用いられる"
    ],
    "related": [
      "handle",
      "process",
      "edr",
      "procinjection",
      "byovd"
    ]
  },
  {
    "id": "wmipersist",
    "term": "WMI 永続イベントサブスクリプション",
    "en": "WMI Permanent Event Subscription",
    "aka": "__EventFilter,__EventConsumer,__FilterToConsumerBinding,CommandLineEventConsumer",
    "cat": "os",
    "body": "WMI永続イベントサブスクリプションは、__EventFilter(WQLクエリで発火条件を定義)、__EventConsumer(実行アクションの抽象基底、実体はCommandLineEventConsumer等)、__FilterToConsumerBinding(両者を結合)の3クラスをroot\\subscription名前空間に登録して永続化する技法(MITRE ATT&CK T1546.003)。CommandLineEventConsumerやActiveScriptEventConsumerを用い、システム起動や特定時刻・ログオン等のイベントを契機にSYSTEM権限でコマンド/スクリプトを実行するため、ファイルレスかつステルス性が高くAPTに多用される。SysmonはEventID 19(WmiEventFilter)、20(WmiEventConsumer)、21(WmiEventConsumerToFilter=Binding)で各コンポーネント作成を記録し、正規の管理製品以外での利用は強い異常シグナルとなる。",
    "points": [
      "3要素: __EventFilter(WQL条件)+ __EventConsumer(アクション)+ __FilterToConsumerBinding(結合)",
      "MITRE ATT&CK T1546.003、多くはSYSTEM権限でファイルレス実行",
      "悪用が多いConsumer: CommandLineEventConsumer, ActiveScriptEventConsumer",
      "検知: Sysmon EventID 19/20/21(3つが近接発生)、リポジトリはOBJECTS.DATA",
      "調査ツール: PowerShell(Get-WMIObject/Get-CimInstance -Namespace root\\subscription), Autoruns"
    ],
    "related": [
      "wmi",
      "sysmon",
      "service",
      "registry",
      "threathunting"
    ]
  },
  {
    "id": "credman",
    "term": "資格情報マネージャー / Windows Vault",
    "en": "Credential Manager / Windows Vault",
    "aka": "Windows Credential Vault, vaultcmd",
    "cat": "os",
    "body": "資格情報マネージャー(Windows Vault)はユーザのパスワード・RDP資格情報・Webフォーム認証情報等を保管するOS機能で、Windows資格情報とWeb資格情報の2つのVaultに分かれる。資格情報のblobは%appdata%\\Microsoft\\Credentialsや%localappdata%\\Microsoft\\Credentials配下にDPAPI(マスターキー)で暗号化保存され、Vaultメタデータは\\Microsoft\\Vault配下に置かれる。CredRead/CredEnumerate API、vaultcmd、cmdkeyで操作する。攻撃者はユーザ文脈でCredEnumerateやMimikatz(vault::cred, dpapi::cred)で平文資格情報を回収するため、保存された資格情報の棚卸しとドメインDPAPIバックアップキーの保護が重要。",
    "points": [
      "Windows資格情報とWeb資格情報の2Vault、資格情報blobはDPAPIで暗号化保存",
      "保存場所: %(local)appdata%\\Microsoft\\Credentials(blob), ...\\Microsoft\\Vault(メタ)",
      "操作: vaultcmd, cmdkey, CredEnumerate/CredRead API",
      "窃取ツール: Mimikatz(vault::cred, dpapi::cred), SharpDPAPI",
      "ドメインのDPAPIバックアップキー奪取で全ユーザ資格情報を復号可能"
    ],
    "related": [
      "dpapi",
      "lsasecrets",
      "rdp",
      "creddump",
      "credguard"
    ]
  },
  {
    "id": "rdp",
    "term": "RDP / ターミナルサービス",
    "en": "Remote Desktop / Terminal Services",
    "aka": "RDP, tscon, Restricted Admin, PtH-over-RDP",
    "cat": "os",
    "body": "RDP(ターミナルサービス、既定TCP3389)はリモートデスクトップ接続を提供し、対話ログオン(ログオンタイプ10 RemoteInteractive)を発生させる。Restricted Adminモードはリモートに平文資格情報を送らずNTハッシュ/Kerberosチケットで接続するためPtH-over-RDPを可能にするが、リレー攻撃面を生むという副作用がある。攻撃者はSYSTEM権限でtscon <session> /dest:を用い切断済みセッションをパスワード無しで乗っ取る(RDPセッションハイジャック)ほか、bmc-toolsでビットマップキャッシュ(mstsc)から画面痕跡を復元する。Protected Usersメンバーは資格情報がRDP先にキャッシュされずNTLM不可となり、平文/NTハッシュの窃取を緩和する(反面、IP接続等でKerberosが使えないと認証が失敗)。防御にはRemote Credential Guard、NLA、Protected Users、管理端末(PAW)経由の接続制限が有効。",
    "points": [
      "既定TCP3389、ログオンタイプ10(RemoteInteractive)、Event 4624/4778(再接続)/4779(切断)",
      "Restricted AdminモードはPtH-over-RDPを許容(平文資格情報を送らない反面リレー面が拡大)",
      "tscon <id> /dest:によるセッションハイジャック(SYSTEM権限で認証不要)",
      "Protected Usersメンバーは資格情報がRDP先にキャッシュされずNTLM不可(平文/NTハッシュ窃取を緩和)",
      "対策: Remote Credential Guard, NLA, PAW経由接続, Protected Users"
    ],
    "related": [
      "logontype",
      "pth",
      "credman",
      "protectedusers",
      "paw",
      "credssp"
    ]
  },
  {
    "id": "wsus",
    "term": "WSUS",
    "en": "Windows Server Update Services",
    "aka": "WSUS, 更新配布",
    "cat": "os",
    "body": "WSUSはMicrosoft更新プログラムを組織内に集中配布するサーバ機能で、クライアントとの通信は既定でHTTP 8530/HTTPS 8531を用い、クライアント側の接続先はレジストリ HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate の WUServer/WUStatusServer に、有効化フラグはサブキー \\AU の UseWUServer=1 に格納される。承認済み更新やターゲット情報はデータベースSUSDBで管理され、既定のWIDでは %WinDir%\\WID\\Data\\SUSDB.mdf/SUSDB_log.ldf に置かれる(別途SQL Server構成も可)。1台のWSUSサーバが配下の全クライアント/サーバに更新(=任意コード)をSYSTEM権限で配信できるためネットワーク分離を越えた横展開の踏み台になり、SharpWSUS/WSUSpenduは署名済み正規バイナリ(PsExec等)を悪性引数付きで承認・配信するWSUS注入を自動化し、SSL未強制のWSUSはWSuspicious/WSUSpectのMITMで偽更新を注入され得る。CVE-2025-59287(GetCookie/AuthorizationCookie及びReportingWebServiceのBinaryFormatterによる安全でないデシリアライズ、未認証RCE、SYSTEM、CVSS9.8)は2025年10月に実際に悪用された。検出はapprove/create+/payload:や/updateid:を含むコマンドライン、承認ユーザ\"WUS Server\"、削除後もWSUS web root配下に残る署名済みバイナリが手掛かりで、防御はHTTPS/署名強制・8530/8531インバウンド遮断・迅速なパッチ適用。",
    "points": [
      "通信は既定HTTP 8530/HTTPS 8531、更新はSYSTEM権限で実行され横展開に悪用",
      "クライアント設定はレジストリ HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate の WUServer/WUStatusServer、有効化はサブキー \\AU の UseWUServer=1。DBはSUSDB(既定WID: %WinDir%\\WID\\Data\\SUSDB.mdf、またはSQL Server)",
      "ツール: SharpWSUS, WSUSpendu, WSuspicious/WSUSpect(SSL未強制時のMITM)。注入は署名済み正規バイナリ(PsExec等)+悪性引数で承認・配信",
      "CVE-2025-59287: WSUSの安全でないデシリアライズ(GetCookie/ReportingWebService)による未認証RCE(SYSTEM、CVSS9.8、2025年10月に実悪用)",
      "検出: approve/create+/payload:/updateid: を含むコマンドライン、承認ユーザ\"WUS Server\"、WSUS web root配下に残る署名済みバイナリ、SUSDBの不審な承認",
      "対策: HTTPS/署名強制、8530/8531のインバウンド遮断、迅速なパッチ適用"
    ],
    "related": [
      "sccm",
      "lolbin",
      "tiermodel",
      "ntlmrelay",
      "killchain"
    ]
  },
  {
    "id": "accessmask",
    "term": "アクセスマスク / アクセス権",
    "en": "Access Mask / Access Rights",
    "aka": "GenericAll, WriteDACL, WriteOwner, GenericWrite, WriteProperty",
    "cat": "identity",
    "body": "アクセスマスクはACE(アクセス制御エントリ)内の32ビットDWORDで、対象オブジェクトに対して許可/拒否される権利を表す。下位16ビット(0-15)がオブジェクト固有権(ファイルのFILE_WRITE_DATA、ADのDS_WRITE_PROP等)、16-23ビットが標準権でWRITE_DAC(0x40000=WriteDACL)やWRITE_OWNER(0x80000=WriteOwner)を含み、上位4ビット(28-31)が汎用権(GENERIC_ALL/EXECUTE/WRITE/READ)で、汎用権はオブジェクト型のGenericMappingで固有権へ変換される。AD攻撃ではGenericAll(完全制御)、GenericWrite(属性書換)、WriteDacl(DACL書換で自身に権限付与)、WriteOwner(所有者奪取)が特権昇格の主要エッジとなり、BloodHoundがこれらの委任関係を可視化する。",
    "points": [
      "32ビット構成: 固有権(0-15)+標準権(16-23)+汎用権(28-31:GA/GE/GW/GR)",
      "WRITE_DAC=0x40000(WriteDacl)、WRITE_OWNER=0x80000(WriteOwner)",
      "AD特権昇格エッジ: GenericAll, GenericWrite, WriteDacl, WriteOwner",
      "WriteDaclは自ACE追加、WriteOwnerは所有者を奪ってDACL書換に連鎖",
      "BloodHoundで委任関係を列挙・攻撃パス分析、AccessChk(Sysinternals)で有効権限判定"
    ],
    "related": [
      "dacl",
      "accesscheck",
      "extendedrights",
      "secdesc",
      "adminsdholder"
    ]
  },
  {
    "id": "extendedrights",
    "term": "拡張権限 / 制御アクセス権",
    "en": "Extended Rights / Control Access Rights",
    "aka": "controlAccessRight GUID, DS-Replication-Get-Changes, User-Force-Change-Password",
    "cat": "identity",
    "body": "拡張権限（制御アクセス権／Control Access Right）は、AD標準の読み書きACEでは表現できない特殊な操作を制御する仕組みで、各権利はConfigurationパーティションのCN=Extended-Rights配下のオブジェクトとしてrightsGuidで定義される。ACE内ではACCESS_ALLOWED_OBJECT_ACE型のObjectTypeにその権利GUIDを格納し、CONTROL_ACCESS(0x100)アクセスマスクと組み合わせて特定の制御アクセス権のみを許可する。DCSyncに悪用されるDS-Replication-Get-Changes / -All、パスワード強制変更のUser-Force-Change-Passwordなどが代表例で、委任されたACLがそのまま権限昇格経路となるため監視対象となる。",
    "points": [
      "DS-Replication-Get-Changes GUID=1131f6aa-9c07-11d1-f79f-00c04fc2dcd2",
      "DS-Replication-Get-Changes-All GUID=1131f6ad-9c07-11d1-f79f-00c04fc2dcd2、フィルタセット版=89e95b76-444d-4c62-991a-0facbeda640c",
      "User-Force-Change-Password GUID=00299570-246d-11d0-a768-00aa006e0529",
      "前2者を持つとDCSync可能（MITRE T1003.006）、後者でパスワード奪取",
      "BloodHoundのGetChanges/GetChangesAll/ForceChangePasswordエッジで検出"
    ],
    "related": [
      "dcsync",
      "dacl",
      "guid",
      "secdesc",
      "krbtgt"
    ]
  },
  {
    "id": "sidhistory",
    "term": "sIDHistory (SID履歴)",
    "en": "SID History",
    "aka": "sIDHistory attribute,ExtraSids",
    "cat": "identity",
    "body": "sIDHistoryはアカウント移行時に旧ドメインのSIDを保持し、旧リソースへのアクセスを維持するための属性である。認証時にはこのSIDがKerberos PACのExtraSIDsやアクセストークンに追加され、アクセスチェックで元のSIDと同等に評価される。攻撃者がDomain Admins(RID 512)やEnterprise Admins(RID 519)のSIDを被害アカウントのsIDHistoryへ注入すると（SID History Injection、T1134.005）、通常のグループ非所属のまま特権が得られるため、DCShadowやMimikatzのDCSync/権限昇格と併用される。SIDフィルタリングはこの悪用を跨ドメインで緩和する防御である。",
    "points": [
      "属性名 sIDHistory、値はPAC ExtraSIDs／トークンに反映され特権が加算される",
      "RID 512(Domain Admins)/519(Enterprise Admins)注入で隠れた特権化",
      "MITRE T1134.005 (SID-History Injection)",
      "注入にはDSInternals/Mimikatz(sid::patch,sid::add)やDCShadowを利用",
      "SIDフィルタリングとPACのSID Filtering検証が緩和策"
    ],
    "related": [
      "sid",
      "rid",
      "pac",
      "sidfiltering",
      "dcshadow",
      "shadowprincipal"
    ]
  },
  {
    "id": "accesscheck",
    "term": "アクセスチェック",
    "en": "Access Check",
    "aka": "SeAccessCheck,security context evaluation",
    "cat": "identity",
    "body": "アクセスチェックは、要求主体のアクセストークン（ユーザSID・グループSID・特権・整合性レベル）とオブジェクトのセキュリティ記述子内DACLを突き合わせ、要求されたアクセスマスクを許可するか判定するWindowsの中核ロジックである。カーネルのSeAccessCheck等が、DACL中のACEを順に評価し、明示的拒否ACEを許可より優先しつつ、要求権利がすべて許可されるまで累積評価する。所有者はWRITE_DAC/READ_CONTROLを暗黙に持ち、SeBackupPrivilege/SeRestorePrivilegeはDACLチェックを迂回、SeTakeOwnershipPrivilegeはWRITE_OWNERを付与しうる。ADオブジェクトではObjectType付きACEにより属性単位・拡張権限単位で評価される点がファイル系と異なる。",
    "points": [
      "トークン（SID群・特権・整合性）×SD内DACLで判定、監査はSACLで生成",
      "明示的拒否ACEは許可より優先、評価はACE順序に依存",
      "要求アクセスマスク全ビットが満たされて初めて許可",
      "所有者は暗黙にREAD_CONTROL/WRITE_DACを保持、SeBackup/SeRestore/SeTakeOwnershipでバイパス可",
      "API: SeAccessCheck / AccessCheck()"
    ],
    "related": [
      "token",
      "dacl",
      "secdesc",
      "accessmask",
      "sid"
    ]
  },
  {
    "id": "aceinherit",
    "term": "ACL継承",
    "en": "ACE Inheritance",
    "aka": "inheritable ACE,CONTAINER_INHERIT,SDProp,inheritance flags",
    "cat": "identity",
    "body": "ACL継承は、親コンテナ（ディレクトリやADのOU/コンテナ）に設定された継承可能ACEが、子オブジェクトへ自動伝播する仕組みである。ACEのフラグ（CONTAINER_INHERIT_ACE、OBJECT_INHERIT_ACE、INHERIT_ONLY_ACE、NO_PROPAGATE等）が伝播範囲を決め、継承されたACEにはINHERITED_ACEフラグが付与される。ADではAdminSDHolderのACLが保護グループへSDPropタスク（既定60分周期）で再適用され、継承のブロック（protectedブロック）と相まって特権アカウントを保護する。攻撃者はコンテナ/OUに継承可能な悪性ACEを仕込み、配下オブジェクトへ横展開する。",
    "points": [
      "継承フラグ: OBJECT_INHERIT/CONTAINER_INHERIT/INHERIT_ONLY/NO_PROPAGATE_INHERIT",
      "継承ACEにはINHERITED_ACE(0x10)フラグが立つ",
      "AdminSDHolder+SDProp(既定60分)が保護グループACLを上書き・継承抑止",
      "adminCount=1のオブジェクトは継承が無効化される",
      "OU/コンテナへの悪性ACE設置で配下へ権限横展開"
    ],
    "related": [
      "dacl",
      "adminsdholder",
      "secdesc",
      "ou",
      "privgroups"
    ]
  },
  {
    "id": "sidfiltering",
    "term": "SIDフィルタリング",
    "en": "SID Filtering",
    "aka": "SID filtering,quarantine,TREAT_AS_EXTERNAL",
    "cat": "adstruct",
    "body": "SIDフィルタリングは、信頼を越えて渡されるPAC/認証データから、その信頼ドメインに属さないSID（特にsIDHistoryやExtraSIDs）を除去し、SID History Injectionによる特権昇格を防ぐ防御機構である。外部信頼では既定で有効（隔離／quarantine）で、信頼相手のドメインSID配下以外のSIDが破棄される。フォレスト内の親子信頼はSID Filtering非適用のため信頼境界ではなく、フォレスト信頼はデフォルトでフォレスト外SIDをフィルタする。TDOのtrustAttributesビットで挙動が制御され、TREAT_AS_EXTERNAL(0x40)は隔離を外部信頼相当に緩めるため誤設定が攻撃面となる。",
    "points": [
      "外部/フォレスト信頼で既定有効、フォレスト内親子信頼は非適用（信頼境界でない）",
      "TRUST_ATTRIBUTE_QUARANTINED_DOMAIN=0x4 で隔離: 相手ドメインSID配下のSIDのみ許容し、RID<1000の既知SIDやドメイン外SIDは除去",
      "TRUST_ATTRIBUTE_TREAT_AS_EXTERNAL=0x40 で緩和、悪用時にsIDHistory越境が可能",
      "netdom trust /quarantine で確認・設定",
      "sIDHistory/ExtraSIDs 注入(T1134.005)の主要緩和策"
    ],
    "related": [
      "sidhistory",
      "trust",
      "tdo",
      "sid",
      "pac"
    ]
  },
  {
    "id": "rodc",
    "term": "読み取り専用DC (RODC)",
    "en": "Read-Only Domain Controller",
    "aka": "RODC,PRP,Password Replication Policy,krbtgt_RODC",
    "cat": "adstruct",
    "body": "読み取り専用ドメインコントローラ（RODC）は、支店等の物理的に安全でない拠点向けに、ADDSの読み取り専用レプリカを保持するDCである。書き込みは受け付けず書き込み可能DCへ転送し、既定ではパスワードハッシュを保持しないが、パスワードレプリケーションポリシー（PRP、msDS-Reveal-OnDemandGroup/NeverRevealGroup）で許可された主体のみ資格情報をキャッシュする。各RODCは専用のkrbtgtアカウント（krbtgt_<数値>）を持ちTGTを署名するため、その鍵の窃取は当該RODCで許可された範囲に限定される。msDS-RevealedList等の監視や、PRPの過剰許可・msDS-RevealOnDemand悪用が攻撃観点となる。",
    "points": [
      "書き込み不可、変更は書き込み可能DCへ転送、一方向レプリケーション",
      "PRP: msDS-Reveal-OnDemandGroup(許可)/msDS-NeverRevealGroup(禁止)でキャッシュ制御",
      "RODC専用krbtgtアカウント krbtgt_NNNNN（branch番号）でTGT署名",
      "msDS-RevealedList/msDS-AuthenticatedToAccountList で流出資格を監査",
      "PRP過剰許可やローカルadmin委任が権限昇格経路"
    ],
    "related": [
      "dc",
      "krbtgt",
      "replication",
      "adds",
      "nthash"
    ]
  },
  {
    "id": "maq",
    "term": "MachineAccountQuota",
    "en": "Machine Account Quota",
    "aka": "MAQ,ms-DS-MachineAccountQuota",
    "cat": "adstruct",
    "body": "MachineAccountQuota（MAQ）は、認証済みの一般ユーザが1人あたりドメインに作成できるコンピュータアカウント（マシンアカウント）の上限を定めるドメイン属性で、既定値は10である。属性ms-DS-MachineAccountQuotaがドメインオブジェクトに設定され、既定でAuthenticated Usersがコンピュータオブジェクトを追加可能なため、低権限ユーザでも任意の新規マシンアカウントを作成できてしまう。この既定挙動はResource-Based Constrained Delegation(RBCD)攻撃、noPac(CVE-2021-42278/42287)、シャドウクレデンシャル等の前提として悪用されるため、多くの環境ではMAQを0にすることが推奨される。",
    "points": [
      "属性 ms-DS-MachineAccountQuota、既定値=10",
      "既定でAuthenticated Usersが新規マシンアカウント作成可能",
      "RBCD/noPac(CVE-2021-42278,42287)/Shadow Credentialsの起点",
      "作成者はmS-DS-CreatorSIDに記録され対象アカウントを操作可能",
      "緩和: MAQを0に設定し委任された管理者のみに作成を制限"
    ],
    "related": [
      "machineacct",
      "rbcdattr",
      "delegation",
      "shadowcred",
      "adds"
    ]
  },
  {
    "id": "tdo",
    "term": "信頼ドメインオブジェクト (TDO)",
    "en": "Trusted Domain Object",
    "aka": "TDO,trustedDomain,inter-realm key,trust account",
    "cat": "adstruct",
    "body": "信頼ドメインオブジェクト（TDO / trustedDomain クラス）は、あるドメイン・フォレストが結んだ信頼関係のメタデータを格納するオブジェクトで、System コンテナ配下に置かれる。信頼の方向・種別・推移性はtrustDirection/trustType/trustAttributesに、相手のドメイン名とSIDはtrustPartner/securityIdentifierに保持され、信頼間認証に使う相互レルム鍵（inter-realm key）は関連する信頼アカウント（<相手ドメイン>$）のパスワードとしてLSAシークレットに格納される。このinter-realm信頼鍵を奪取すると、信頼を越えてTGTを偽造するインターレルム・ゴールデンチケット等が可能になるため、TDOと信頼アカウントは重要な監視対象である。",
    "points": [
      "trustedDomainクラス、CN=System配下に格納",
      "主要属性: trustDirection / trustType / trustAttributes / securityIdentifier",
      "trustAttributesで推移性・隔離(0x4)・フォレスト推移(0x8)・外部扱い(0x40)を制御",
      "相互レルム鍵は信頼アカウント(TRUST$)のパスワードとしてLSAシークレットに存在",
      "鍵奪取で越境TGT偽造（inter-realmゴールデンチケット）が可能"
    ],
    "related": [
      "trust",
      "sidfiltering",
      "lsasecrets",
      "kerberos",
      "goldenticket"
    ]
  },
  {
    "id": "rbcdattr",
    "term": "RBCD 属性",
    "en": "Resource-Based Constrained Delegation Attribute",
    "aka": "msDS-AllowedToActOnBehalfOfOtherIdentity, RBCD",
    "cat": "adstruct",
    "body": "msDS-AllowedToActOnBehalfOfOtherIdentity 属性はリソース(委任先)側のコンピュータ/サービスアカウントに設定され、そのアカウントへ委任してよいプリンシパルをDACLとして列挙したセキュリティ記述子を保持する。攻撃者がターゲットオブジェクトへの書き込み権を持ち、かつSPNを持つアカウント(既定MAQ=10で作成したマシンアカウント等)を支配していれば、この属性を自分の支配SIDに書き換え、S4U2Self→S4U2Proxy(Rubeus等)を連鎖させて任意ユーザー(例: Domain Admin)をターゲットへ偽装できる。従来の制約付き委任(msDS-AllowedToDelegateTo、フロントエンド側に設定、書込にSeEnableDelegation権限が必要)と異なり、RBCDはリソース自身に設定されるため、リソースオブジェクトの制御だけで悪用が成立する。",
    "points": [
      "属性: msDS-AllowedToActOnBehalfOfOtherIdentity(セキュリティ記述子、DACLに委任元プリンシパルを列挙)",
      "前提: ターゲットへの書込権(GenericWrite/GenericAll/WriteDACL/WriteOwner)+ SPN保持アカウント(MAQ既定10でマシンアカウント作成可)",
      "悪用: S4U2Self→S4U2Proxyで任意ユーザー偽装、被害者のTGTは不要",
      "従来KCD(msDS-AllowedToDelegateTo)と逆方向で、SeEnableDelegation権限が不要",
      "検知: 5136で属性書換、4769でTransited Services非空。MITRE T1558/T1098(属性操作)"
    ],
    "related": [
      "delegation",
      "s4u",
      "maq",
      "machineacct",
      "kerberos"
    ]
  },
  {
    "id": "objectclass",
    "term": "objectClass / 属性 (attribute)",
    "en": "objectClass / Attribute",
    "aka": "attributeSchema,classSchema,mustContain,mayContain",
    "cat": "adstruct",
    "body": "Active Directoryのスキーマは classSchema と attributeSchema オブジェクトでクラスと属性を定義し、いずれもSchema NCに格納される。classSchema は mustContain/mayContain(および system* 版)で必須・任意属性を、governsID でクラスのOIDを規定し、attributeSchema は attributeID(OID)、attributeSyntax/oMSyntax、isSingleValued、searchFlags を規定する。各オブジェクトの objectClass 属性は多値で、top から構造クラスまでのクラス階層を保持する。攻撃観点では、どのクラスかで適用可能な攻撃属性が決まり(例: computerオブジェクトは msDS-AllowedToActOnBehalfOfOtherIdentity を持てる)、searchFlags のビットで機密属性やRODCフィルタ属性が制御される。スキーマ改変はフォレスト全体かつ不可逆で、Schema Admins権限を要する。",
    "points": [
      "classSchema: mustContain/systemMustContain, mayContain, governsID(OID), subClassOf",
      "attributeSchema: attributeID(OID), attributeSyntax/oMSyntax, isSingleValued, searchFlags",
      "objectClass属性は多値でクラス階層(top→…→構造クラス)を保持",
      "searchFlags: RODCフィルタ(0x200/bit9)・confidential(0x80/bit7)属性を制御",
      "スキーマ改変はフォレスト全体・不可逆、Schema Admins権限が必要"
    ],
    "related": [
      "schema",
      "ntds",
      "namingcontext",
      "adds",
      "guid"
    ]
  },
  {
    "id": "namingcontext",
    "term": "命名コンテキスト / パーティション",
    "en": "Naming Contexts / Partitions",
    "aka": "Configuration NC,Schema NC,Domain NC,application partition,DNS partition",
    "cat": "adstruct",
    "body": "命名コンテキスト(NC)はADの複製・管理の単位となるサブツリーで、Domain NC(DC=…)、Configuration NC(CN=Configuration,…)、Schema NC(CN=Schema,CN=Configuration,…)の3種に加え、DomainDnsZones/ForestDnsZones などのアプリケーションパーティションがある。Configuration NC と Schema NC はフォレスト全体に複製され、各 Domain NC はドメイン内DC間で複製、GCは全ドメインNCの部分属性集合(PAS)を保持する。利用可能なNCは RootDSE の namingContexts / configurationNamingContext 属性で列挙できる。セキュリティ上、Configuration NC がフォレスト全体に複製される点を悪用し、DCShadow は Configuration NC に不正なnTDSDSA(DC)オブジェクトを一時登録して改変を注入する。",
    "points": [
      "Domain NC(DC=…), Configuration NC(CN=Configuration,…), Schema NC(CN=Schema,CN=Configuration,…)",
      "アプリケーションパーティション: DomainDnsZones/ForestDnsZones(ADIDNS格納)",
      "Config/Schemaはフォレスト全体複製、Domain NCはドメイン内複製、GCは全ドメインの部分属性集合(PAS)",
      "RootDSEの namingContexts / configurationNamingContext 属性で参照可能",
      "DCShadowはConfiguration NCへ不正nTDSDSA(DC)を登録して悪用"
    ],
    "related": [
      "schema",
      "replication",
      "dcshadow",
      "gc",
      "adidns"
    ]
  },
  {
    "id": "dsrm",
    "term": "DSRM (ディレクトリサービス復元モード)",
    "en": "Directory Services Restore Mode",
    "aka": "DSRM, DSRMパスワード",
    "cat": "adstruct",
    "body": "DSRM(ディレクトリサービス復元モード)はDCの復旧用セーフブートモードで、認証にはAD本体ではなくDCローカルSAM上のAdministratorアカウント(RID 500、DSRMアカウント)を用いる。パスワードは昇格時に設定され、ntdsutil の \"set dsrm password\" でリセットや任意ドメインアカウントとの同期が可能である。バックドア化では、DSRMパスワードをドメインアカウントと同期したうえで HKLM\\System\\CurrentControlSet\\Control\\Lsa\\DsrmAdminLogonBehavior を 2 に設定し、DC稼働中でもDSRMアカウントでのログオン(ネットワーク認証を含む)を許可して永続化に用いる。本来は ntds.dit のオフライン修復・デフラグ・オブジェクト復元に使われる。",
    "points": [
      "DSRMアカウント = DCローカルSAM上のAdministrator(RID 500)、AD本体とは別",
      "パスワードリセット: ntdsutil \"set dsrm password\"、既存ドメインアカウントと同期可能",
      "バックドア: Lsa\\DsrmAdminLogonBehavior=2 でDC稼働中もDSRMログオン可(永続化, MITRE T1556系)",
      "本来用途: ntds.dit修復・オフラインデフラグ・オブジェクト復元",
      "検知: DsrmAdminLogonBehaviorレジストリ値の監視、DSRMログオンイベント"
    ],
    "related": [
      "ntds",
      "sam",
      "registry",
      "dc",
      "adds"
    ]
  },
  {
    "id": "adidns",
    "term": "AD統合DNS / ADIDNS",
    "en": "AD-Integrated DNS",
    "aka": "ADIDNS,dnsNode,dnsZone,wildcard record",
    "cat": "adstruct",
    "body": "AD統合DNS(ADIDNS)はDNSゾーンを dnsZone/dnsNode オブジェクトとしてAD(DomainDnsZones/ForestDnsZones パーティション)に格納し、AD複製で伝搬させる方式である。既定ではいかなる認証済みユーザーもセキュア動的更新で新規レコードを作成でき、作成者がそのレコードを所有する。攻撃では、明示レコードを持たないホストの名前解決を横取りするワイルドカード(*)Aレコードや、GQBL(グローバルクエリブロックリスト)に阻まれる通常のWPADを回避してプロキシ設定を配信するレコードを注入し、中間者攻撃(AiTM)や資格情報奪取に繋げる。ツールとしては Powermad / Invoke-DNSUpdate(Kevin Robertson)が知られる。",
    "points": [
      "格納: dnsNode/dnsZoneオブジェクト、DomainDnsZones/ForestDnsZonesパーティション(AD複製)",
      "既定で認証済みユーザーがセキュア動的更新により新規レコード作成可能(作成者が所有)",
      "攻撃: ワイルドカード(*)レコードで名前解決をMITM、WPADレコードでGQBLをバイパス",
      "ツール: Powermad / Invoke-DNSUpdate(Kevin Robertson)。MITRE T1557(AiTM)",
      "既存レコードは所有権により他ユーザーからは上書き不可、NTLMリレーの前段として有効"
    ],
    "related": [
      "dclocator",
      "namepoison",
      "aitm",
      "ntlmrelay",
      "namingcontext",
      "dnsupdateproxy"
    ]
  },
  {
    "id": "dclocator",
    "term": "DCロケータ / SRVレコード",
    "en": "DC Locator / DNS SRV Records",
    "aka": "_ldap._tcp,_kerberos._tcp,DsGetDcName,SRV record",
    "cat": "adstruct",
    "body": "DCロケータはクライアントがDNSのSRVレコード(_msdcs.<forest> 配下)を用いてDCを発見する仕組みである。クライアントは Netlogon の DsGetDcName を呼び、_ldap._tcp.dc._msdcs.<domain> や _kerberos._tcp.dc._msdcs.<domain>、サイト別の _ldap._tcp.<site>._sites.dc._msdcs.<domain> といったSRV/Aレコードを問い合わせ、候補DCへ CLDAP(LDAP ping, UDP 389)を送って稼働確認し、最速で応答したDCを採用する。レガシーではメールスロット/NetBIOSにフォールバックする(近年のWindowsで非推奨化)。セキュリティ上は、DNS/ADIDNSレコードの注入やSRVスプーフィングでクライアントを不正DCやリレー先へ誘導でき、ダウングレードやコアーションの前段となる。",
    "points": [
      "主要SRV: _ldap._tcp.dc._msdcs.<domain>, _kerberos._tcp.dc._msdcs.<domain>、サイト別 _sites.",
      "DsGetDcName(Netlogon)→ DNS SRV/Aクエリ → CLDAP(LDAP ping, UDP 389)で稼働確認、最速応答を採用",
      "レガシー: メールスロット/NetBIOSフォールバック(近年のWindowsで非推奨)",
      "攻撃面: DNS/ADIDNSレコード注入・SRVスプーフィングで不正DCへ誘導",
      "ダウングレード・NTLMリレー・コアーションの前段として重要"
    ],
    "related": [
      "adidns",
      "namepoison",
      "kerberos",
      "ldap",
      "namingcontext"
    ]
  },
  {
    "id": "drsuapi",
    "term": "DRSUAPI / MS-DRSR",
    "en": "DRSUAPI / MS-DRSR",
    "aka": "DRSUAPI,MS-DRSR,DsGetNCChanges,IDL_DRSGetNCChanges",
    "cat": "adstruct",
    "body": "DRSUAPI はDC間のディレクトリ複製に用いるRPCインターフェース(仕様は MS-DRSR、ディレクトリレプリケーションサービスリモートプロトコル)で、インターフェースUUIDは e3514235-4b06-11d1-ab04-00c04fc2dcd2 である。IDL_DRSGetNCChanges(Opnum 3)はソースDCからオブジェクト更新(unicodePwd や supplementalCredentials などの機密属性を含む)を取得するメソッドで、これが DCSync の基盤となり、LSASSに触れずに krbtgt を含む任意アカウントのハッシュを抽出できる。実行には DS-Replication-Get-Changes / -All / -In-Filtered-Set の拡張権限(通常はDC・Domain/Enterprise Adminsのみ)が必要である。検知は複製権利に対する4662や、非DC送信元からのDRSUAPI Opnum 3のETW監視で行う。",
    "points": [
      "MS-DRSR / DRSUAPI RPCインターフェース UUID e3514235-4b06-11d1-ab04-00c04fc2dcd2",
      "IDL_DRSGetNCChanges = Opnum 3(NC複製、unicodePwd/supplementalCredentials等の機密属性を含む)",
      "DCSyncの基盤(krbtgtを含む任意ハッシュ取得、LSASS非接触)。MITRE T1003.006",
      "必要権利: DS-Replication-Get-Changes(1131f6aa-…)/ -All(1131f6ad-…)/ -In-Filtered-Set(89e95b76-…)",
      "検知: 非DC送信元の4662、DRSUAPI Opnum3のETW/RPCファイアウォール"
    ],
    "related": [
      "dcsync",
      "replication",
      "extendedrights",
      "krbtgt",
      "rpc"
    ]
  },
  {
    "id": "kdsrootkey",
    "term": "KDS ルートキー",
    "en": "KDS Root Key",
    "aka": "Key Distribution Services root key,GMSA password derivation",
    "cat": "objects",
    "body": "KDSルートキーは Configuration NC の msKds-ProvRootKey オブジェクト(CN=Master Root Keys,CN=Group Key Distribution Service 配下)として保持される秘密で、gMSA(および dMSA)のパスワード導出の起点となる。パスワードは MS-GKDI の GetKey が生成する Group Key Envelope を介し、ルートキー・対象gMSAのSID・ManagedPasswordID(msDS-ManagedPasswordId のKDFパラメータ)から決定論的に導出される(256バイトのパスワードが生成され、構成属性 msDS-ManagedPassword にBLOBとして返る)。ルートキー値はローテーションされないため、攻撃者が msKds-RootKeyData 等のルートキー属性を一度読み出せば、関連する任意のgMSAのパスワードを以後DCに接触せずオフラインで計算できる(Golden GMSA攻撃、Semperis GoldenGMSA)。ルートキーの作成は Add-KdsRootKey で行う。",
    "points": [
      "オブジェクト: msKds-ProvRootKey(Configuration NC、CN=Master Root Keys,CN=Group Key Distribution Service,…)、秘密は msKds-RootKeyData",
      "導出: MS-GKDI GetKey → Group Key Envelope、rootkey + gMSA SID + ManagedPasswordID から決定論的に生成(パスワードは256B、msDS-ManagedPassword構成属性でBLOB返却)",
      "ルートキーは無期限(ローテーションなし): 漏えいで関連gMSAを永続的にオフライン計算可能",
      "Golden GMSA攻撃(Semperis GoldenGMSA)、生成コマンドは Add-KdsRootKey",
      "検知: msKds-RootKeyData読取に対する4662(objectType=msKds-ProvRootKey、送信元が非DC)。SACL設定が前提"
    ],
    "related": [
      "gmsa",
      "goldengmsa",
      "machineacct",
      "namingcontext",
      "sid"
    ]
  },
  {
    "id": "laps",
    "term": "LAPS",
    "en": "Local Administrator Password Solution",
    "aka": "ms-Mcs-AdmPwd,msLAPS-Password,Windows LAPS,msLAPS-EncryptedPassword",
    "cat": "objects",
    "body": "LAPS(Local Administrator Password Solution)は、各端末のローカル管理者アカウントのパスワードを定期的にランダム化し、対応するコンピュータオブジェクトの属性としてActive Directoryに保存する仕組みで、パスワードの使い回しによる横展開(Pass-the-Hash等)を封じる防御策である。旧来のMicrosoft LAPSは平文属性 ms-Mcs-AdmPwd(有効期限は ms-Mcs-AdmPwdExpirationTime)に保存するのに対し、2023年4月にOS統合されたWindows LAPSは平文JSONの msLAPS-Password、またはDPAPI-NG(AES-256)で暗号化した msLAPS-EncryptedPassword に保存する。これらはスキーマ上の機密属性(searchFlagsのCONFIDENTIALビット)であり通常の読取権では読めず、対象属性への制御アクセス権(CONTROL_ACCESS。All Extended Rights も同等の読取効果を持つ)が必要となる。BloodHoundはこの経路をReadLAPSPasswordエッジとして表現する。攻撃者はこの読取権限を持つプリンシパルのDACL悪用を狙うため、権限委任の棚卸しが監視上重要である。",
    "points": [
      "旧LAPS属性: ms-Mcs-AdmPwd(平文)/ ms-Mcs-AdmPwdExpirationTime",
      "Windows LAPS属性: msLAPS-Password(平文JSON)/ msLAPS-EncryptedPassword(DPAPI-NG AES-256)",
      "機密属性のため読取には CONTROL_ACCESS(またはAll Extended Rights)が必要",
      "BloodHoundのReadLAPSPasswordエッジや過剰な委任が攻撃経路になる"
    ],
    "related": [
      "computerobj",
      "dpapi",
      "extendedrights",
      "dacl",
      "pth"
    ]
  },
  {
    "id": "privgroups",
    "term": "特権ビルトイングループ",
    "en": "Privileged Built-in Groups",
    "aka": "Backup Operators, Server Operators, Account Operators, Print Operators, DnsAdmins, Key Admins",
    "cat": "objects",
    "body": "特権ビルトイングループとは、Domain Admins以外にも実質的にドメイン侵害へ直結しうる既定の組み込みグループ群を指し、SOC/レッドチームが監視・悪用対象とする。代表例としてBackup Operators(SeBackupPrivilege/SeRestorePrivilegeでntds.ditやSAMを窃取可能)、Server Operators(サービスのバイナリパス改変でSYSTEM実行)、Account Operators、Print Operators(SeLoadDriverPrivilege)、DnsAdmins(dnscmdのServerLevelPluginDllで任意DLLをDNSサービス=NT AUTHORITY\\SYSTEMとしてロードしDCでコード実行)、Key Admins/Enterprise Key Admins(msDS-KeyCredentialLink書込でシャドウクレデンシャル付与)がある。これらの多くは既定でメンバーが少ないため、追加は強い侵害指標(IoC)となる。Backup/Server/Account/Print OperatorsはAdminSDHolderで保護される保護グループだが、DnsAdminsやKey AdminsはAdminSDHolder保護対象外である点に注意が必要である。",
    "points": [
      "Backup Operators → SeBackupPrivilege/SeRestorePrivilegeでntds.dit奪取",
      "DnsAdmins → ServerLevelPluginDll経由でDC上にSYSTEM DLLロード",
      "Key Admins/Enterprise Key Admins → msDS-KeyCredentialLink書込(シャドウクレデンシャル)",
      "Operators系4グループはAdminSDHolder保護対象、DnsAdmins/Key Adminsは対象外"
    ],
    "related": [
      "abusableprivs",
      "adminsdholder",
      "keycredlink",
      "ntds",
      "service"
    ]
  },
  {
    "id": "keycredlink",
    "term": "msDS-KeyCredentialLink / キートラスト",
    "en": "msDS-KeyCredentialLink / Key Trust",
    "aka": "Shadow Credentials,KeyCredential,NGC key,Whisker",
    "cat": "objects",
    "body": "msDS-KeyCredentialLinkは、ユーザーやコンピュータオブジェクトに紐づく公開鍵資格情報(KeyCredential、Windows Hello for Business/NGCのキートラスト用公開鍵)を格納する多値属性である。値はDN-Binary形式(LDAPでは B:<長さ>:<16進>:<DN> の書式)で、KEYCREDENTIALLINK_BLOB構造(バージョン0x00000200)としてDeviceID(GUID)、公開鍵素材(RSA/RawKeyMaterial)、KeyHash、作成日時等をエントリ単位で保持する。この属性への書込権限(GenericWrite/GenericAll等)を得た攻撃者は、自ら生成した鍵ペアの公開鍵を追加することで、対象プリンシパルとしてPKINITによるKerberos事前認証を行いTGTを取得できる。さらにPACに含まれるNTLMハッシュを復元するUnPAC-the-hashにより、パスワードを変更せずにNTハッシュを窃取できるため、ステルス性の高い乗っ取り・永続化手法(シャドウクレデンシャル)となる。検知は本属性への書込を捉えるSecurity Event ID 5136(ディレクトリオブジェクト変更、AttributeLDAPDisplayName=msDS-KeyCredentialLink)が中核だが、ユーザーオブジェクトはDirectory Service Changes監査だけでは記録されず、対象OUにSACLを設定する必要がある点に注意する。正当な書込元はKey Admins/Enterprise Key Admins/Domain Admins、および同期用のAzure AD Connect/AD FSサービスアカウントに限られるため、それ以外のプリンシパルによる変更を異常として相関検知するのが実務上の要となる。",
    "points": [
      "キートラスト(PKINIT)用の公開鍵を格納する多値属性。値はDN-Binary(B:<len>:<hex>:<DN>)、KEYCREDENTIALLINK_BLOB(ver 0x200)にDeviceID(GUID)/公開鍵/KeyHashを保持",
      "書込権限(GenericWrite/GenericAll)→ シャドウクレデンシャル → PKINITで認証",
      "UnPAC-the-hashでNTハッシュも復元可能、パスワード変更不要",
      "検知: Security Event ID 5136(AttributeLDAPDisplayName=msDS-KeyCredentialLink)。ユーザーオブジェクトはSACL設定が必須、値はB:828…パターン",
      "正当な書込元はKey Admins/Enterprise Key Admins/Domain Admins・AD Connect/AD FSのみ→他プリンシパルの変更を相関検知",
      "ツール: Whisker / pyWhisker / DSInternals(Get-ADKeyCredential) / Certipy(shadow)"
    ],
    "related": [
      "shadowcred",
      "pkinit",
      "whfb",
      "dacl",
      "kerberos"
    ]
  },
  {
    "id": "gpp",
    "term": "グループポリシー基本設定 (GPP) cpassword",
    "en": "Group Policy Preferences cpassword",
    "aka": "GPP, cpassword, Groups.xml",
    "cat": "objects",
    "body": "グループポリシー基本設定(GPP)のcpasswordは、GPOでローカルユーザー作成・パスワード設定・スケジュールタスク・サービス等を構成する際、SYSVOL上のXMLファイル(Groups.xml、Services.xml、ScheduledTasks.xml等)にパスワードをAES-256で暗号化して埋め込む cpassword 属性を指す。ところがMicrosoftが復号に必要なAES鍵(4e9906e8fcb66cc9faf49310620ffee8f496e806cc057990209b09a433b66c1b、IVはゼロ)をMSDN上で公開していたため、SYSVOLに読取権を持つ全ドメインユーザーが平文パスワードを容易に復元できる脆弱性となった。MS14-025(KB2962486、2014年5月)で新規作成は防止されたが、既存のXMLはSYSVOLに残存するため今も探索対象となる。MITRE ATT&CK T1552.006に該当し、Get-GPPPassword(PowerSploit)やgpp-decrypt、CrackMapExec/NetExecで自動収集される。",
    "points": [
      "公開済みAES鍵: 4e9906e8fcb66cc9faf49310620ffee8f496e806cc057990209b09a433b66c1b(IV=null)",
      "保存場所: SYSVOL内のGroups.xml等、cpassword属性(全ドメインユーザーが読取可能)",
      "MS14-025(KB2962486)で新規作成のみ防止、既存XMLは要手動削除",
      "MITRE T1552.006、ツール: Get-GPPPassword / gpp-decrypt / NetExec"
    ],
    "related": [
      "gpo",
      "sysvol",
      "creddump",
      "passwordspray",
      "dcsync"
    ]
  },
  {
    "id": "fsp",
    "term": "Foreign Security Principal (FSP)",
    "en": "Foreign Security Principal",
    "aka": "FSP, 外部プリンシパル",
    "cat": "objects",
    "body": "Foreign Security Principal(FSP、外部セキュリティプリンシパル)とは、信頼関係にある別ドメインやフォレストのセキュリティプリンシパルを、自ドメインのドメインローカルグループのメンバー等として参照するためのプレースホルダオブジェクトである。各ドメインの CN=ForeignSecurityPrincipals コンテナに、外部プリンシパルのSIDを名前とする objectClass=foreignSecurityPrincipal オブジェクトとして自動生成される。信頼をまたいだアクセス権付与の実体であり、SOCにとってはフォレスト間の権限流入経路や、SIDフィルタリング/SID履歴悪用による特権昇格の分析上、重要な列挙対象となる。よく知られたSID(Authenticated Users等)を持つ組み込みFSPも存在する。",
    "points": [
      "格納場所: CN=ForeignSecurityPrincipals コンテナ",
      "objectClass=foreignSecurityPrincipal、名前は外部プリンシパルのSID",
      "信頼をまたぐグループメンバーシップの実体(主にドメインローカルグループ)",
      "SIDフィルタリング/SID履歴悪用やクロスフォレスト権限分析で重要"
    ],
    "related": [
      "trust",
      "sid",
      "sidhistory",
      "sidfiltering",
      "group"
    ]
  },
  {
    "id": "kerbfast",
    "term": "Kerberos FAST / アーマリング",
    "en": "Kerberos FAST / Armoring",
    "aka": "FAST,Flexible Authentication Secure Tunneling,Kerberos Armoring",
    "cat": "auth",
    "body": "Kerberos FAST(Flexible Authentication Secure Tunneling、Kerberosアーマリング)は、RFC 6113で定義される事前認証拡張で、クライアントとKDC間にアーマー鍵で暗号化・完全性保護されたトンネルを構築する。アーマー鍵はマシンのTGTを用いた FX_FAST_ARMOR_AP_REQUEST、または匿名PKINITで得た匿名TGTから導出され、AS-REQ/AS-REP内の事前認証データを保護しKDCエラーにも署名する。これにより事前認証情報の暗号化でオフライン辞書攻撃を、KDCエラー署名でダウングレード等の改竄を緩和し、AS-REPロースティング・AS-REQロースティング(CVE-2022-33679)・ブラインドKerberoastを困難にする。ただし正規の認証済みユーザーが行う通常のKerberoastは、サービスチケットがサービスアカウント鍵で暗号化される点は変わらず、攻撃者自身がアーマー鍵を保持するため、FASTだけでは防げない点に注意が必要である。Windowsでは「Support Dynamic Access Control and Kerberos armoring」等のGPOで有効化し、レルム全体での強制には全DCとクライアントの対応が前提となる。",
    "points": [
      "RFC 6113で定義、クライアント-KDC間に保護トンネルを構築",
      "アーマー鍵の起点: マシンTGT(FX_FAST_ARMOR_AP_REQUEST)または匿名PKINIT",
      "AS-REP/AS-REQ Roast・ブラインドKerberoast・KDCエラー改竄を緩和",
      "通常の認証済みKerberoast(STはサービス鍵で暗号化)はFASTでは防げない",
      "GPO「Support Dynamic Access Control and Kerberos armoring」で有効化、要DC/クライアント対応"
    ],
    "related": [
      "kerberos",
      "preauth",
      "asreproast",
      "kerberoast",
      "protectedusers"
    ]
  },
  {
    "id": "pacvalidation",
    "term": "PAC 検証",
    "en": "PAC Validation",
    "aka": "PAC verification,S4U2Self PAC,KDC signature,PAC signatures",
    "cat": "auth",
    "body": "PAC検証とは、Kerberosチケットに含まれる特権属性証明書(PAC)の署名を検証し、グループSID等の認可情報が改竄されていないことを保証する処理である。従来PACにはサービスアカウント鍵によるサーバ署名と、krbtgt鍵によるKDC署名の2種が含まれた。その後、CVE-2020-17049(Bronze Bit)対策としてKB4598347(2020年11月)でチケット署名(krbtgt鍵)が、CVE-2022-37967対策としてKB5020805(2022年11月)で拡張KDC署名が追加された。MS14-068(CVE-2014-6324)は、KDCがキー付きでないチェックサム(MD5等)で署名されたPACまで受理していた実装欠陥を突き、秘密鍵なしにDomain Admins所属を主張するPACを偽造できた事例で、PAC検証の重要性を示した。サービス側はS4U2Self/KERB_VERIFY_PACでDCにPAC検証を依頼でき、CVE-2021-42287(KB5008380)ではPACへのrequestor(要求元)SID埋め込み等で偽造検知が強化された。",
    "points": [
      "従来のPAC署名: サーバ署名(サービス鍵)/ KDC署名(krbtgt鍵)の2種",
      "チケット署名: KB4598347(2020/11、CVE-2020-17049 Bronze Bit)で追加",
      "拡張KDC署名: KB5020805(2022/11、CVE-2022-37967)で追加",
      "MS14-068(CVE-2014-6324): 非キー付きチェックサム受理でPAC偽造",
      "CVE-2021-42287(KB5008380)でrequestor SID埋め込み等、偽造検知強化"
    ],
    "related": [
      "pac",
      "kerberos",
      "krbtgt",
      "kdc",
      "goldenticket"
    ]
  },
  {
    "id": "epa",
    "term": "チャネルバインディング / EPA",
    "en": "Channel Binding / EPA",
    "aka": "EPA,CBT,channel binding token,tls channel binding",
    "cat": "auth",
    "body": "Extended Protection for Authentication(EPA、チャネルバインディング)は、NTLMやKerberos認証を外側のTLSチャネルに結び付けることで、TLS終端をまたぐNTLMリレー攻撃を無力化する防御機構である。TLSがある場合はサーバ証明書から導出したチャネルバインディングトークン(CBT、tls-server-end-point)を、TLSがない場合はサービスプリンシパル名(SPN)によるサービスバインディングを認証情報に含めて検証する。これにより、SMB署名等が使えないLDAPS・HTTPS(Exchange、AD CSのWeb登録)へのリレーを緩和し、攻撃者は正規のCBTを生成できないためリレーが失敗する。なおWindows Server 2025ではLDAP署名が既定で要求されるようになった一方、LDAPチャネルバインディングの既定は従来どおり「サポートされている場合(When supported)」で強制ではなく、監査が既定で有効化される点に注意が必要である。EPAはNTLMリレー対策のベストプラクティスとして推奨される。",
    "points": [
      "認証をTLSチャネルに束縛し、TLS終端をまたぐNTLMリレーを阻止",
      "バインド手段: チャネルバインディング(CBT, tls-server-end-point)/ サービスバインディング(SPN)",
      "主対象: LDAPS、HTTPS(Exchange、AD CS Web登録)等の署名非対応サービス",
      "Server 2025は既定でLDAP署名を要求、チャネルバインディングは既定「When supported」(強制でなく監査既定有効)"
    ],
    "related": [
      "ntlmrelay",
      "ntlm",
      "smbsigning",
      "ldap",
      "adcs",
      "ntlmmic"
    ]
  },
  {
    "id": "wdigest",
    "term": "WDigest",
    "en": "WDigest",
    "aka": "UseLogonCredential, 平文資格情報キャッシュ",
    "cat": "auth",
    "body": "WDigestはHTTPダイジェスト認証などに用いられるWindowsのSSPパッケージで、かつてはSSO実現のためにLSASSメモリ内にユーザーの平文パスワードをキャッシュしていた。この平文キャッシュはWindows 8.1/Server 2012 R2以降では既定で無効化された(旧OSではKB2871997でUseLogonCredentialレジストリ制御が追加されたものの、既定値はキャッシュ有効のままで、無効化には明示的に0設定が必要)。逆にレジストリ HKLM\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\WDigest\\UseLogonCredential を1に設定すると再び平文をキャッシュするようになる。攻撃者はこの値を有効化してからログオンを待ち、Mimikatzの sekurlsa::wdigest でLSASSから平文資格情報を直接窃取する。UseLogonCredential=1へのレジストリ改変は資格情報窃取の前兆として監視すべき重要なIoCである。",
    "points": [
      "レジストリ: HKLM\\...\\SecurityProviders\\WDigest\\UseLogonCredential=1 で平文キャッシュ復活",
      "Windows 8.1/Server 2012 R2以降は既定無効。旧OSはKB2871997でUseLogonCredential制御を追加(既定はキャッシュ有効のまま、0設定で無効化)",
      "Mimikatz sekurlsa::wdigest で平文パスワードを抽出",
      "UseLogonCredentialの1設定はSysmon Event ID 13(レジストリ値設定)等で検知可能",
      "MITRE ATT&CK: T1003.001 (LSASS Memory), T1112 (Modify Registry)"
    ],
    "related": [
      "lsass",
      "registry",
      "creddump",
      "sspi",
      "credguard"
    ]
  },
  {
    "id": "whfb",
    "term": "Windows Hello for Business",
    "en": "Windows Hello for Business (WHfB)",
    "aka": "WHfB,NGC,cloud Kerberos trust,key trust",
    "cat": "auth",
    "body": "Windows Hello for Business(WHfB、内部名NGC/Next Generation Credentials)はパスワードを非対称鍵ペアに置き換える資格情報方式で、秘密鍵はTPM内に保護され、PINや生体認証でローカルにアンロックされる。デプロイ形態にはkey trust(公開鍵をユーザーのmsDS-KeyCredentialLink属性に登録)、certificate trust(証明書ベース)、cloud Kerberos trust(Entra ID Kerberosを利用)があり、認証時はKDCが登録済み公開鍵に対応するPKINIT類似の処理でTGTを発行する。攻撃観点では、書き込み権限を悪用してmsDS-KeyCredentialLinkに攻撃者の鍵を注入するShadow Credentials攻撃(Whisker/pyWhisker)が代表的な悪用手法であり、対象アカウントとして認証可能になる。フィッシング耐性のある強力な認証だが、鍵の登録属性への書き込み権限管理が防御上の要となる。",
    "points": [
      "内部名NGC、秘密鍵はTPMに格納しPIN/生体でアンロック",
      "key trustは公開鍵をmsDS-KeyCredentialLinkに登録しPKINITでTGT取得",
      "cloud Kerberos trustはEntra ID Kerberosを利用しオンプレ証明書不要",
      "悪用: Shadow Credentials(msDS-KeyCredentialLink注入)- Whisker/pyWhisker",
      "フィッシング耐性MFAだが鍵登録属性の書き込み権限が攻撃面"
    ],
    "related": [
      "keycredlink",
      "shadowcred",
      "pkinit",
      "kerberos",
      "tgt"
    ]
  },
  {
    "id": "sidext",
    "term": "証明書のSIDセキュリティ拡張",
    "en": "Certificate SID Security Extension",
    "aka": "szOID_NTDS_CA_SECURITY_EXT,OID 1.3.6.1.4.1.311.25.2,strong certificate mapping",
    "cat": "pki",
    "body": "証明書のSIDセキュリティ拡張(szOID_NTDS_CA_SECURITY_EXT、OID 1.3.6.1.4.1.311.25.2)は、証明書に対象アカウントのobjectSid(SID)を埋め込む非クリティカルなX.509拡張である。KB5014754(2022年5月)以降、エンタープライズCAはオンラインテンプレートで発行する証明書に既定でこの拡張を付与し、DCは証明書ベース認証時にこのSIDが認証しようとするアカウントのSIDと一致することを検証する「強いマッピング」を行う。この仕組みはUPN等に依存する弱いマッピングを悪用したESC9/ESC10やUPN偽装(証明書なりすまし)攻撃への対策である。Full Enforcementは2025年2月に既定化され、さらに2025年9月9日の更新でStrongCertificateBindingEnforcementレジストリによる互換モードへの緩和自体が廃止され、強制適用が確定した。SOC分析ではAD CS悪用検知の文脈でこの拡張の有無と強制モードの状態が重要である。",
    "points": [
      "OID 1.3.6.1.4.1.311.25.2 = szOID_NTDS_CA_SECURITY_EXT、証明書にobjectSidを埋込",
      "KB5014754(2022年5月)でCAが既定付与、DCが強いマッピングで検証",
      "ESC9/ESC10やUPN偽装によるなりすまし対策",
      "2025年9月9日以降 StrongCertificateBindingEnforcement による緩和は不可(強制適用)",
      "弱いマッピングはUPN等に依存し偽装可能なため非推奨"
    ],
    "related": [
      "adcs",
      "certmapping",
      "altsecid",
      "pkinit",
      "goldencert"
    ]
  },
  {
    "id": "altsecid",
    "term": "altSecurityIdentities (明示的証明書マッピング)",
    "en": "altSecurityIdentities",
    "aka": "Explicit Certificate Mapping",
    "cat": "pki",
    "body": "altSecurityIdentitiesはADアカウント(ユーザー/コンピュータ)に手動で証明書を紐付けるための多値属性で、証明書ベース認証における「明示的マッピング」を実現する。マッピングにはX509IssuerSerialNumber・X509SKI・X509SHA1PublicKeyの3つの強いマッピングと、X509IssuerSubject・X509SubjectOnly・X509RFC822(メール)の3つの弱いマッピングがあり、弱い形式は証明書のSubject/メール等を偽装できるため危険とされる。なおCVE-2025-26647では、発行CAがNTAuthストア外でも(信頼はされていれば)SKIマッピングでKDCが認証を通してしまう問題が判明し、X509SKIは実質的に弱いマッピングとして扱うべきと見直された。KB5014754の強制適用後、弱いマッピングでは認証が失敗するため、X509IssuerSerialNumberなど発行者名+シリアル番号による強いマッピングが推奨される。攻撃者がこの属性への書き込み権限を得ると、自ら制御する証明書を特権アカウントに紐付けてなりすませるため、書き込み権限とマッピング形式の両方が監査対象となる。",
    "points": [
      "明示的証明書マッピング用の多値属性(手動紐付け)",
      "強いマッピング: X509IssuerSerialNumber / X509SKI / X509SHA1PublicKey",
      "弱いマッピング: X509IssuerSubject / X509SubjectOnly / X509RFC822(偽装可能)",
      "CVE-2025-26647でSKIマッピングはNTAuth外CAで悪用可、実質弱いマッピング扱い",
      "属性書き込み権限の悪用でなりすまし(証明書ベース権限昇格)"
    ],
    "related": [
      "sidext",
      "certmapping",
      "adcs",
      "pki",
      "pkinit"
    ]
  },
  {
    "id": "adfs",
    "term": "ADFS",
    "en": "Active Directory Federation Services",
    "aka": "ADFS,token-signing certificate,claims provider",
    "cat": "cloud",
    "body": "Active Directory Federation Services(ADFS)はオンプレADの認証をSAML/WS-Federation/OAuthで外部サービスへ橋渡しするIdPで、発行するSAMLトークンをtoken-signing証明書の秘密鍵で署名する。このtoken-signing証明書とtoken-decryption証明書はADFS構成DBに暗号化保存され、その復号に使うDKM(Distributed Key Management)マスターキーはAD内の CN=ADFS,CN=Microsoft,CN=Program Data,DC=… コンテナ配下のグループ内contactオブジェクトの thumbnailPhoto 属性に格納される。攻撃者がDA権限やDRS(ディレクトリ複製)でこのDKM鍵を読み出しtoken-signing証明書を復号・エクスポートすると、任意ユーザー・任意クレーム(MFA/CAP済みを含む)を主張する有効なSAMLトークンを自由に偽造できる。これがGolden SAML攻撃(AADInternals/ADFSDump/ADFSpoofで実行、SolarWinds事件で悪用)で、パスワードやMFAを回避してMicrosoft 365等へ永続的になりすませる。SOCはDKMコンテナへのアクセス(SACL+Event 4662)、ADFS Adminログのトークン発行(Event 1200)、ADFSサービスアカウントの異常利用を重点監視すべきである。",
    "points": [
      "SAMLトークンをtoken-signing証明書の秘密鍵で署名するオンプレIdP(T1606.002 SAML Tokens)",
      "復号鍵DKMマスターキーの格納先: CN=ADFS,CN=Microsoft,CN=Program Data 配下 contactオブジェクトの thumbnailPhoto 属性",
      "Golden SAML: DKM鍵→token-signing証明書窃取で任意トークン偽造(MFA/CAP回避・失効しにくい永続化)",
      "実行ツール: AADInternals、ADFSDump/ADFSpoof。SolarWinds事件で悪用",
      "監視: DKMコンテナのSACL監査(Event 4662)、ADFS Admin Event 1200(トークン発行)、DRS複製の異常"
    ],
    "related": [
      "goldensaml",
      "saml",
      "pki",
      "entra",
      "condaccess",
      "hybridauth"
    ]
  },
  {
    "id": "seamlesssso",
    "term": "Seamless SSO (AZUREADSSOACC$)",
    "en": "Seamless SSO",
    "aka": "Desktop SSO,AZUREADSSOACC,seamless single sign-on",
    "cat": "cloud",
    "body": "Seamless SSO(Desktop SSO)はEntra Connectの機能で、社内ドメイン参加端末からEntra IDリソースへパスワード再入力なしでサインインさせる仕組みである。各ADフォレストに作成されるAZUREADSSOACC$というコンピュータアカウントがEntra IDを代理し、端末はオンプレDCから該当SPN向けのKerberosサービスチケットを取得、Entra IDが共有するAZUREADSSOACC$のKerberos鍵で復号して認証を成立させる。この鍵(NTハッシュ)が漏洩すると、攻撃者はSilver Ticketを偽造して任意ユーザーとしてEntra IDへ認証できてしまう。AZUREADSSOACC$のパスワードは自動ローテーションされないため、Update-AzureADSSOForestで少なくとも30日ごとの手動ローテーションがMicrosoft推奨であり、この鍵の管理がクラウド境界の重要な防御点となる。",
    "points": [
      "AZUREADSSOACC$コンピュータアカウントがEntra IDを代理",
      "KerberosチケットをAZUREADSSOACC$鍵で復号しSSO成立",
      "鍵漏洩でSilver Ticket偽造→任意ユーザーとしてEntra ID認証可能",
      "パスワード自動ローテーションなし→Update-AzureADSSOForestで30日毎推奨",
      "オンプレ侵害からクラウドへのピボット経路"
    ],
    "related": [
      "entraconnect",
      "silverticket",
      "kerberos",
      "entra",
      "nthash"
    ]
  },
  {
    "id": "devicecode",
    "term": "デバイスコードフィッシング",
    "en": "Device Code Phishing",
    "aka": "Device Code Flow Abuse",
    "cat": "cloud",
    "body": "デバイスコードフィッシングは、OAuth 2.0のデバイス認可グラント(入力制約のあるデバイス向けフロー)を悪用する攻撃手法である。攻撃者はまず正規client_idで/devicecodeエンドポイントにリクエストし、user_code・device_code・verification_uri(microsoft.com/devicelogin)・有効期限(通常約15分)を取得する。次に「このコードを入力して認証してください」と偽り被害者をMicrosoftの正規ページへ誘導、被害者がuser_codeを入力・承認した瞬間、攻撃者が/tokenエンドポイントへポーリングしていたループが成功しaccess_tokenとrefresh_tokenを受け取る。ルックアライクドメインも認証情報入力フォームも存在せず正規のMicrosoftページのみが使われるためMFA/条件付きアクセスを迂回しやすく従来のフィッシング検知が効きにくい。",
    "points": [
      "OAuthデバイス認可グラント(RFC 8628)の悪用",
      "攻撃者が/devicecodeでuser_code/device_code/verification_uri取得(約15分有効)",
      "被害者がmicrosoft.com/deviceloginでコード承認→攻撃者がトークン取得",
      "refresh_token取得でMFA/条件付きアクセスを迂回し永続アクセス",
      "MITRE ATT&CK: T1528、正規ドメインのみで検知困難"
    ],
    "related": [
      "oauth",
      "tokens",
      "condaccess",
      "illicitconsent",
      "aitm"
    ]
  },
  {
    "id": "illicitconsent",
    "term": "不正な同意付与",
    "en": "Illicit Consent Grant",
    "aka": "OAuth Consent Phishing, Illicit Grant",
    "cat": "cloud",
    "body": "不正な同意付与(OAuth同意フィッシング)は、攻撃者が用意した悪意あるOAuthアプリケーションへ、被害者自身に委任アクセス許可(delegated permissions)を承認させてトークンを窃取する攻撃である。攻撃者はEntra IDにアプリを登録し、Mail.Read・Files.Read.All・offline_access等のスコープを要求する正規の同意画面へ被害者を誘導、被害者が「承認」をクリックするとアプリはrefresh_tokenを取得し、以後パスワードやMFAなしで被害者のメール・ファイル等へ継続的にアクセスできる。認証情報を盗まないためパスワード変更では失効せず、テナントに登録されたアプリのサービスプリンシパルが永続化の足場となる点が特徴である。防御としては管理者同意ワークフローの強制、ユーザー同意の制限、Entraサインイン/監査ログでの不審なアプリ許諾の監視が有効である。",
    "points": [
      "悪意あるOAuthアプリへ委任アクセス許可をユーザーに承認させる",
      "offline_accessでrefresh_token取得→パスワード/MFA不要の永続アクセス",
      "認証情報を盗まないためパスワード変更で失効しない",
      "MITRE ATT&CK: T1528 (Steal Application Access Token)",
      "対策: ユーザー同意制限・管理者同意ワークフロー・監査ログ監視"
    ],
    "related": [
      "oauth",
      "tokens",
      "devicecode",
      "sp",
      "entralogs"
    ]
  },
  {
    "id": "aitm",
    "term": "AiTM フィッシング",
    "en": "Adversary-in-the-Middle Phishing",
    "aka": "AiTM, リバースプロキシフィッシング, セッショントークン窃取",
    "cat": "cloud",
    "body": "AiTM(Adversary-in-the-Middle)フィッシングは、攻撃者が制御するリバースプロキシ(Evilginx、EvilProxy等)を正規サイトと被害者の間に挟み、認証情報だけでなくMFA完了後に発行されるセッションCookie/トークンをリアルタイムに窃取する手法である。プロキシが本物のログインページを中継するため被害者は正規のMFAを実際に完了させてしまい、攻撃者は盗んだセッションCookie(EntraのESTSAUTH等)を自身のブラウザにインポートすることで、MFAを再要求されずにサインイン済みセッションを乗っ取れる。パスワードリセットやMFA再登録では既存の窃取セッションを止められず、盗まれたセッションの失効と条件付きアクセス(デバイス準拠・フィッシング耐性MFA)による対策が必要となる。",
    "points": [
      "MFAをバイパスする点が旧来のフィッシングとの決定的な違い(認証後のセッションCookie/トークンを盗む)",
      "代表ツール: Evilginx、EvilProxy、Muraena。フィッシングキット化されPhaaSとして流通",
      "MITRE ATT&CK: T1557(Adversary-in-the-Middle)、T1539(Steal Web Session Cookie)、T1550.004(Web Session Cookie)",
      "対策: FIDO2/パスキー等のフィッシング耐性MFA、条件付きアクセスのデバイス準拠、トークン保護(Token Protection)"
    ],
    "related": [
      "tokentheft",
      "tokens",
      "prt",
      "condaccess",
      "entralogs",
      "phishing",
      "emailauth"
    ]
  },
  {
    "id": "imds",
    "term": "マネージドID / IMDS",
    "en": "Managed Identity / IMDS",
    "aka": "Managed Identity,IMDS,169.254.169.254,metadata endpoint",
    "cat": "cloud",
    "body": "IMDS(Instance Metadata Service)はクラウドVM内部からのみ到達可能なリンクローカルアドレス169.254.169.254で動作するメタデータエンドポイントで、Azureではこの経由でVMに割り当てられたマネージドID(Managed Identity)のOAuthアクセストークンを取得できる。攻撃者がVM上でSSRFやコード実行を得ると、このエンドポイントに問い合わせてマネージドIDのトークンを窃取し、そのIDに付与されたAzureロール権限でクラウドリソースへ横展開できる。Azure IMDSは全リクエストに Metadata:true ヘッダを要求するため、ヘッダを付与できない単純なSSRFは緩和されるが、権限過剰なマネージドIDの割り当て自体が主要なリスクとなる(なおIMDSv1/v2という版管理はAWS固有の概念で、Azureには存在しない)。",
    "points": [
      "エンドポイント: 169.254.169.254(リンクローカル、VM外部からは到達不可)",
      "Azureは全リクエストに Metadata: true ヘッダを要求(単純なSSRF対策。AWSのIMDSv2トークンとは別方式)",
      "窃取されるのはマネージドIDのアクセストークン→そのIDのRBACロールで権限昇格/横展開",
      "MITRE ATT&CK: T1552.005(Cloud Instance Metadata API)。最小権限のロール割り当てが対策"
    ],
    "related": [
      "tokens",
      "oauth",
      "tenant",
      "entra",
      "tokentheft"
    ]
  },
  {
    "id": "pslogging",
    "term": "PowerShell ログ",
    "en": "PowerShell Logging (ScriptBlock / Module)",
    "aka": "Script Block Logging, Module Logging, PowerShell Transcription, Event 4104",
    "cat": "logging",
    "body": "PowerShellログはPowerShellの実行内容を可視化する監査機能群で、スクリプトブロックログ(Script Block Logging)、モジュールログ(Module Logging)、トランスクリプション(Transcription)から成る。スクリプトブロックログはMicrosoft-Windows-PowerShell/OperationalチャネルにイベントID4104で実行されたスクリプトブロックの完全なテキストを記録し、難読化されたコードも展開後の形で捕捉できるためSOC分析の要となる。モジュールログはイベントID4103でパイプライン単位のcmdlet呼び出しと引数を記録し、トランスクリプションはセッション全体の入出力をテキストファイルへ保存する。",
    "points": [
      "イベントID4104=スクリプトブロックログ(実行コード全文、難読化解除後も記録)",
      "イベントID4103=モジュールログ(cmdlet呼び出し・引数、より冗長)",
      "チャネル: Microsoft-Windows-PowerShell/Operational。GPOで有効化",
      "AMSIと併用され、悪性スクリプトはメモリ内で展開された時点で4104に記録される",
      "MITRE ATT&CK T1059.001(PowerShell)の主要検知源。攻撃者は削除やダウングレード(v2)で回避を試みる"
    ],
    "related": [
      "etw",
      "eventlog",
      "amsi",
      "sysmon",
      "wef"
    ]
  },
  {
    "id": "entralogs",
    "term": "Entra サインイン/監査ログ",
    "en": "Entra Sign-in & Audit Logs",
    "aka": "Sign-in logs, Audit logs, Unified Audit Log, Microsoft Purview audit",
    "cat": "logging",
    "body": "Entra(旧Azure AD)のサインインログと監査ログは、クラウドID基盤における認証・変更操作を記録するテレメトリで、SOCによるクラウド侵害検知の中核となる。サインインログには各認証イベントの結果、条件付きアクセスの評価結果、認証方法、IPアドレス、デバイス情報が含まれ、監査ログにはディレクトリの変更(アプリ登録、ロール付与、認証情報追加等)が記録される。これらはMicrosoft PurviewのUnified Audit Log(統合監査ログ)にも集約され、SIEMへ転送してAiTM後の異常サインインや不正な同意付与、権限昇格を追跡する。",
    "points": [
      "サインインログ: 認証結果、条件付きアクセス評価、IP/デバイス/認証方法を記録",
      "監査ログ: アプリ登録、ロール付与、資格情報(証明書/シークレット)追加等のディレクトリ変更",
      "Unified Audit Log(Purview)にExchange/SharePoint等も含め統合集約",
      "検知例: 不可能な移動、AiTM後のセッション再利用、Illicit Consent、Golden SAML兆候",
      "SIEM/Advanced Huntingへ連携。保持期間はライセンス依存"
    ],
    "related": [
      "entra",
      "tenant",
      "condaccess",
      "siem",
      "advhunting"
    ]
  },
  {
    "id": "creddump",
    "term": "認証情報ダンプ",
    "en": "OS Credential Dumping",
    "aka": "Credential Dumping, クレデンシャルダンプ",
    "cat": "prim",
    "body": "認証情報ダンプ(OS Credential Dumping)は、OSやメモリ、ディスク上に存在する認証情報(NTハッシュ、Kerberosチケット、平文パスワード、DPAPIマスターキー等)を抽出する攻撃技術の総称である。代表的にはLSASSプロセスのメモリからMimikatzやcomsvcs.dllのMiniDump、procdumpで資格情報を取り出す手法、SAM/SECURITYハイブからローカルアカウントハッシュやLSA Secretsを取り出す手法、NTDS.ditからドメイン全体のハッシュを取り出す手法がある。取得した資格情報はPass-the-Hash/Ticketやオフラインクラッキングによる横展開・権限昇格に直結する。",
    "points": [
      "主な対象: LSASSメモリ、SAM/SECURITYハイブ、NTDS.dit、DPAPI、LSA Secrets",
      "代表ツール: Mimikatz、procdump、comsvcs.dll MiniDump、secretsdump.py(Impacket)",
      "MITRE ATT&CK T1003(全体)、T1003.001(LSASS)、T1003.002(SAM)、T1003.003(NTDS)",
      "防御: Credential Guard、LSA Protection(PPL/RunAsPPL)、Protected Users、EDR/MDEのLSASSアクセス検知"
    ],
    "related": [
      "lsass",
      "sam",
      "ntds",
      "dpapi",
      "lsasecrets"
    ]
  },
  {
    "id": "pth",
    "term": "Pass-the-Hash (PtH)",
    "en": "Pass-the-Hash",
    "aka": "PtH, ハッシュの受け渡し",
    "cat": "prim",
    "body": "Pass-the-Hash(PtH)はNTLM認証がパスワードそのものではなくNTハッシュを用いてチャレンジレスポンスを生成する仕組みを悪用し、平文パスワードを知らずとも窃取したNTハッシュを直接提示して認証を成立させる横展開技術である。攻撃者はLSASSダンプ等で得たNTハッシュをMimikatzのsekurlsaやImpacketのwmiexec/psexec等に投入し、そのアカウントとしてリモートホストへSMB/WMI経由でアクセスする。ローカル管理者パスワードの使い回しがある環境では、単一ホスト侵害から広範なネットワーク制圧に至る主要経路となる。",
    "points": [
      "NTLMがNTハッシュを鍵として認証する仕様を悪用(平文パスワード不要)",
      "対象はRC4ベースのNTハッシュ。Kerberosの相当技術はOverpass-the-Hash/PtT",
      "代表ツール: Mimikatz(sekurlsa::pth)、Impacket(psexec/wmiexec)、NetExec(旧CrackMapExec)",
      "MITRE ATT&CK: T1550.002。ローカル管理者PW使い回し(LAPS未導入)が拡大要因",
      "防御: LAPS、Protected Users、Credential Guard、ローカルアカウントのリモートUACトークンフィルタ"
    ],
    "related": [
      "nthash",
      "ntlm",
      "lsass",
      "creddump",
      "ptt",
      "remoteexec"
    ]
  },
  {
    "id": "overpass",
    "term": "Overpass-the-Hash / Pass-the-Key",
    "en": "Overpass-the-Hash / Pass-the-Key",
    "aka": "OPtH, PtK, NTハッシュ/AES鍵からTGT取得",
    "cat": "prim",
    "body": "Overpass-the-Hash（別名 Pass-the-Key）は、窃取したユーザーのNTハッシュまたはAES鍵を用いてKerberosのAS-REQを行い、正規のTGTを取得してKerberos認証へ横滑りする手口。平文パスワードを知らなくてもハッシュ/鍵さえあれば、NTLM（Pass-the-Hash）ではなくKerberosとして振る舞えるため、NTLM制限環境の回避やその後のPass-the-Ticketに繋がる。mimikatz の sekurlsa::pth や Rubeus asktgt（/rc4 か /aes256）で実装され、RC4指定ならNTハッシュそのものが鍵として使える。PtHとPtTの橋渡しとなる基礎概念。",
    "points": [
      "NTハッシュ(RC4)またはAES鍵でAS-REQ→正規TGTを取得し、Kerberosへ横滑り",
      "ツール: mimikatz sekurlsa::pth, Rubeus asktgt /rc4|/aes256",
      "RC4要求は 4768 の Ticket Encryption Type 0x17 として現れ、AES運用環境ではダウングレードの兆候",
      "MITRE ATT&CK T1550.002(Pass the Hash)周辺、後続は Pass-the-Ticket (T1550.003)"
    ],
    "related": [
      "pth",
      "ptt",
      "nthash",
      "etype",
      "kerberoast",
      "kerbsalt",
      "sessionkey"
    ]
  },
  {
    "id": "ptt",
    "term": "Pass-the-Ticket (PtT)",
    "en": "Pass-the-Ticket",
    "aka": "PtT, チケットの受け渡し",
    "cat": "prim",
    "body": "Pass-the-Ticket(PtT)は窃取または偽造したKerberosチケット(TGTまたはサービスチケットST)をログオンセッションに注入し、そのチケットが表す権限でリソースへアクセスする横展開技術である。攻撃者はMimikatz(sekurlsa::tickets、kerberos::ptt)やRubeusでメモリから.kirbi/ccache形式のチケットを抽出・注入し、パスワードやハッシュなしに認証を成立させる。TGTを盗めば任意のサービスチケットを新規取得でき、Golden Ticket(krbtgt鍵で偽造したTGT)やSilver Ticket(サービスアカウント鍵で偽造したST)もPtTの一形態として注入される。",
    "points": [
      "対象はKerberosチケット(TGT/ST)。TGT注入で任意サービスへのST取得が可能",
      "代表ツール: Mimikatz(kerberos::ptt)、Rubeus(ptt)、Impacket(ccache/KRB5CCNAME)",
      "Golden/Silver Ticketの注入もPtTの一種",
      "MITRE ATT&CK: T1550.003",
      "防御: 短いチケット有効期限、krbtgtパスワードの定期2回ローテーション、異常TGT検知(MDI)"
    ],
    "related": [
      "kerberos",
      "tgt",
      "st",
      "goldenticket",
      "silverticket"
    ]
  },
  {
    "id": "passcert",
    "term": "Pass-the-Certificate",
    "en": "Pass-the-Certificate",
    "aka": "PKINIT/Schannel認証, 証明書の受け渡し",
    "cat": "prim",
    "body": "Pass-the-Certificate は窃取したX.509証明書とその秘密鍵を用いてドメイン認証を成立させる技術で、主にKerberosのPKINIT拡張でTGTを要求する経路と、Schannel(TLSクライアント認証)でLDAP等へ認証する経路がある。PKINITではRubeus asktgt /certificate やCertipyでPFXからTGTを取得し、そのままPass-the-Ticketへ連鎖できる。DCがSmart Card Logon EKUを持たずPKINIT非対応の場合でも、PassTheCertやCertipyでSchannel経由でLDAP/Sに認証でき、Schannel証明書認証はTLSチャネル自体が認証となるためLDAPチャネルバインディング有効環境でも成立する点が特徴である。",
    "points": [
      "2経路: PKINIT(TGT取得)とSchannel/TLSクライアント認証(LDAP/S等)",
      "代表ツール: Rubeus(asktgt /certificate)、Certipy、PassTheCert(AlmondOffSec)",
      "ESC1等のAD CS悪用で不正発行した証明書を悪用する連鎖が典型",
      "証明書はパスワードポリシー/MFA/ロックアウトを迂回し有効期間が長い(数ヶ月〜年)",
      "PKINIT成功後はUnPAC-the-HashでNTハッシュ取得も可能。ShadowCredentialsとも連鎖"
    ],
    "related": [
      "pkinit",
      "adcs",
      "certmapping",
      "ptt",
      "shadowcred"
    ]
  },
  {
    "id": "dcsync",
    "term": "DCSync",
    "en": "DCSync",
    "aka": "Directory Replication Attack, DRSUAPI GetNCChanges",
    "cat": "prim",
    "body": "DCSyncは、正規のドメインコントローラー間レプリケーションを悪用し、DCになりすましてアカウントの資格情報を窃取する攻撃手法である。MS-DRSR (Directory Replication Service Remote Protocol) のDRSUAPI経由でIDL_DRSGetNCChanges (DsGetNCChanges) 操作をRPC要求として送信し、unicodePwd/NTハッシュ・supplementalCredentials(Kerberos鍵)・過去パスワード履歴をレプリケーションデータとして取得する。NTDS.ditファイルを直接読む必要がなく、DC上でコードを実行せずリモートから実行できる点が特徴で、krbtgtハッシュを抜けばGolden Ticket作成につながる。実行にはドメイン(ネーミングコンテキスト)オブジェクトへのDS-Replication-Get-Changes / DS-Replication-Get-Changes-All 拡張権を要し、既定ではDomain Controllers・Domain Admins・Enterprise Admins等が保持する。",
    "points": [
      "MITRE ATT&CK: T1003.006 (OS Credential Dumping: DCSync)",
      "必要な拡張権GUID: DS-Replication-Get-Changes 1131f6aa-9c07-11d1-f79f-00c04fc2dcd2 / DS-Replication-Get-Changes-All 1131f6ad-9c07-11d1-f79f-00c04fc2dcd2",
      "代表ツール: mimikatz lsadump::dcsync、Impacket secretsdump.py",
      "検知: DC以外の主体によるイベントID 4662(AccessMask 0x100=Control Access、PropertiesにレプリケーションGUIDが出現)",
      "対策: ドメインNCオブジェクトのDACL監査、非DCへの複製権付与の排除"
    ],
    "related": [
      "drsuapi",
      "replication",
      "krbtgt",
      "extendedrights",
      "goldenticket"
    ]
  },
  {
    "id": "goldenticket",
    "term": "Golden Ticket",
    "en": "Golden Ticket",
    "aka": "偽造TGT",
    "cat": "prim",
    "body": "Golden Ticketは、krbtgtアカウントの鍵(NTハッシュまたはAES鍵)を入手した攻撃者が、KDCを介さずに任意の内容のTGT(チケット認可チケット)を偽造する攻撃である。TGTの暗号化とTGT内PAC署名にはkrbtgt鍵が用いられるため、これを知っていれば任意ユーザー・任意グループSID(例: Domain Admins RID 512)・長大な有効期間を持つTGTを自作でき、ドメイン内の全サービスへ実質無制限にアクセスできる。オフライン偽造のため事前認証や標的ユーザーのパスワード変更の影響を受けず、krbtgtパスワードを2回リセットしない限り無効化できない強力な永続化手段となる。検知面では、TGTがオフラインで偽造されるため先行するAS-REQ(イベント4768)が存在せず、対応する4768を伴わないTGS-REQ(4769)として観測される点が要となる。加えて4769のTicket Encryption Typeが0x17(AES運用環境でのRC4ダウングレード)や存在しない/不整合なアカウント名が異常兆候となり、さらにドメインの最大チケット有効期間を超える利用・更新(mimikatz既定は約10年。ただし有効期間自体は4769に記録されない)も手掛かりとなるが、実TGTを改変するDiamond Ticketはこの「4768無しの4769」ヒューリスティックを回避する。",
    "points": [
      "MITRE ATT&CK: T1558.001。偽造対象はTGT、署名鍵はkrbtgtの鍵(RC4ならNTハッシュ、AES運用の擬装や検知回避にはAES256)",
      "PACに任意SID/SID History(例: Domain Admins RID 512)を埋め込み権限昇格、長大な有効期間で永続化",
      "検知: オフライン偽造のため先行するAS-REQ(4768)が無く、対応する4768を伴わないTGS-REQ(4769)として現れる",
      "検知: 4769のTicket Encryption Type 0x17(AES環境でのRC4ダウングレード)や存在しない/不整合なアカウント名。有効期間自体は4769に記録されないが、ポリシー超過の利用・更新は手掛かり(mimikatz既定は約10年)",
      "失効にはkrbtgtパスワードを短時間で連続2回リセット(レプリケーション反映を待って実施)",
      "代表ツール: mimikatz kerberos::golden、Impacket ticketer.py。実TGTを改変するDiamond Ticketは検知ヒューリスティックを回避"
    ],
    "related": [
      "krbtgt",
      "tgt",
      "pac",
      "kdc",
      "dcsync"
    ]
  },
  {
    "id": "silverticket",
    "term": "Silver Ticket",
    "en": "Silver Ticket",
    "aka": "偽造ST",
    "cat": "prim",
    "body": "Silver Ticketは、特定サービスアカウント(コンピューターアカウントやgMSA、SPN保有アカウント)の鍵を入手した攻撃者が、そのサービス向けのST(サービスチケット/TGS)を偽造する攻撃である。STはサービスアカウントの鍵で暗号化・署名されるため、KDCへの問い合わせなしに当該サービスに対してのみ有効なチケットを自作でき、CIFS/HOST/HTTP/MSSQLSvcなど狙ったサービスに直接アクセスできる。Golden Ticketと異なりKDCと通信しないため検知が難しく、サービス側でPAC検証(KDCへのPAC照会)が行われない従来構成では偽造PACも通りやすい。",
    "points": [
      "MITRE ATT&CK: T1558.002 (Steal or Forge Kerberos Tickets: Silver Ticket)",
      "偽造対象はST、署名鍵は標的サービスアカウントの鍵(コンピューター/gMSA/SPNアカウント)",
      "影響範囲は当該サービスとSPNに限定される",
      "KDCと通信しないためTGTベースの検知を回避しやすい",
      "対策: サービスアカウントの強力なパスワード/AES鍵、PAC検証強化(KB5008380系更新の適用)"
    ],
    "related": [
      "st",
      "spn",
      "pac",
      "machineacct",
      "goldenticket"
    ]
  },
  {
    "id": "kerberoast",
    "term": "Kerberoasting",
    "en": "Kerberoasting",
    "aka": "SPNロースト",
    "cat": "prim",
    "body": "Kerberoastingは、SPNが設定されたアカウント(多くはサービスアカウント)に対しKerberosのTGS-REQを発行し、返却されるST(TGS-REP)の暗号化部分をオフラインで総当たり解読してアカウントの平文パスワードを回復する攻撃である。STはサービスアカウントの鍵から派生した鍵で暗号化されるため、RC4-HMAC(etype 23/0x17)のチケットを狙えば弱いパスワードを効率的に解読できる。任意の認証済みドメインユーザーが実行可能で、標的サービスへの直接アクセスも管理者権限も不要な点が危険である。",
    "points": [
      "MITRE ATT&CK: T1558.003 (Steal or Forge Kerberos Tickets: Kerberoasting)",
      "狙われる暗号化: RC4-HMAC etype 23 (0x17) が解読容易、AES(etype 17/18)は高コスト",
      "代表ツール: Rubeus kerberoast、Impacket GetUserSPNs.py、hashcatモード13100(RC4)/19600・19700(AES)",
      "認証済み一般ユーザー権限のみで実行可能、標的サービスへの接続は不要",
      "対策: 長くランダムなパスワードやgMSA採用、RC4無効化、異常なTGS要求の監視"
    ],
    "related": [
      "spn",
      "st",
      "kerberos",
      "etype",
      "gmsa"
    ]
  },
  {
    "id": "asreproast",
    "term": "AS-REP Roasting",
    "en": "AS-REP Roasting",
    "aka": "事前認証無効ロースト",
    "cat": "prim",
    "body": "AS-REP Roastingは、Kerberos事前認証(pre-authentication)が無効化されたアカウントに対しAS-REQを送信し、返却されるAS-REPの暗号化部分をオフラインで解読してパスワードを回復する攻撃である。通常はAS-REQに含める暗号化タイムスタンプで事前認証を行うが、アカウント属性userAccountControlのDONT_REQ_PREAUTHフラグが立っていると鍵を知らなくてもAS-REPを取得でき、その暗号化ブロックはユーザーパスワード由来の鍵で暗号化されているため解読対象となる。標的ユーザー名さえ判明していれば取得可能なため、Kerberoastと異なり有効な資格情報すら不要な場合がある。",
    "points": [
      "MITRE ATT&CK: T1558.004 (Steal or Forge Kerberos Tickets: AS-REP Roasting)",
      "前提条件: userAccountControlのDONT_REQ_PREAUTH (0x400000) が有効",
      "代表ツール: Rubeus asreproast、Impacket GetNPUsers.py、hashcatモード18200(RC4)/19800・19900(AES)",
      "解読対象はAS-REP暗号化部、RC4-HMACだと効率的",
      "対策: 事前認証必須化、DONT_REQ_PREAUTH設定アカウントの棚卸し"
    ],
    "related": [
      "preauth",
      "kerberos",
      "uacflags",
      "etype",
      "kerberoast"
    ]
  },
  {
    "id": "shadowcred",
    "term": "Shadow Credentials",
    "en": "Shadow Credentials",
    "aka": "msDS-KeyCredentialLink, Key Trust悪用",
    "cat": "prim",
    "body": "Shadow Credentialsは、標的のユーザー/コンピューターアカウントのmsDS-KeyCredentialLink属性に攻撃者が用意した公開鍵を書き込み、Key Trust(PKINIT)経由でそのアカウントとしてKerberos認証を行う攻撃手法である。この属性はWindows Server 2016でWindows Hello for Business向けに導入され、KDCはAS-REQ内の署名に対応する公開鍵が同属性に登録されているか検証して認証を許可する。標的属性への書き込み権(GenericWrite/GenericAll等)があればパスワードを変更せずにアカウントを乗っ取れ、取得したTGTに含まれるPACからNTLMハッシュ(U2U/getnthash)も回収できるため、目立たない権限昇格・永続化に使われる。",
    "points": [
      "悪用属性: msDS-KeyCredentialLink(WS2016で追加、Key Trust/PKINIT用)",
      "前提: DCがWS2016以上かつPKINIT用のDC認証(KDC)証明書を保持",
      "必要権限: 標的オブジェクトへの書き込み権(GenericWrite/GenericAll/WriteProperty等)",
      "代表ツール: Whisker(C#)、pyWhisker、Certipy shadow、ntlmrelay/coercion連携",
      "BloodHoundのAddKeyCredentialLinkエッジで悪用経路を可視化"
    ],
    "related": [
      "keycredlink",
      "pkinit",
      "kerberos",
      "whfb",
      "dacl"
    ]
  },
  {
    "id": "ntlmrelay",
    "term": "NTLM リレー",
    "en": "NTLM Relay",
    "aka": "NTLM relay,SMB relay,ntlmrelayx,credential relaying",
    "cat": "prim",
    "body": "NTLMリレーは、被害者から発生したNTLM認証を攻撃者が中継し、そのチャレンジ/レスポンスを別のサーバーへそのまま転送して被害者になりすます中間者攻撃である。NTLM認証はチャネルとのバインドが弱く、SMB署名・LDAP署名・チャネルバインディング(EPA)といった対策が無効な標的に対して、盗んだ認証をそのまま再利用してSMB/LDAP/HTTP(ADCS Web登録)/MSSQL等の操作を実行できる。強制認証やLLMNR/NBT-NS/mDNSポイズニングと組み合わせて被害者認証を誘発し、ADCS ESC8やLDAP経由のRBCD書き込み・(条件次第で)DCSyncへと連鎖させる。",
    "points": [
      "MITRE ATT&CK: T1557 (Adversary-in-the-Middle)、関連 T1187 (Forced Authentication)",
      "代表ツール: Impacket ntlmrelayx.py、Responder、mitm6",
      "前提: 標的で署名/チャネルバインディング未強制(SMB署名オフ、LDAP署名/CB未要求、EPA無効)",
      "連鎖先例: ADCS ESC8(HTTP登録)、LDAP経由RBCD設定、権限次第でDCSync",
      "対策: SMB署名の強制、LDAP署名/チャネルバインディング、EPA、NTLM廃止"
    ],
    "related": [
      "ntlm",
      "netntlm",
      "smbsigning",
      "epa",
      "coercion",
      "adcsesc",
      "ntlmmic",
      "webclient"
    ]
  },
  {
    "id": "coercion",
    "term": "強制認証 (Coercion)",
    "en": "Authentication Coercion",
    "aka": "Coercion,forced authentication,PetitPotam,PrinterBug,MS-EFSRPC",
    "cat": "prim",
    "body": "強制認証(Coercion)は、リモートのWindowsサーバーやDCに実装されたRPCメソッドにUNC/ファイルパスを渡して呼び出し、標的マシンアカウントに攻撃者制御ホストへNTLM/Kerberos認証を能動的に行わせる手法である。MS-EFSRPC(PetitPotam)ではEfsRpcOpenFileRaw / EfsRpcEncryptFileSrv / EfsRpcAddUsersToFile 等、MS-RPRN(PrinterBug)では RpcRemoteFindFirstPrinterChangeNotificationEx など、ファイルパスを受け取るAPIが誘発点となり、既定ではTCP 445のSMB(LSARPC/EFSRPC名前付きパイプ)経由でマシンアカウント認証を発生させる。誘発した認証はNTLMリレーの入力に使われ、特にDCを標的にADCS ESC8やRBCDへ連鎖してドメイン侵害に至る。標的でWebClientサービス(WebDAV)が有効な場合はHTTPでコアースでき、Kerberos認証をLDAP等へクロスプロトコルリレーできる。PetitPotam系はCVE-2021-36942(2021年8月)でEFSRPCの無認証呼び出しが部分的に塞がれたが、他メソッド/他プロトコル(DFSNM/FSRVP)は残存する。",
    "points": [
      "MITRE ATT&CK: T1187 (Forced Authentication)",
      "主なベクタ: MS-EFSRPC(PetitPotam)、MS-RPRN(PrinterBug)、MS-DFSNM(DFSCoerce)、MS-FSRVP(ShadowCoerce)",
      "RPCメソッド例: EfsRpcOpenFileRaw / EfsRpcEncryptFileSrv(EFSRPC)、RpcRemoteFindFirstPrinterChangeNotificationEx(RPRN)",
      "既定でTCP 445(SMB)経由; WebClient有効時はHTTPコアースでKerberosをLDAPへリレー可",
      "PetitPotamはCVE-2021-36942で部分緩和; 対策はパッチ+RPCフィルタ+EPA/SMB署名でリレー無効化",
      "代表ツール: PetitPotam, Coercer, SpoolSample, dfscoerce.py"
    ],
    "related": [
      "ntlmrelay",
      "rpc",
      "smb",
      "machineacct",
      "adcs",
      "unconstrained",
      "printnightmare",
      "webclient",
      "oxid",
      "epmreg"
    ]
  },
  {
    "id": "namepoison",
    "term": "名前解決ポイズニング",
    "en": "Name Resolution Poisoning",
    "aka": "LLMNR/NBT-NS/mDNS Poisoning, Responder",
    "cat": "prim",
    "body": "LLMNR(UDP 5355)、NBT-NS(UDP 137)、mDNS(UDP 5353)といったフォールバック名前解決プロトコルの応答を攻撃者が偽装し、被害端末を攻撃者ホストへ誘導する中間者攻撃プリミティブ。DNS解決に失敗した端末がブロードキャスト/マルチキャストで名前を問い合わせると、Responder等のツールが即座に自ホストのアドレスを返答し、被害者がSMB等で認証を試みた際のNet-NTLM(NTLMv2)チャレンジ・レスポンスを窃取する。窃取したハッシュはオフラインクラック、またはSMB署名が無効な標的へのNTLMリレーに悪用され、初期侵入・横展開の起点となる。GPO(マルチキャスト名前解決の無効化)やNBT-NS無効化、SMB署名強制が主要な緩和策。",
    "points": [
      "MITRE ATT&CK: T1557.001(LLMNR/NBT-NS Poisoning and SMB Relay)",
      "ポート: LLMNR=UDP 5355, NBT-NS=UDP 137, mDNS=UDP 5353",
      "主要ツール: Responder, Inveigh, mitm6(IPv6/DHCPv6)",
      "窃取物はNet-NTLMハッシュ。Pass-the-Hashには使えないがクラック/リレーに利用可能",
      "緩和: LLMNR/NBT-NS無効化GPO、SMB署名強制、EDR/ネットワーク検知"
    ],
    "related": [
      "ntlmrelay",
      "netntlm",
      "smbsigning",
      "coercion",
      "smb",
      "wpad"
    ]
  },
  {
    "id": "tokentheft",
    "term": "トークン窃取・偽装",
    "en": "Token Impersonation / Theft",
    "aka": "Token Theft, SeImpersonate悪用, Potato系",
    "cat": "prim",
    "body": "既存プロセスのアクセストークンを複製・偽装して、その所有者(多くはSYSTEMや別ユーザー)の権限で操作を行う権限昇格・偽装プリミティブ。SeImpersonatePrivilege や SeAssignPrimaryTokenPrivilege を保持するサービスアカウント文脈で、NTLM認証をローカルの名前付きパイプ等へコアース(強制)してSYSTEMのトークンを取得し、DuplicateTokenEx→ImpersonateLoggedOnUser/CreateProcessWithTokenW でSYSTEMプロセスを起動する「Potato系」が代表例。JuicyPotato(BITS/DCOM)、RoguePotato(RPC)、PrintSpoofer(スプーラ名前付きパイプ)、GodPotato、EfsPotato(EFSRPC)等が各種コアースを悪用する。トークンはユーザーモードのオブジェクトであり、既存トークンを盗む手法はパスワードやハッシュを必要としない点が検知回避上重要。",
    "points": [
      "MITRE ATT&CK: T1134.001(Access Token Manipulation: Token Impersonation/Theft)、親T1134",
      "前提権限: SeImpersonatePrivilege / SeAssignPrimaryTokenPrivilege",
      "主要API: DuplicateTokenEx, ImpersonateLoggedOnUser, CreateProcessWithTokenW/CreateProcessAsUser",
      "代表ツール: PrintSpoofer, RoguePotato, GodPotato, JuicyPotato, EfsPotato",
      "サービスアカウント(IIS/MSSQL等)からSYSTEMへの昇格に多用"
    ],
    "related": [
      "token",
      "privilege",
      "abusableprivs",
      "namedpipe",
      "coercion"
    ]
  },
  {
    "id": "dcshadow",
    "term": "DCShadow",
    "en": "DCShadow",
    "aka": "不正DC登録",
    "cat": "prim",
    "body": "攻撃者が一時的に不正なドメインコントローラを登録し、正規のAD複製(DRSUAPI)を用いて任意のディレクトリ変更をドメイン全体へ注入する持続化・改ざんプリミティブ。mimikatzの lsadump::dcshadow が、構成ネーミングコンテキストに nTDSDSA オブジェクトと必要なSPN(DRSインターフェースGUID E3514235-4B06-11D1-AB04-00C04FC2DCD2 とGC)を登録して自ホストを一時的にDCと認識させ、DrsReplicaAdd(IDL_DRSReplicaAdd)で変更をプッシュした後に痕跡を除去する。変更が通常のLDAP書き込みではなく複製経由で入るため、オブジェクト単位の監査ログに残りにくく、SIDHistoryやACL、primaryGroupID等の秘密裏な改ざんに使われる。実行にはDomain Admins相当(またはDC/構成コンテナへの書込)権限が必要。",
    "points": [
      "MITRE ATT&CK: T1207(Rogue Domain Controller)",
      "機構: 構成NCにnTDSDSA+SPN登録→DrsReplicaAddで複製プッシュ",
      "必要SPN: DRSインターフェース(GUID E351...)とGlobal Catalog",
      "ツール: mimikatz lsadump::dcshadow(実行者+push役の2文脈)",
      "検知: 4662/DS複製イベント、想定外DCのnTDSDSA出現の監視"
    ],
    "related": [
      "replication",
      "drsuapi",
      "dcsync",
      "dc",
      "sidhistory"
    ]
  },
  {
    "id": "goldensaml",
    "term": "Golden SAML / Silver SAML",
    "en": "Golden SAML / Silver SAML",
    "aka": "SAMLトークン偽造, トークン署名証明書窃取",
    "cat": "prim",
    "body": "フェデレーションのSAMLトークン署名鍵を窃取し、任意ユーザー・任意権限のSAMLレスポンスを偽造してSSO先へ認証なしにログインするIDフェデレーション攻撃。Golden SAML(CyberArkが命名)はAD FSのトークン署名証明書(秘密鍵)を盗み、パスワードやMFAを回避して連携アプリ(Azure/Entra, AWS, Salesforce等)へ管理者としてサインインする。Silver SAML(Semperisが命名)は、Entra IDや他IdPで外部生成した署名証明書の秘密鍵を入手できれば、AD FSへのアクセスなしに同様の偽造を行える亜種で、Entra既定のMicrosoft管理鍵(エクスポート不可)ではなく外部証明書の利用がリスク源となる。トークンはIdP外で署名・生成されるため、IdP側のサインインログに認証イベントが残らず検知が困難。",
    "points": [
      "MITRE ATT&CK: T1606.002(Forge Web Credentials: SAML Tokens)",
      "Golden SAML=AD FSトークン署名証明書の窃取が前提(CyberArk命名)",
      "Silver SAML=外部生成署名証明書の秘密鍵悪用でAD FS不要(Semperis命名)",
      "ツール: shimit, ADFSDump/ADFSpoof(Golden SAML)、SilverSamlForger(Silver SAML/Semperis)",
      "緩和: 外部署名証明書を使わない、AD FS証明書のローテーション/保護"
    ],
    "related": [
      "saml",
      "adfs",
      "entra",
      "tokens",
      "entraconnect",
      "hybridauth"
    ]
  },
  {
    "id": "passwordspray",
    "term": "パスワードスプレー",
    "en": "Password Spraying",
    "aka": "Password Spray, スプレー攻撃",
    "cat": "prim",
    "body": "多数のアカウントに対し、少数(多くは1つ)の推測パスワードを横断的に試すことでアカウントロックアウトを回避する認証攻撃。1アカウントへ多数のパスワードを試すブルートフォースと逆で、ロックアウト閾値の観測周期をまたいで低頻度・広範囲に試行するため個々のアカウントでは失敗が目立ちにくい。標的はSMB/LDAP/Kerberos AS-REQ等のオンプレ認証や、OWA/EWS、AD FS、Entra IDのサインインエンドポイントに及ぶ。オンプレ検知は単一送信元から多数アカウントへの失敗を相関するのが要点で、NTLM系は4625/4776、Kerberos系は4771(事前認証失敗、失敗コード0x18=不正パスワード)を短時間窓で集計する。Entra IDではサインインログのResultType(50126=ユーザー名/パスワード不正、50053=アカウントロックアウト)を分析し、条件付きアクセス/MFA/スマートロックアウトで緩和する。",
    "points": [
      "MITRE ATT&CK: T1110.003(Brute Force: Password Spraying)",
      "特徴: 1パスワード×多アカウント。ロックアウト回避のため低速・広範",
      "標的例: SMB/LDAP/Kerberos AS-REQ, OWA/EWS, AD FS, Entra ID",
      "オンプレ検知: 4625/4776(NTLM)、4771(Kerberos, 失敗コード0x18)を送信元で相関",
      "Entra検知: サインインログ ResultType 50126(資格情報不正)/50053(ロックアウト)、不可能移動",
      "緩和: MFA、スマートロックアウト、条件付きアクセス、パスワード強度"
    ],
    "related": [
      "kerberos",
      "ntlm",
      "authnz",
      "entralogs",
      "condaccess",
      "lockoutpolicy",
      "logonevents"
    ]
  },
  {
    "id": "goldencert",
    "term": "Golden Certificate",
    "en": "Golden Certificate",
    "aka": "CA秘密鍵窃取, PERSIST3",
    "cat": "prim",
    "body": "AD CSの認証局(CA)秘密鍵を窃取し、任意プリンシパル向けの認証用証明書を正規発行プロセス外で偽造してドメイン持続化を確立する手法。Certified Pre-Owned白書のDPERSIST1に相当し、CA署名証明書と秘密鍵(NTAuthCertificatesに登録された信頼CAのもの)を用いてForgeCertやCertipy forgeで任意ユーザーの証明書を生成、PKINITでKerberos TGTを取得してなりすます。偽造証明書はCAの発行記録に残らないため失効(CRL)できず、CA証明書の有効期間(既定約5年)いっぱい持続する。krbtgt等の無効化アカウントには使えないが、DA相当のアクティブアカウントを標的に長期バックドアとなる。",
    "points": [
      "分類: Certified Pre-Owned DPERSIST1(ドメイン持続化)",
      "前提: CA秘密鍵の窃取(NTAuthに登録された信頼CAの署名証明書)",
      "ツール: ForgeCert, Certipy forge → PKINITで認証",
      "偽造証明書はCA発行記録に無く失効不可、CA有効期間まで有効",
      "緩和: CA秘密鍵のHSM保護、CA侵害検知、証明書ロールオーバー"
    ],
    "related": [
      "adcs",
      "ca",
      "pkinit",
      "goldenticket",
      "pki"
    ]
  },
  {
    "id": "goldengmsa",
    "term": "Golden gMSA / Golden dMSA",
    "en": "Golden gMSA / Golden dMSA",
    "aka": "KDS Root Key悪用, オフラインgMSAパスワード計算",
    "cat": "prim",
    "body": "KDSルートキーとgMSAの属性からサービスアカウントのパスワードをオフラインで導出し、任意時点で認証・持続化する攻撃。gMSA/dMSAのパスワードはKDSルートキーとmsds-ManagedPasswordID等から決定論的に計算されるため、KDSルートキー(通常はDA/EA/SYSTEMのみ取得可)を一度入手すればフォレスト全体のgMSAパスワードをDCへ問い合わせずに再計算できる(Semperis GoldenGMSA)。Golden dMSA(Windows Server 2025のdMSA対象)はパスワード生成に用いるManagedPasswordIdの時刻ベース構造の組合せが1,024通りと少なく総当たりが容易な設計上の欠陥を突き、単一ドメインのKDSルートキー侵害でフォレスト横断・持続化に至る。KDSルートキーはフォレスト単位で共有される点が影響範囲を広げる。",
    "points": [
      "機構: KDSルートキー+ManagedPasswordID等からgMSA/dMSAパスワードを算出",
      "前提: KDSルートキーの窃取(通常DA/EA/SYSTEMのみ)",
      "ツール: GoldenGMSA / GoldenDMSA(いずれもSemperis)",
      "Golden dMSA: ManagedPasswordIdの時刻ベース構造が1,024通りで総当たり容易",
      "影響: KDSルートキーはフォレスト共有→フォレスト全体の持続化"
    ],
    "related": [
      "gmsa",
      "kdsrootkey",
      "kerberoast",
      "forest",
      "krbtgt"
    ]
  },
  {
    "id": "procinjection",
    "term": "プロセスインジェクション",
    "en": "Process Injection",
    "aka": "コードインジェクション",
    "cat": "prim",
    "body": "正規プロセスのアドレス空間に攻撃者コードを注入・実行させ、検知回避・権限文脈の借用・持続化を図る実行プリミティブ群。古典的なリモートスレッド注入(VirtualAllocEx→WriteProcessMemory→CreateRemoteThread)、プロセスホローイング(サスペンド状態の正規プロセスのイメージを差し替え)、APC注入、スレッドハイジャック(SetThreadContext)、リフレクティブDLL注入など多数の手法があり、いずれも自プロセスではなく信頼された宿主プロセス内でコードを走らせることでEDRやアプリ許可リストの検知/防御を回避する。EDRはAPI呼び出し列やメモリ属性(RWX)、リモートスレッド生成をテレメトリで監視し、ETWやカーネルコールバックで検知する。",
    "points": [
      "MITRE ATT&CK: T1055(Process Injection)。ホローイング=T1055.012, APC=T1055.004, スレッドハイジャック=T1055.003",
      "古典手法API: VirtualAllocEx, WriteProcessMemory, CreateRemoteThread",
      "目的: 検知回避、信頼プロセスの権限文脈借用、持続化",
      "検知: RWXメモリ、リモートスレッド、疑わしいAPIシーケンス、ETW/カーネルコールバック",
      "関連防御: EDR/XDR、ASR(子プロセス/LSASS保護)、AMSI"
    ],
    "related": [
      "process",
      "byovd",
      "edr",
      "etw",
      "asr",
      "reflectiveload",
      "ppidspoof"
    ]
  },
  {
    "id": "byovd",
    "term": "BYOVD (脆弱ドライバの持ち込み)",
    "en": "Bring Your Own Vulnerable Driver",
    "aka": "BYOVD, 署名済み脆弱ドライバ悪用",
    "cat": "prim",
    "body": "BYOVD（Bring Your Own Vulnerable Driver）は、攻撃者が正規に署名された「脆弱な」カーネルドライバをディスクに持ち込んでロードし、そのドライバの脆弱性を悪用してカーネル空間で任意の読み書き（任意メモリR/W）や特権操作を実現する手法。正規署名を使うことでWindowsのドライバ署名強制（DSE）を回避しつつカーネル権限を得て、EDR/AVのプロセス保護やカーネルコールバックを無効化・改ざんし、LSASSやPPLの保護を破ることを狙う。前提として管理者権限が必要（ドライバのロードにはSeLoadDriverPrivilege相当が要る）。代表的な悪用ドライバはRTCore64.sys（MSI Afterburner）、DBUtil_2_3.sys（Dell）、gdrv.sys（GIGABYTE）、iqvw64e.sys（Intel）、mhyprot2.sys（miHoYo/原神アンチチート）、PROCEXP152.sys（Process Explorer、プロセスキルに悪用）など。Microsoftは脆弱ドライバブロックリスト（HVCI/WDACベース、Vulnerable Driver Blocklist）で対策する。MITRE ATT&CKでは主にT1068（悪用による特権昇格）とT1562.001（防御回避: ツールの無効化・改ざん）に対応する。",
    "points": [
      "MITRE: T1068 悪用による特権昇格 / T1562.001 防御回避（ツール無効化）",
      "正規署名ドライバを悪用しDSE（ドライバ署名強制）を回避してカーネル実行",
      "対策: Microsoft脆弱ドライバブロックリスト、HVCI/メモリ整合性、WDAC",
      "代表ドライバ: RTCore64.sys, DBUtil_2_3.sys, gdrv.sys, iqvw64e.sys, mhyprot2.sys",
      "目的: EDRのカーネルコールバック無効化、PPL/LSASS保護の破壊（要管理者権限）"
    ],
    "related": [
      "ppl",
      "edr",
      "lsass",
      "userkernel",
      "wdac",
      "vbs",
      "ioctl"
    ]
  },
  {
    "id": "edr",
    "term": "EDR（エンドポイント検知・対応）",
    "en": "Endpoint Detection and Response",
    "aka": "EDR",
    "cat": "soc",
    "body": "EDR（Endpoint Detection and Response）は、エンドポイント上のプロセス生成、ファイル・レジストリ操作、ネットワーク接続、API/カーネルイベントなどのテレメトリを常時収集・相関分析し、不審な振る舞いを検知して隔離・封じ込め・調査を可能にするセキュリティ製品。従来のシグネチャ型AVと異なり、振る舞いベース検知（IoA）とプロセスツリーの追跡を重視し、ファイルレス攻撃やLOLBin悪用も捉える。多くはユーザーモードのAPIフックとカーネルドライバ（ETW/カーネルコールバック）でテレメトリを取得するため、攻撃者はAMSIバイパスやBYOVD、EDRアンフッキング等で回避を試みる。SOCではアラートのトリアージ、ライブレスポンス、脅威ハンティングの中核となる。",
    "points": [
      "振る舞い/IoAベース検知でファイルレス・LOLBin攻撃を捕捉",
      "データ源: プロセス生成、ETW、カーネルコールバック、APIフック",
      "回避手法: EDRアンフッキング、AMSIバイパス、BYOVD、DLLアンフック",
      "代表製品: Microsoft Defender for Endpoint, CrowdStrike, SentinelOne",
      "機能: 隔離、ライブレスポンス、プロセスツリー可視化、脅威ハンティング"
    ],
    "related": [
      "mde",
      "xdr",
      "sysmon",
      "etw",
      "byovd",
      "sandbox",
      "memforensics"
    ]
  },
  {
    "id": "xdr",
    "term": "XDR（拡張検知・対応）",
    "en": "Extended Detection and Response",
    "aka": "XDR, Microsoft Defender XDR, M365 Defender",
    "cat": "soc",
    "body": "XDR（Extended Detection and Response）は、エンドポイント（EDR）、アイデンティティ、メール、クラウドアプリ、ネットワークなど複数のドメインのシグナルを単一プラットフォームで相関させ、攻撃の全体像（インシデント）として自動的に紐付けて検知・対応する統合型ソリューション。Microsoftの実装はMicrosoft Defender XDR（旧Microsoft 365 Defender）で、Defender for Endpoint（MDE）、Defender for Identity（MDI）、Defender for Office 365、Defender for Cloud Appsのアラートを1つのインシデントに集約する。個別アラートを横断相関することで、複数エンドポイント・IDにまたがるラテラルムーブメントやアイデンティティ攻撃を可視化し、SOCの調査工数を削減する。",
    "points": [
      "Microsoft実装: Microsoft Defender XDR（旧M365 Defender）",
      "構成: MDE + MDI + Defender for Office 365 + Defender for Cloud Apps",
      "複数ドメインのアラートを単一インシデントに自動相関",
      "security.microsoft.com ポータルで統合運用、Advanced HuntingでKQL横断検索"
    ],
    "related": [
      "mde",
      "mdi",
      "siem",
      "advhunting",
      "edr"
    ]
  },
  {
    "id": "mde",
    "term": "Microsoft Defender for Endpoint (MDE)",
    "en": "Microsoft Defender for Endpoint",
    "aka": "MDE, Defender for Endpoint, MDATP",
    "cat": "soc",
    "body": "Microsoft Defender for Endpoint（MDE、旧Microsoft Defender ATP／MDATP）は、Windows/macOS/Linux/モバイル向けのMicrosoft製EDRプラットフォーム。次世代AV（Microsoft Defender Antivirus）、EDRセンサー、脅威と脆弱性管理（TVM）、攻撃対象領域の縮小（ASR）ルール、自動調査・修復（AIR）を統合する。エンドポイントの振る舞いテレメトリをMicrosoft Defender XDRクラウドに送信し、Advanced Hunting（KQL）でDeviceProcessEvents等のテーブルを横断検索できる。SOCでは検知・隔離・ライブレスポンスに加え、ASR/改ざん防止（Tamper Protection）による攻撃防御の要となる。",
    "points": [
      "旧称: Microsoft Defender ATP / MDATP",
      "構成: 次世代AV、EDR、TVM、ASRルール、自動調査修復(AIR)",
      "Advanced Huntingテーブル例: DeviceProcessEvents, DeviceNetworkEvents",
      "改ざん防止(Tamper Protection)、PPLによる自己保護",
      "Defender XDRインシデントの主要シグナル源"
    ],
    "related": [
      "edr",
      "xdr",
      "asr",
      "advhunting",
      "ppl"
    ]
  },
  {
    "id": "mdi",
    "term": "Microsoft Defender for Identity (MDI)",
    "en": "Microsoft Defender for Identity",
    "aka": "MDI, Azure ATP, ATA",
    "cat": "soc",
    "body": "Microsoft Defender for Identity（MDI、旧Azure Advanced Threat Protection／Azure ATP、さらに前身はオンプレのAdvanced Threat Analytics: ATA）は、ドメインコントローラやAD FS、AD CSサーバにセンサーを導入し、認証トラフィック（Kerberos、NTLM、LDAP、DNS、SMB／DRSUAPI）とWindowsイベントログを解析してアイデンティティベース攻撃を検知するソリューション。DCが処理する通信を直接監視するため、DCSync（不審なDRSUAPIレプリケーション）、Kerberoasting（異常なTGS-REQ）、Pass-the-Hash/Pass-the-Ticket、偵察（ドメイン列挙）などを高忠実度に検知できる。センサーはDC上に常駐し正常なレプリケーションパートナーをベースライン化するため、非DCホストが突如DRSUAPIを話すとDCSyncとしてアラートを上げる。検知結果はMicrosoft Defender XDRに統合される。",
    "points": [
      "旧称: Azure ATP（さらに前身はオンプレのATA: Advanced Threat Analytics）",
      "センサーをDC/AD FS/AD CSに導入し認証トラフィックとイベントログを解析",
      "検知例: DCSync(DRSUAPI), Kerberoasting(TGS-REQ), PtH, PtT, 偵察",
      "正常レプリケーションパートナーをベースライン化して異常DRSUAPIを検知",
      "Defender XDRにアラート統合、アイデンティティ攻撃の可視化"
    ],
    "related": [
      "dcsync",
      "kerberoast",
      "drsuapi",
      "replication",
      "xdr"
    ]
  },
  {
    "id": "siem",
    "term": "Microsoft Sentinel / SIEM",
    "en": "Microsoft Sentinel / SIEM",
    "aka": "Sentinel, SIEM, Log Analytics",
    "cat": "soc",
    "body": "SIEM（Security Information and Event Management）は、多様なログ・イベントを集中収集・正規化・相関分析し、相関ルールやアナリティクスでインシデントを検知・調査するプラットフォーム。Microsoft SentinelはクラウドネイティブなSIEM/SOARで、Azure Log Analyticsワークスペース上に構築され、KQL（Kusto Query Language）でクエリ・検知ルール・ハンティングを記述する。Windowsセキュリティイベント、Sysmon、Defender XDR、Entra IDサインインログなどをデータコネクタで取り込み、分析ルールでインシデント化し、プレイブック（Logic Apps）で自動対応（SOAR）を行う。SOCの一元的な監視・調査・自動化基盤となる。",
    "points": [
      "Microsoft Sentinel = クラウドネイティブSIEM+SOAR、Log Analytics基盤",
      "クエリ言語はKQL、SecurityEvent/SigninLogs等のテーブルを分析",
      "データコネクタでDefender XDR, Entra ID, Sysmon等を取り込み",
      "分析ルールでインシデント生成、プレイブック(Logic Apps)で自動対応",
      "SOCの集中監視・相関・脅威ハンティング基盤"
    ],
    "related": [
      "advhunting",
      "sysmon",
      "eventlog",
      "xdr",
      "entralogs"
    ]
  },
  {
    "id": "advhunting",
    "term": "高度な追及 (Advanced Hunting) / KQL",
    "en": "Advanced Hunting (KQL)",
    "aka": "Kusto Query Language, KQL, Advanced Hunting",
    "cat": "soc",
    "body": "高度な追及（Advanced Hunting）は、Microsoft Defender XDRポータル上で生ログテーブルに対してKQL（Kusto Query Language）でクエリを実行し、プロアクティブに脅威を探索するハンティング機能。DeviceProcessEvents、DeviceNetworkEvents、DeviceLogonEvents、IdentityLogonEvents、EmailEventsなど正規化されたスキーマを横断結合し、既定で最大30日分のテレメトリを検索できる。KQLはパイプ記号「|」で演算子をつなぐ読み取り専用言語で、where/project/summarize/join等で絞り込み・集計する。作成したクエリはカスタム検知ルールに昇格でき、IoA/IoCベースのハンティングやインシデント調査に活用される。",
    "points": [
      "言語: KQL（Kusto Query Language）、パイプ「|」で演算子連結",
      "主要演算子: where, project, summarize, join, extend",
      "代表テーブル: DeviceProcessEvents, DeviceLogonEvents, IdentityLogonEvents",
      "既定で約30日分のテレメトリを横断検索、カスタム検知ルール化が可能",
      "Defender XDRとSentinel双方でKQLベースのハンティングを実施"
    ],
    "related": [
      "xdr",
      "mde",
      "siem",
      "threathunting",
      "iocioa",
      "deteng"
    ]
  },
  {
    "id": "amsi",
    "term": "AMSI（マルウェア対策スキャンインターフェース）",
    "en": "Antimalware Scan Interface",
    "aka": "AmsiScanBuffer,AMSI bypass",
    "cat": "soc",
    "body": "AMSI（Antimalware Scan Interface）は、Windows 10で導入されたアプリケーションとアンチマルウェアエンジンの橋渡しをする標準インターフェースで、実行前のスクリプト内容（PowerShell、VBScript、JScript、Office VBAマクロ、.NET等）をスキャンさせる仕組み。プロセス空間にロードされたamsi.dllのAmsiScanBuffer/AmsiScanStringにコンテンツが渡され、HKLM\\SOFTWARE\\Microsoft\\AMSI\\Providersに登録されたAMSIプロバイダ（DefenderではMpOav.dll、COM CLSID {2781761E-28E0-4109-99FE-B9D127C57AFE}）へCOM経由で渡され、最終的にDefenderエンジン（MsMpEng.exe）でスキャンされてAMSI_RESULTでクリーン／検出／ブロックが判定される。難読化されて復号後に初めて可視化されるファイルレス／インメモリ攻撃の検知に有効なため、攻撃者はamsi.dllのAmsiScanBufferをメモリパッチする、amsiInitFailedフラグを改ざんする等のAMSIバイパスを多用する。",
    "points": [
      "Windows 10で導入、amsi.dllがプロセスにロードされコンテンツをスキャン",
      "主要関数: AmsiScanBuffer / AmsiScanString、結果はAMSI_RESULT",
      "対象: PowerShell, VBScript, JScript, Office VBAマクロ, .NET(CLR)",
      "COM経由でAMSIプロバイダ(Defender: MpOav.dll)へ渡し、MsMpEngで判定",
      "バイパス手法: AmsiScanBufferのメモリパッチ、amsiInitFailedフラグ改ざん"
    ],
    "related": [
      "pslogging",
      "edr",
      "procinjection",
      "mde",
      "wdac",
      "obfuscation",
      "reflectiveload"
    ]
  },
  {
    "id": "asr",
    "term": "攻撃面の縮小規則 (ASR ルール)",
    "en": "Attack Surface Reduction Rules",
    "aka": "ASR rules, Attack Surface Reduction",
    "cat": "soc",
    "body": "攻撃面の縮小規則（ASRルール）は、Microsoft Defenderアンチウイルス／Defender for Endpointが提供する挙動ベースの防御機能で、各規則はGUIDで識別され、マルウェアが多用する挙動（Officeによる子プロセス生成、メール添付からの実行ファイル起動、難読化スクリプト実行、LSASSからの資格情報窃取など）をブロックする。各規則はブロック／監査（Audit）／警告（Warn）／無効の各モードで運用できるが、一部規則（LSASS資格情報窃取ブロックなど）はWarnに非対応。リアルタイム保護やクラウド保護が有効であることが前提となり、Mimikatz型のLSASSダンプやLOLBin悪用に対する早期の防御・検知レイヤーとして機能する。",
    "points": [
      "「LSASSからの資格情報の窃取をブロック」規則のGUIDは 9e6c4e1f-7d60-472f-ba1a-a39ef669e4b2（Warnモード非対応）",
      "イベントは Microsoft-Windows-Windows Defender/Operational に記録（1121=ブロック、1122=監査、1129=Warnモードのユーザー上書き、5007=設定変更）",
      "運用は監査モードで数週間評価→例外作成→ブロックへ移行が定石",
      "Defender AVがアクティブAVであることが多くの規則の前提"
    ],
    "related": [
      "lsass",
      "procinjection",
      "lolbin",
      "wdac",
      "mde"
    ]
  },
  {
    "id": "wdac",
    "term": "WDAC（アプリケーション制御）",
    "en": "Windows Defender Application Control",
    "aka": "WDAC, Application Control, Code Integrity",
    "cat": "soc",
    "body": "WDAC（Windows Defender Application Control、旧称 Configurable Code Integrity／Device Guardの一部）は、実行を許可するドライバーやアプリを定義したコード整合性ポリシーに基づき、それ以外のコードの実行をカーネルレベルで拒否するアプリケーション制御機能である。ポリシーは署名者（発行元）、ファイルハッシュ、パス、WHQL属性などのルールで構成し、XMLをバイナリ（SiPolicy.p7b／.cip）にコンパイルして適用、UEFIによる起動時強制も可能。カーネルモード（KMCI）とユーザーモード（UMCI）の両方を検証しユーザー権限では改ざんできないため、AppLockerより強固なセキュリティ境界とされ、Microsoft推奨ブロックリストによりLOLBin悪用の遮断にも用いられる。",
    "points": [
      "イベントは Microsoft-Windows-CodeIntegrity/Operational（3076=監査時のブロック相当、3077=強制ブロック）",
      "ルール種別：発行元/署名者・ハッシュ・パス・ファイル属性・WHQL",
      "カーネル強制でありAppLockerより耐改ざん性が高い（真のセキュリティ境界）",
      "Microsoft推奨ブロックリストで既知のLOLBin/バイパスバイナリを遮断"
    ],
    "related": [
      "applocker",
      "asr",
      "lolbin",
      "amsi",
      "byovd"
    ]
  },
  {
    "id": "applocker",
    "term": "AppLocker",
    "en": "AppLocker",
    "aka": "Application Whitelisting",
    "cat": "soc",
    "body": "AppLockerはWindows 7／Server 2008 R2で導入されたアプリケーション許可リスト（ホワイトリスト）機能で、実行を許可／拒否するファイルをルールで定義し、Application Identityサービス（AppIDSvc）が強制する。ルールは発行元（署名）・パス・ファイルハッシュの3方式で作成でき、実行ファイル、Windowsインストーラー、スクリプト、パッケージアプリ、DLLの各コレクションに分けて管理する。ユーザーモードで動作し既知のバイパス手法が多いため、Microsoftはセキュリティ境界ではなく多層防御の一要素と位置づけており、より強固な制御にはWDACが推奨される。",
    "points": [
      "ルールコレクション：実行ファイル(.exe/.com)・インストーラー(.msi/.msp)・スクリプト(.ps1/.bat/.cmd/.vbs/.js)・パッケージアプリ(.appx)・DLL",
      "強制主体は Application Identity サービス（AppIDSvc）",
      "イベントは Microsoft-Windows-AppLocker/*（8003=監査、8004=ブロック。EXE/DLLコレクション）",
      "ユーザーモード動作でバイパスが多く、セキュリティ境界ではなく多層防御扱い"
    ],
    "related": [
      "wdac",
      "asr",
      "lolbin",
      "amsi"
    ]
  },
  {
    "id": "credguard",
    "term": "Credential Guard / LSA保護",
    "en": "Credential Guard / LSA Protection",
    "aka": "RunAsPPL, Protected Process Light, PPL, LSA Protection",
    "cat": "soc",
    "body": "Credential GuardとLSA保護は、いずれもLSASSに格納される資格情報の窃取を防ぐ機構だが仕組みが異なる。LSA保護（RunAsPPL）はlsass.exeをPPL（Protected Process Light）として起動し、非PPLプロセスによるLSASSメモリの読み取り・注入を拒否する（レジストリ HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa の RunAsPPL=1）。Credential Guardは仮想化ベースセキュリティ（VBS／HVCI）を用い、NTLMハッシュ・Kerberos TGT・キャッシュ資格情報を隔離LSAプロセス（LSAIso.exe、VTL1トラストレット）に分離するため、SYSTEM権限を得た攻撃者でもこれらを平文/ハッシュとして取り出せない。ただしPPLはBYOVD（脆弱ドライバー）で無効化され得るなど回避手法が存在し、Credential Guardも新規ログオンの資格情報やキーロガーは防げない点に留意する。",
    "points": [
      "LSA保護 = RunAsPPL によるlsass.exeのPPL化、Credential Guard = VBSによるLSAIso.exe隔離",
      "Windows 11 22H2以降は要件を満たすEnterprise系端末でVBS/Credential Guardが既定で有効",
      "Mimikatzのsekurlsa等のメモリダンプに対する主要な緩和策",
      "PPLはBYOVDやカーネルドライバーで解除され得る（過信は禁物）"
    ],
    "related": [
      "lsass",
      "ppl",
      "creddump",
      "pth",
      "byovd",
      "vbs"
    ]
  },
  {
    "id": "honeytoken",
    "term": "ハニートークン / おとりアカウント",
    "en": "Honeytoken / Honey Account",
    "aka": "honeytoken, honey account, decoy account, canary account",
    "cat": "soc",
    "body": "ハニートークン（おとりアカウント／デコイ）は、正規の業務用途を持たない偽の資格情報・アカウント・ファイル・リソースを配置し、それに対するあらゆるアクセスや認証試行を攻撃者の存在を示す高信頼のアラートとして扱う欺瞞（デセプション）手法である。例えばSPNを設定した使われないおとりADアカウントはKerberoastの餌となり、そのアカウントへのサービスチケット要求（TGS-REQ）を検知の起点にできる。誤検知が極めて少なく偵察・横展開の段階で攻撃者を炙り出せるため、Microsoft Defender for Identity（MDI）のハニートークンエンティティやCanaryトークンなどとして運用される。",
    "points": [
      "いかなるアクセスも異常＝高信頼シグナル（誤検知が少ない）",
      "MDIはハニートークンアカウントを指定し関連アクティビティを警告",
      "SPN付きおとりアカウントはKerberoast/AS-REProastの検知トラップに有効",
      "IOA・スレットハンティングと組み合わせる能動的防御"
    ],
    "related": [
      "kerberoast",
      "mdi",
      "threathunting",
      "iocioa",
      "adminsdholder"
    ]
  },
  {
    "id": "threathunting",
    "term": "スレットハンティング（脅威ハンティング）",
    "en": "Threat Hunting",
    "aka": "threat hunting, proactive hunting",
    "cat": "soc",
    "body": "スレットハンティング（脅威ハンティング）は、既存の自動検知をすり抜けた侵入者が既に存在するという「侵害前提（assume breach）」に立ち、仮説を立ててEDR・SIEM・Sysmonなどのテレメトリを能動的に調査し脅威を発見する営みである。多くはMITRE ATT&CKの技術を仮説の起点とし、IOAや異常挙動を探索するため、単なるアラート対応（受動的）と対比される。発見した手口は新たな検知ルールへと落とし込み、いわゆる「痛みのピラミッド（Pyramid of Pain）」の上位（TTP）で攻撃者にコストを強いることを狙う。",
    "points": [
      "侵害前提・仮説駆動でATT&CKのTTPを起点に探索",
      "主なデータ源：EDR/XDR、SIEM、Sysmon、高度な追及(Advanced Hunting)",
      "IOCの受動照合ではなくIOA/挙動ベースの能動的発見",
      "成果を検知ルール化して継続的に防御を強化"
    ],
    "related": [
      "iocioa",
      "mitreattack",
      "advhunting",
      "siem",
      "sysmon",
      "deteng",
      "pyramid"
    ]
  },
  {
    "id": "iocioa",
    "term": "IOC と IOA",
    "en": "IOC vs IOA",
    "aka": "Indicator of Compromise, Indicator of Attack, IOC, IOA",
    "cat": "soc",
    "body": "IOC（Indicator of Compromise／侵害の痕跡）は、ハッシュ値・IPアドレス・ドメイン・ファイル名・レジストリキーといった、侵害が起きた（または進行中である）ことを示す事後的・静的なアーティファクトであり、原子的で攻撃者が容易に変更できるため陳腐化しやすい。一方IOA（Indicator of Attack／攻撃の兆候）は、LSASSアクセスやプロセスインジェクション、コード実行連鎖など攻撃者の意図・手口が進行中であることを示す挙動ベースの指標で、CrowdStrikeが提唱した概念である。IOAはMITRE ATT&CKのTTPに対応し、痕跡そのものより手口を捉えるため回避されにくく、能動的検知やハンティングの中核となる。",
    "points": [
      "IOC=事後・静的・原子的アーティファクト（ハッシュ/IP/ドメイン等）、変更容易で陳腐化しやすい",
      "IOA=進行中の挙動・意図の指標、TTP対応で回避されにくい",
      "IOAはCrowdStrikeが提唱、痛みのピラミッド上位に相当",
      "IOC照合は受動的、IOA検知は能動的（両者は補完関係）"
    ],
    "related": [
      "threathunting",
      "mitreattack",
      "edr",
      "advhunting",
      "pyramid"
    ]
  },
  {
    "id": "mitreattack",
    "term": "MITRE ATT&CK / TTP",
    "en": "MITRE ATT&CK / TTP",
    "aka": "MITRE ATT&CK, Tactics Techniques and Procedures, TTP",
    "cat": "soc",
    "body": "MITRE ATT&CKは、実世界の観測に基づく敵対者の戦術・技術の公開ナレッジベースで、Enterpriseマトリクスでは14の戦術（Tactics＝攻撃の「目的/なぜ」、偵察〜影響まで）を列とし、その下に技術・サブ技術（Techniques＝「どうやって」、T-ID例：T1055 Process Injection）が整理される。さらにグループ（G-ID）、ソフトウェア（S-ID）、緩和策（M-ID）、データソースが体系化され、防御側は検知エンジニアリングや対応範囲のギャップ分析、脅威インテリジェンスの共通言語として活用する。TTPはTactics（戦術）・Techniques（技術）・Procedures（手順＝特定の具体的実装）の頭字語で、痛みのピラミッド最上位に位置し攻撃者に最大の負担を強いる指標である。",
    "points": [
      "Enterpriseは14戦術（列）×多数の技術/サブ技術（T-ID）で構成",
      "主要オブジェクト：戦術・技術・グループ(G)・ソフトウェア(S)・緩和策(M)・データソース",
      "Enterprise/Mobile/ICSの各マトリクスを提供",
      "TTP＝Tactics・Techniques・Procedures、検知/レッドチーム/脅威インテルの共通言語"
    ],
    "related": [
      "iocioa",
      "threathunting",
      "killchain",
      "edr",
      "pyramid",
      "purpleteam"
    ]
  },
  {
    "id": "c2",
    "term": "C2 / ビーコン通信",
    "en": "Command and Control / Beaconing",
    "aka": "C2, C&C, beaconing, Cobalt Strike beacon",
    "cat": "soc",
    "body": "C2(Command and Control)は、侵害したホスト上のインプラント/エージェントが攻撃者のサーバと通信し、コマンド受信や窃取データの送出を行う仕組みを指す。多くのフレームワーク(Cobalt Strike、Sliver、Mythic、Brute Ratel等)は「ビーコン」方式を採り、一定間隔(sleep)にジッタを加えて定期的にコールバックすることで検知を回避しつつ、HTTP(S)/DNS/SMB名前付きパイプ等の正規プロトコルにトラフィックを紛れ込ませる。MITRE ATT&CKではTactic TA0011(Command and Control)に対応し、ドメインフロンティング、マレアブルC2プロファイル、TLS偽装などで通信を秘匿する。SOCでは定期性(周期的ビーコン)、JA3/JA3S(TLS)フィンガープリント、既知C2への接続、異常なDNS TXTクエリ等が検知の要となる。",
    "points": [
      "MITRE ATT&CK Tactic: TA0011 (Command and Control)",
      "ビーコン=sleep間隔+ジッタで周期的コールバック、検知回避",
      "代表ツール: Cobalt Strike、Sliver、Mythic、Brute Ratel",
      "検知観点: 周期性、JA3/JA3S、DNSトンネリング、Beaconing分析",
      "マレアブルC2でトラフィック偽装、ドメインフロンティング"
    ],
    "related": [
      "lolbin",
      "killchain",
      "iocioa",
      "threathunting",
      "mitreattack",
      "ransomware",
      "malwaretypes"
    ]
  },
  {
    "id": "lolbin",
    "term": "LOLBin / LOLBAS",
    "en": "Living-off-the-Land Binaries",
    "aka": "LOLBin, LOLBAS, GTFOBins, living off the land",
    "cat": "soc",
    "body": "LOLBin(Living-off-the-Land Binary)は、OSに標準搭載され署名済みの正規実行ファイルを本来の用途外に悪用し、ダウンロード・実行・永続化・防御回避等を行う攻撃手法を指す。Windowsではrundll32.exe、regsvr32.exe、mshta.exe、certutil.exe、wmic.exe、msbuild.exe等が代表例で、これらの知見はLOLBASプロジェクト(Unix系はGTFOBins)に体系化されている。Microsoft署名済みバイナリを使うためWDAC/AppLockerの許可リストやアンチウイルスの単純なブロックを回避しやすく、「環境寄生型(Living off the Land)」攻撃の中核をなす。SOCでは実行ファイル名だけでなく、親子プロセス関係や異常なコマンドライン引数(例: certutil -urlcache -f)の監視が検知の鍵となる。",
    "points": [
      "正規署名済みOSバイナリの悪用(GTFOBins=Unix、LOLBAS=Windows)",
      "代表例: rundll32/regsvr32/mshta/certutil/wmic/msbuild",
      "AppLocker/WDAC許可リストやAV単純ブロックを回避",
      "検知は親子プロセス+コマンドライン引数(Sysmon Event ID 1=プロセス生成)が要"
    ],
    "related": [
      "c2",
      "sysmon",
      "applocker",
      "wdac",
      "amsi"
    ]
  },
  {
    "id": "smbsigning",
    "term": "SMB署名 / LDAP署名",
    "en": "SMB Signing / LDAP Signing",
    "aka": "SMB signing,LDAP signing,require signing,message integrity",
    "cat": "soc",
    "body": "SMB署名およびLDAP署名は、各プロトコルメッセージにセッション鍵ベースのMACを付与して完全性を保証し、中間者による改ざんとNTLMリレー攻撃を防ぐ機能である。署名が要求(require)されていれば、攻撃者が捕捉した認証を別サーバへ中継しても署名検証で失敗するため、ntlmrelayxやResponderを用いたリレーが成立しない。LDAPではさらにChannel Binding Token(CBT)によりLDAP(S)セッションを下層TLSに紐付け、TLS終端でのリレーも遮断する。近年の既定強化として、Windows 11 24H2ではSMB署名が送受信双方で既定必須、Windows Server 2025ではSMBクライアント(送信)署名が既定必須となった。またServer 2025の新規AD展開ではLDAP署名要求(Require Signing)が既定有効、LDAPチャネルバインディングは既定で「サポート時(When supported)」に設定される。",
    "points": [
      "メッセージ完全性MACでNTLMリレー(ntlmrelayx等)を無効化",
      "LDAPはChannel Binding(CBT)でTLSリレーも遮断",
      "要求(Required)設定が防御の要、Enabled(可能)だけでは不十分",
      "Win11 24H2=SMB署名送受信双方必須、Server 2025=クライアント署名必須",
      "Server 2025新規展開はLDAP署名要求が既定有効、CBTは「サポート時」"
    ],
    "related": [
      "ntlmrelay",
      "ntlm",
      "coercion",
      "namepoison",
      "epa",
      "ntlmmic"
    ]
  },
  {
    "id": "killchain",
    "term": "サイバーキルチェーン",
    "en": "Cyber Kill Chain",
    "aka": "Lockheed Martin Kill Chain, intrusion kill chain",
    "cat": "soc",
    "body": "サイバーキルチェーンは、Lockheed Martin社が2011年に提唱した侵入型攻撃の段階モデルで、攻撃を7フェーズ(偵察→武器化→配送→エクスプロイト→インストール→C2(遠隔操作)→目的の実行)に分解する。各段階で防御側が「検知・拒否・妨害・低下・欺瞞・破壊」のいずれかを行えば連鎖を断ち切れるという発想に基づき、防御施策のマッピングに用いられる。ただしラテラルムーブメントや内部活動の記述が弱いため、より詳細な戦術・技術の分類にはMITRE ATT&CKが、攻撃全体の連続段階にはUnified Kill Chain等が補完的に使われる。SOCでは検知アラートを各フェーズにマッピングし、早期段階での遮断を目標とする。",
    "points": [
      "Lockheed Martin提唱(2011年)、侵入攻撃を7段階に分解",
      "7段階: 偵察/武器化/配送/エクスプロイト/インストール/C2/目的実行",
      "各段階での遮断=連鎖の切断が防御思想",
      "横展開の記述が弱くMITRE ATT&CKが補完",
      "検知アラートを段階マッピングし早期遮断を狙う"
    ],
    "related": [
      "mitreattack",
      "c2",
      "threathunting",
      "iocioa",
      "lolbin",
      "ransomware"
    ]
  },
  {
    "id": "tiermodel",
    "term": "管理階層モデル (Tierモデル)",
    "en": "Tiered Administration Model",
    "aka": "Tier 0, Tiered Administration, Enterprise Access Model, tiering",
    "cat": "soc",
    "body": "管理階層モデル(Tierモデル)は、資産を管理権限のレベルでTier 0(ドメインコントローラ、AD CS、krbtgt、Domain/Enterprise Admins等のフォレスト支配権)、Tier 1(サーバ・業務アプリ)、Tier 2(ワークステーション・一般ユーザ)に分割し、上位Tierの資格情報が下位Tierのホストへ露出しないよう認証境界を設ける設計原則である。目的は、下位層の侵害からラテラルムーブメントや資格情報窃取(PtH等)によってTier 0へ到達する経路を遮断することにある。Microsoftは現在これをEnterprise Access Model(特権アクセス戦略)として再構成し、Control/Management/Data各プレーンの概念に発展させている。実装ではログオン制限GPO、認証ポリシー・サイロ、PAWと組み合わせて階層をまたぐ資格情報露出を防ぐ。",
    "points": [
      "Tier 0=DC/AD CS/krbtgt/特権グループ(フォレスト支配)",
      "上位Tierの資格情報を下位ホストへ露出させない",
      "目的: 下位侵害からTier 0への昇格経路を遮断",
      "MicrosoftはEnterprise Access Modelへ再構成",
      "PAW・認証サイロ・ログオン制限GPOで実装"
    ],
    "related": [
      "paw",
      "authpolicy",
      "privgroups",
      "protectedusers",
      "pth"
    ]
  },
  {
    "id": "paw",
    "term": "特権アクセスワークステーション (PAW)",
    "en": "Privileged Access Workstation",
    "aka": "PAW, Secure Admin Workstation, SAW, jump host",
    "cat": "soc",
    "body": "特権アクセスワークステーション(PAW)は、Tier 0/管理タスク専用に強化された、Web閲覧やメール等の一般業務から隔離された管理端末である。管理者はPAW上からのみDCや機微システムへ接続し、日常業務用PCで管理資格情報を扱わないことで、フィッシングやマルウェア感染した汎用端末経由での特権資格情報窃取(PtH/トークン窃取)を防ぐ。実装では、クリーンソース原則、Credential Guard、アプリケーション許可リスト(WDAC/AppLocker)、認証ポリシー・サイロによる接続先制限、専用の管理フォレスト等を組み合わせる。ジャンプサーバ(踏み台)と混同されがちだが、PAWは「管理者が操作する端末そのもの」を保護する点が本質である。",
    "points": [
      "Tier 0管理専用の隔離・強化端末",
      "一般業務(Web/メール)と管理操作を物理/論理分離",
      "Credential Guard+WDAC/AppLocker+認証サイロで多層防御",
      "踏み台と異なり管理者の操作端末自体を保護",
      "クリーンソース原則: 管理対象は同等以上の信頼端末からのみ管理"
    ],
    "related": [
      "tiermodel",
      "authpolicy",
      "credguard",
      "wdac",
      "rdp"
    ]
  },
  {
    "id": "authpolicy",
    "term": "認証ポリシー / サイロ",
    "en": "Authentication Policies & Silos",
    "aka": "Authentication Policy Silo,AllowedToAuthenticateFrom,claims",
    "cat": "soc",
    "body": "認証ポリシーと認証ポリシーサイロは、Windows Server 2012 R2以降で導入されたKerberos保護機構で、アカウントのTGT有効期間(既定短縮・非更新化)や認証元ホスト(AllowedToAuthenticateFrom条件)を制御する。サイロはユーザ・コンピュータ・サービスアカウントを束ねる論理コンテナで、アカウントへの割り当てはmsDS-AssignedAuthNPolicySilo(サイロ)/msDS-AssignedAuthNPolicy(ポリシー直付け)属性、サイロが参照する適用ポリシーはmsDS-UserAuthNPolicy/msDS-ComputerAuthNPolicy/msDS-ServiceAuthNPolicy属性に保持され、許可条件はms-DS-User(Computer/Service)-Allowed-To-Authenticate-From/ToにSDDL式で格納される。AllowedToAuthenticateFromの評価にはKerberos Armoring(FAST)が必須で、DCとクライアント両方でGPOによるarmoring/claims有効化とWin2012R2以上のドメイン機能レベルが要る。Protected Usersグループと併用し、Tier 0アカウントを特定PAW/管理ホストからのみ認証可能に制限することで資格情報の横展開を強力に抑止する。監視は監査失敗イベント4820(装甲TGTが装置制限で拒否)/4821(サービスチケットが拒否)/4822(Protected Users所属でNTLM拒否)/4823(NTLM認証が制限により拒否)と、DC運用ログのAuthentication Policy失敗イベント105(強制モード)/305(監査モード)を用いる。",
    "points": [
      "TGT有効期間(非更新)と認証元ホストを制御、要ドメイン機能レベルWin2012R2・KDC/クライアント両方でclaims/armoring(FAST)有効化",
      "割り当て属性: msDS-AssignedAuthNPolicySilo / msDS-AssignedAuthNPolicy、サイロ参照ポリシー: msDS-User(Computer/Service)AuthNPolicy",
      "許可条件はms-DS-User(Computer/Service)-Allowed-To-Authenticate-From/To(SDDL式)に格納",
      "監視: 4820(TGT拒否)/4821(サービスチケット拒否)/4822(Protected Users所属NTLM拒否)・4823(NTLM制限拒否)、DC運用ログ105(強制)/305(監査モード)",
      "Protected Users併用でTier 0を特定PAW/管理ホストからのみ認証に制限し横展開を抑止"
    ],
    "related": [
      "kerberos",
      "tgt",
      "kerbfast",
      "protectedusers",
      "tiermodel"
    ]
  },
  {
    "id": "motw",
    "term": "Mark-of-the-Web (MOTW)",
    "en": "Mark-of-the-Web",
    "aka": "MOTW, Zone.Identifier, SmartScreen, ダウンロードマーク",
    "cat": "os",
    "body": "Mark-of-the-Web (MOTW) は、ブラウザ(Edge/IE 等)やメール、SMB 経由などインターネットゾーンから取得したファイルに Windows が付与する信頼マークで、NTFS の代替データストリーム「Zone.Identifier」として書き込まれる。ストリーム内に ZoneId=3(インターネットゾーン)等が記録され、Office はこれを見て保護ビュー/マクロ既定ブロック(インターネット由来 MOTW 付きはマクロ実行不可)を、Explorer/SmartScreen は実行警告や評価判定を行う。攻撃者は ISO/IMG/VHD マウントや 7z/一部アーカイブなど MOTW を伝播しないコンテナを使ってこのマークを剥がし(MOTW bypass)、警告やマクロブロックを回避することが多い。SOC ではダウンロードファイルの Zone.Identifier 有無や ZoneId 値、SmartScreen ログが実行元・改ざんの手がかりになる。",
    "points": [
      "Zone.Identifier ADS に ZoneId を格納(0=ローカルコンピュータ, 1=ローカルイントラネット, 2=信頼済みサイト, 3=インターネット, 4=制限付きサイト)",
      "Office はインターネット由来 MOTW 付きファイルでマクロを既定ブロックし保護ビューで開く",
      "SmartScreen/Defender の評価判定に利用される信頼シグナル",
      "ISO/VHD/一部アーカイブ経由の配布は MOTW を伝播せず回避に悪用される",
      "MITRE ATT&CK T1553.005 (Subvert Trust Controls: Mark-of-the-Web Bypass)"
    ],
    "related": [
      "ads",
      "asr",
      "edr",
      "lolbin",
      "procinjection"
    ]
  },
  {
    "id": "asep",
    "term": "自動実行ポイント / Run キー",
    "en": "Autostart Extension Points / Run Keys",
    "aka": "ASEP, Run/RunOnce, Winlogon Shell/Userinit, Autoruns, startup persistence",
    "cat": "os",
    "body": "自動実行ポイント(ASEP: Autostart Extension Points)は、OS 起動時やログオン時に自動的にプログラムを実行させる多数のレジストリ/ファイルシステム上の設定箇所の総称で、マルウェアの永続化(Persistence)の主要な足場となる。代表例は HKLM/HKCU の Run/RunOnce キー、Winlogon の Shell(explorer.exe)/Userinit(userinit.exe)値、スタートアップフォルダ、Active Setup などで、これらを書き換えると再起動やログオンのたびに任意コードが起動する。Sysinternals の Autoruns/autorunsc がこれら数百の ASEP を網羅的に列挙する定番ツールであり、防御側の棚卸しに使われる。SOC では Run キーや Userinit/Shell の変更(Sysmon Event ID 13 等)を監視し、正規外の実行ファイルパスや Base64/LOLBin 起動を検知する。",
    "points": [
      "Run/RunOnce: HKLM|HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
      "Winlogon: Shell(explorer.exe)/Userinit(userinit.exe)の改ざんに注意",
      "Sysinternals Autoruns/autorunsc が網羅的に列挙",
      "MITRE ATT&CK T1547.001 (Registry Run Keys / Startup Folder)",
      "Sysmon Event ID 12/13/14 でレジストリ改変を監視"
    ],
    "related": [
      "registry",
      "ifeo",
      "schtask",
      "lolbin",
      "sysmon"
    ]
  },
  {
    "id": "ads",
    "term": "代替データストリーム (ADS)",
    "en": "Alternate Data Streams",
    "aka": "NTFS ADS, Zone.Identifier, file:stream, dir /R",
    "cat": "os",
    "body": "代替データストリーム(ADS: Alternate Data Streams)は NTFS がサポートするファイル機能で、1つのファイルに主データ($DATA)以外の名前付きストリーム(filename:streamname 形式)を隠して格納できる。エクスプローラのサイズ表示等には現れないため、攻撃者は実行ファイルやスクリプトを ADS に隠して永続化・防御回避に悪用する(例: file.txt:evil.exe)。MOTW の Zone.Identifier も ADS の一種であり、正規用途でも使われる。検出には dir /R、PowerShell の Get-Item -Stream、Sysinternals streams.exe を用い、Sysmon Event ID 15(FileCreateStreamHash)で ADS 生成を監視できる。",
    "points": [
      "構文: ファイル名:ストリーム名(例 file.txt:hidden)、主データは ::$DATA",
      "dir /R, Get-Item -Stream *, streams.exe で列挙",
      "Zone.Identifier(MOTW)も ADS として格納される",
      "Sysmon Event ID 15 (FileCreateStreamHash) で監視",
      "MITRE ATT&CK T1564.004 (Hide Artifacts: NTFS File Attributes)"
    ],
    "related": [
      "motw",
      "registry",
      "sysmon",
      "lolbin",
      "ifeo"
    ]
  },
  {
    "id": "ifeo",
    "term": "Image File Execution Options (IFEO)",
    "en": "Image File Execution Options",
    "aka": "IFEO, Debugger value, GlobalFlag, SilentProcessExit, 常駐化",
    "cat": "os",
    "body": "Image File Execution Options(IFEO)は、実行ファイル単位でデバッガ起動やヒープ検証等のオプションを指定できる Windows のレジストリ機構で、本来はデバッグ用途だが永続化・実行乗っ取りに悪用される。IFEO キー(HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\<実行ファイル名>)に Debugger 値を設定すると、その実行ファイルの起動時に指定プログラムがデバッガとして代わりに起動する(例: sethc.exe に cmd.exe を割り当てるアクセシビリティ悪用)。もう一つの手口が SilentProcessExit で、GlobalFlag=0x200 と SilentProcessExit\\<対象>\\MonitorProcess を設定すると、対象プロセス終了時に WerFault.exe を親として任意プロセスが起動する。SOC ではこれらキーの生成・変更(Sysmon Event ID 12/13)と WerFault.exe を親とする不審プロセスを監視する。",
    "points": [
      "Debugger 値: HKLM\\...\\Image File Execution Options\\<exe> に設定し起動を乗っ取る",
      "SilentProcessExit: GlobalFlag=0x200 + MonitorProcess で終了時に任意起動、親は WerFault.exe",
      "アクセシビリティ機能(sethc.exe/utilman.exe)への Debugger 設定が定番の悪用",
      "MITRE ATT&CK T1546.012 (Image File Execution Options Injection)",
      "GFlags/gflags.exe や Autoruns で確認可能"
    ],
    "related": [
      "asep",
      "registry",
      "process",
      "sysmon",
      "procinjection"
    ]
  },
  {
    "id": "secureboot",
    "term": "Secure Boot / UEFI",
    "en": "Secure Boot / UEFI",
    "aka": "UEFI, Secure Boot, bootkit, DBX, ブートキット",
    "cat": "os",
    "body": "Secure Boot は UEFI ファームウェアの機能で、ブートローダやドライバのデジタル署名を検証し、署名が信頼された鍵(PK/KEK と署名 DB である db)に含まれるコードのみを起動させることで、ブートキット/ルートキットによる初期段階の改ざんを防ぐ。失効データベース dbx には既知の脆弱・悪意あるブートローダのハッシュ/署名が登録され、BlackLotus のような UEFI ブートキット対策として Microsoft が dbx 更新を配布する。攻撃者は署名済みだが脆弱なブートローダ(BYOVD 的手法)や dbx 未更新環境を突いて Secure Boot を回避しようとする。防御側は Secure Boot 有効状態、TPM による Measured Boot、dbx の最新化(CVE-2023-24932 の緩和 KB5025885 等)を確認する。",
    "points": [
      "鍵階層: PK(Platform Key)→ KEK → db(許可)/ dbx(失効)",
      "dbx は失効した脆弱ブートローダのハッシュ/署名を登録",
      "BlackLotus 等 UEFI ブートキットへの対策として dbx 更新が重要",
      "Measured Boot は TPM の PCR に測定値を記録しリモート認証に利用",
      "BYOVD 的に署名済み脆弱ブートローダを悪用する回避手法が存在"
    ],
    "related": [
      "byovd",
      "ppl",
      "credguard",
      "wdac",
      "edr"
    ]
  },
  {
    "id": "netlogon",
    "term": "Netlogon セキュアチャネル (MS-NRPC)",
    "en": "Netlogon Secure Channel (MS-NRPC)",
    "aka": "Netlogon, MS-NRPC, machine account password, Zerologon CVE-2020-1472",
    "cat": "auth",
    "body": "Netlogon セキュアチャネル(MS-NRPC)は、ドメイン参加コンピュータと DC の間で確立される認証済み通信路で、マシンアカウントのパスワードを共有鍵として NTLM パススルー認証やマシンパスワード変更、DC 間の複製認証などに使われる。CVE-2020-1472(Zerologon)は、この認証で AES-CFB8 の初期化ベクトル(IV)が全ゼロ固定になっている実装欠陥を突き、約1/256の確率で全ゼロ平文が全ゼロ暗号文になる性質を利用して認証を回避し、任意のマシンアカウント(DC 自身を含む)のパスワードを空に設定できる致命的な特権昇格脆弱性である。これにより攻撃者は DC を乗っ取り DCSync 等でドメイン全体を侵害できる。SOC では Event ID 4742/5805、脆弱な(署名/封印なし)Netlogon 接続、マシンアカウントの異常なパスワードリセットを監視する。",
    "points": [
      "共有鍵はマシンアカウントのパスワード(NTLM ベースのセッション鍵導出)",
      "CVE-2020-1472 Zerologon: AES-CFB8 の IV 全ゼロ欠陥、約1/256で認証回避",
      "攻撃はマシン(DC 含む)のパスワードを空文字にリセット→ドメイン乗っ取り",
      "MITRE ATT&CK T1210/T1068、後続で DCSync (T1003.006)",
      "監視: Event ID 4742(アカウント変更)/5805、脆弱チャネル接続の強制署名(EnforcementMode)"
    ],
    "related": [
      "machineacct",
      "dcsync",
      "ntlm",
      "dc",
      "replication",
      "zerologon"
    ]
  },
  {
    "id": "kcdattr",
    "term": "msDS-AllowedToDelegateTo (従来型制約付き委任属性)",
    "en": "msDS-AllowedToDelegateTo (Classic Constrained Delegation Attribute)",
    "aka": "KCD, allowedToDelegateTo, SPNリスト",
    "cat": "auth",
    "body": "msDS-AllowedToDelegateTo は、従来型(Kerberos)制約付き委任(KCD)を構成する AD 属性で、あるサービスアカウントが「委任を許可される対象サービスの SPN リスト」を保持する。この属性が設定され、かつアカウントの UAC フラグに TrustedToAuthForDelegation(protocol transition)が立つと、そのアカウントは S4U2Self でクライアントのチケットを取得し、S4U2Proxy でリストされた SPN に対して任意ユーザーになりすましてアクセスできる。攻撃者はこの属性への書き込み権(または SPN のサービス種別が S4U2Proxy で検証されない点)を悪用し、例えば HTTP/CIFS SPN 経由で LDAP や HOST 等の他サービスへ横展開する。SOC では特権外アカウントの msDS-AllowedToDelegateTo 設定変更、TrustedToAuthForDelegation の付与、S4U 関連の異常なチケット要求を監視する。",
    "points": [
      "委任先 SPN のホワイトリストを保持(従来型 KCD の中核属性)",
      "TrustedToAuthForDelegation(protocol transition)有効時は S4U2Self+S4U2Proxy で任意ユーザーになりすまし可",
      "SPN のサービス種別部分は検証されないため CIFS→HOST/LDAP 等へ転用され横展開に悪用",
      "対比: RBCD は msDS-AllowedToActOnBehalfOfOtherIdentity(委任先=リソース側で設定)",
      "MITRE ATT&CK T1558/T1550.003(Pass the Ticket)周辺、監視は Event ID 4769(S4U パターン)、BloodHound で委任経路を可視化"
    ],
    "related": [
      "delegation",
      "s4u",
      "spn",
      "uacflags",
      "rbcdattr"
    ]
  },
  {
    "id": "crl",
    "term": "証明書失効 (CRL / OCSP)",
    "en": "Certificate Revocation (CRL / OCSP)",
    "aka": "CRL, OCSP, 失効リスト, CDP, AIA",
    "cat": "pki",
    "body": "証明書失効(Certificate Revocation)は、有効期限前に危殆化・誤発行された証明書を無効化する仕組みで、CRL(Certificate Revocation List: CA が署名した失効シリアル番号のリスト)と OCSP(Online Certificate Status Protocol: 個別証明書の失効状態をリアルタイム問い合わせ)の2方式がある。検証者は証明書内の CDP 拡張(CRL 配布点 URL)や AIA 拡張(OCSP レスポンダ/上位 CA 証明書の URL)を辿って失効状態を確認する。AD CS 環境では、攻撃者が不正発行した証明書(ESC 系や Golden Certificate)を失効させて封じ込める運用が重要だが、多くのクライアントは失効チェックを厳格に強制しない(ソフトフェイル)ため、失効だけでは即時無効化にならない点に注意が要る。特に Golden Certificate は CA 秘密鍵で偽造され CA の DB に記録されないため、個別失効では対処できず CA 鍵の入れ替えが必要になる。SOC/IR では CA の失効操作、CRL の配布可用性、OCSP レスポンダの応答を監視・確保する。",
    "points": [
      "CRL: CA 署名の失効シリアル一覧、CDP 拡張の URL から取得",
      "OCSP: 個別証明書の状態をリアルタイム問い合わせ、AIA 拡張に URL",
      "証明書は CDP(CRL) と AIA(OCSP/上位 CA) の拡張で検証経路を指示",
      "多くのクライアントはソフトフェイル(失効情報取得不可でも許可)で回避余地あり",
      "AD CS 侵害(ESC/Golden Certificate)対応での封じ込め手段、ただし失効だけでは不十分(Golden Certificate は CA 鍵入れ替えが必要)"
    ],
    "related": [
      "adcs",
      "ca",
      "pki",
      "template",
      "goldencert"
    ]
  },
  {
    "id": "enrollep",
    "term": "証明書登録エンドポイント (Web登録 / NDES / CES-CEP)",
    "en": "Certificate Enrollment Endpoints (Web Enrollment / NDES / CES-CEP)",
    "aka": "certsrv, HTTP enrollment, NDES, ESC8, ESC11",
    "cat": "pki",
    "body": "AD CS の証明書登録を受け付けるネットワークインターフェース群で、IIS上のWeb登録(certsrv、/certsrv/certfnsh.asp)、NDES(Network Device Enrollment Service、SCEPを実装しネットワーク機器向け登録を代理)、およびMS-WSTEP/MS-XCEPベースのCES-CEP(証明書登録Web Service/証明書登録ポリシーWeb Service)を含む。これらのHTTPおよびRPCエンドポイントが署名/暗号化やEPA(チャネルバインディング)を強制しない場合、ドメイン内のNTLM認証を中継して被害者になりすました証明書を要求できる。Web登録へのHTTPリレーがESC8、ICertPassage(MS-ICPR)RPCインターフェースへのリレーがESC11として知られ、いずれもマシンアカウント等を強制認証させ、発行された証明書でPKINIT/DCSyncへ繋げる攻撃経路となる。",
    "points": [
      "ESC8=HTTP Web登録へのNTLMリレー、ESC11=MS-ICPR RPC(ICertPassage)へのリレー",
      "対策: HTTPS+EPA強制、NTLM無効化、CAのInterfaceFlagsでIF_ENFORCEENCRYPTICERTREQUEST(RPC暗号化)強制",
      "NDESはSCEPを実装しネットワーク機器向け登録を代理、悪用でテンプレート乱用に繋がる",
      "ツール: Certipy relay, ntlmrelayx; Defender for Identityが未署名/未暗号化エンドポイントを評価"
    ],
    "related": [
      "adcs",
      "ca",
      "template",
      "ntlmrelay",
      "coercion"
    ]
  },
  {
    "id": "entraroles",
    "term": "Entra ディレクトリロール",
    "en": "Entra Directory Roles (Global Admin, etc.)",
    "aka": "Global Administrator, Privileged Role Administrator, Application/User Administrator, directory role",
    "cat": "cloud",
    "body": "Microsoft Entra ID(旧Azure AD)のディレクトリロールで、テナント全体のID・アプリ・デバイス管理権限を付与する。最上位のGlobal Administrator(ロールテンプレートID 62e90394-69f5-4237-9190-012177145e10)は全操作が可能で、Privileged Role Administratorはロール割り当てを制御でき、Application/User Administratorなども高権限に該当する。Application Administratorやアプリ所有者は資格情報を追加してサービスプリンシパルになりすませるため、Global Adminへの水平/垂直特権昇格の起点となり、PIMによるJIT化と監視が重要。",
    "points": [
      "Global Administrator ロールテンプレートID: 62e90394-69f5-4237-9190-012177145e10",
      "Privileged Role Administratorはロール付与を操作でき実質GAへ昇格可能",
      "Application/User Administratorはアプリ資格情報追加やパスワードリセットで悪用可能",
      "Azure RBAC(リソース権限)とは別レイヤ; PIMでJIT化・PowerShell/Graphで列挙"
    ],
    "related": [
      "entra",
      "tenant",
      "azurerbac",
      "graphapi",
      "pim",
      "gdap"
    ]
  },
  {
    "id": "azurerbac",
    "term": "Azure RBAC (リソースロール)",
    "en": "Azure RBAC (Resource Roles)",
    "aka": "Owner, Contributor, User Access Administrator, Azure Resource Manager, control plane vs data plane",
    "cat": "cloud",
    "body": "Azure Resource Manager(ARM)配下のサブスクリプション/リソースグループ/リソースに対する権限モデルで、ロール定義・スコープ・プリンシパルの3要素からなるロール割り当てで制御する。Ownerは全操作+ロール割り当て、Contributorは管理操作可能だがロール割り当て不可、User Access Administratorは権限付与のみ可能でOwnerへ昇格し得る。コントロールプレーン(ARM API)とデータプレーン(ストレージ/Key Vault等の中身)は別権限で、Entraディレクトリロールとも独立するため、両者を跨いだ横移動やマネージドID悪用が攻撃の焦点となる。",
    "points": [
      "Owner=全権+ロール割当、Contributor=ロール割当不可、User Access Administrator=権限付与のみ",
      "コントロールプレーン(management.azure.com/ARM)とデータプレーンは分離",
      "Entraディレクトリロールとは別体系; GA→Azure RBACはElevate Accessで奪取可能",
      "VM実行コマンドやマネージドIDトークン窃取で横移動; azure-hound等で列挙"
    ],
    "related": [
      "entra",
      "entraroles",
      "keyvault",
      "imds",
      "graphapi"
    ]
  },
  {
    "id": "graphapi",
    "term": "Microsoft Graph API / アクセス許可",
    "en": "Microsoft Graph API / Permissions",
    "aka": "application vs delegated permissions, RoleManagement.ReadWrite.Directory, Graph scopes, app roles",
    "cat": "cloud",
    "body": "Microsoft Graph(graph.microsoft.com)はEntra ID・M365リソースを操作する統一REST APIで、アクセスはOAuth 2.0スコープ(アクセス許可)で制御される。ユーザー委任(delegated、サインインユーザーの権限に制約)とアプリケーション許可(サインイン不要でアプリ自身の広範な権限)があり、後者はテナント管理者の同意を要する。RoleManagement.ReadWrite.DirectoryやAppRoleAssignment.ReadWrite.All、Directory.ReadWrite.All等の危険なアプリ許可を持つサービスプリンシパルは、自身にディレクトリロールやアプリ許可を付与してGlobal Adminへ昇格できるため、アプリ資格情報の追加が主要な攻撃経路となる。",
    "points": [
      "委任(delegated)=ユーザー権限に制約、アプリ許可(application)=アプリ自身の権限で強力",
      "RoleManagement.ReadWrite.Directoryはロール付与可能→GAへ特権昇格",
      "AppRoleAssignment.ReadWrite.Allは任意の危険なアプリ許可を自付与可能",
      "app rolesは管理者同意で付与; 不正同意(illicit consent)フィッシングで奪取"
    ],
    "related": [
      "entra",
      "sp",
      "oauth",
      "illicitconsent",
      "tokens"
    ]
  },
  {
    "id": "keyvault",
    "term": "Azure Key Vault",
    "en": "Azure Key Vault",
    "aka": "Key Vault, secrets/keys/certificates, access policy, RBAC data plane",
    "cat": "cloud",
    "body": "Azure Key Vaultはシークレット・暗号鍵・証明書を保管するクラウドHSM/ソフトウェアストアで、コントロールプレーン(Vault自体の管理はAzure RBAC)とデータプレーン(格納物へのアクセス)が分かれる。データプレーンの認可はレガシーのVaultアクセスポリシーとRBAC(Key Vault Administrator/Key Vault Secrets User等のロール)の2方式があり、アクセスポリシーは細粒度が粗く昇格に悪用されやすい。VMやアプリのマネージドIDがVaultへのGet/List権限を持つ場合、IMDS経由でトークンを得て資格情報・接続文字列を窃取でき、横移動・特権昇格の重要標的となる。",
    "points": [
      "2つの認可モデル: Vaultアクセスポリシー(レガシー)とAzure RBAC",
      "保管対象: secrets/keys/certificates; Key Vault Administratorロールは全操作",
      "コントロールプレーンでポリシー/RBAC書換→データ窃取が可能",
      "マネージドID+IMDSトークンでシークレット取得; 診断ログ/監査で検知"
    ],
    "related": [
      "azurerbac",
      "imds",
      "dpapi",
      "tenant",
      "entra"
    ]
  },
  {
    "id": "b2bguest",
    "term": "ゲスト / B2B 外部ID",
    "en": "Guest / B2B External Identity",
    "aka": "guest user, B2B collaboration, external identities, #EXT#, cross-tenant access settings",
    "cat": "cloud",
    "body": "Entra IDのB2Bコラボレーション機能で招待される外部テナントのユーザーで、ホームテナントで認証しつつ招待先テナントのゲストオブジェクトとして表される。UPNは通常 元メールアドレスの@を_に置換した文字列に #EXT#@<テナント>.onmicrosoft.com を付した形式を取り、既定ではディレクトリの限定的な読み取りが可能だが、設定不備でグループやアプリの過剰な列挙・所有が起きうる。クロステナントアクセス設定(inbound/outbound)や既定のゲスト権限を絞らないと、外部ユーザーによる偵察・アプリ悪用・特権昇格の足がかりとなり、招待とゲスト権限の監査が重要。",
    "points": [
      "ゲストUPN形式: <元アドレスの@を_に置換>#EXT#@<tenant>.onmicrosoft.com",
      "既定ゲスト権限で限定的なディレクトリ読取が可能→偵察に悪用",
      "クロステナントアクセス設定(inbound/outbound)で信頼範囲を制御",
      "招待者権限やゲストのアプリ/グループ所有を監査; BloodHound等で列挙"
    ],
    "related": [
      "entra",
      "tenant",
      "principal",
      "condaccess",
      "graphapi"
    ]
  },
  {
    "id": "ev4688",
    "term": "プロセス作成イベント (4688) / コマンドライン監査",
    "en": "Process Creation (4688) / Command-line Auditing",
    "aka": "Event ID 4688, Include command line in process creation events, Audit Process Creation",
    "cat": "logging",
    "body": "Windowsセキュリティログのイベント4688はプロセス作成を記録し、新規プロセス名・プロセスID・親プロセス情報・トークン昇格種別を含む。既定ではコマンドライン引数は記録されず、GPO「プロセス作成イベントにコマンドラインを含める」(レジストリ ProcessCreationIncludeCmdLine_Enabled)を有効化して初めてコマンドライン監査が可能になる。LOLBinsや難読化PowerShell、横移動の検知に不可欠で、親子プロセス関係と併せてEDR/Sysmon Event ID 1と相補的に用いられSIEMでの脅威ハンティングの基盤となる。",
    "points": [
      "Event ID 4688=プロセス作成、4689=プロセス終了; 「監査プロセス作成」を有効化",
      "コマンドラインはProcessCreationIncludeCmdLine_Enabled(GPO)で有効化が必要",
      "新プロセス名・親プロセスID・トークン昇格タイプを記録",
      "Sysmon Event ID 1が親ハッシュ等でより詳細; LOLBin/難読化検知に活用"
    ],
    "related": [
      "eventlog",
      "auditpolicy",
      "sysmon",
      "lolbin",
      "pslogging"
    ]
  },
  {
    "id": "authevents",
    "term": "認証イベント (4768/4769/4771/4776)",
    "en": "Authentication Events (Kerberos/NTLM)",
    "aka": "4768 TGT, 4769 service ticket, 4771 pre-auth fail, 4776 NTLM, account logon events",
    "cat": "logging",
    "body": "ドメインコントローラの認証イベント群で、4768はKerberos AS-REQ(TGT発行)、4769はTGS-REQ(サービスチケット発行)、4771はKerberos事前認証失敗、4776はNTLM資格情報検証を記録する。4769はチケット暗号化種別0x17(RC4-HMAC)や大量要求でKerberoastingを、4768/4771の失敗連発(失敗コード0x18=KDC_ERR_PREAUTH_FAILED、実質パスワード誤り)でAS-REPロースト試行やパスワードスプレーを検知できる。4776は失敗コード(0xC0000064=不明ユーザー、0xC000006A=不正パスワード)でNTLMブルートフォースを示し、これらの相関分析が資格情報攻撃検知の要となる。",
    "points": [
      "4768=TGT(AS-REQ)、4769=サービスチケット(TGS-REQ)、4771=事前認証失敗、4776=NTLM検証",
      "4769で暗号化種別0x17(RC4)を狙うとKerberoasting検知の指標",
      "4771失敗コード0x18=KDC_ERR_PREAUTH_FAILED(パスワード誤り)→スプレー/ブルートフォース",
      "4776失敗: 0xC0000064=不明ユーザー、0xC000006A=不正パスワード"
    ],
    "related": [
      "kerberos",
      "kdc",
      "tgt",
      "kerberoast",
      "passwordspray",
      "logonevents",
      "kdcerrcode"
    ]
  },
  {
    "id": "shimcache",
    "term": "AppCompatCache (Shimcache)",
    "en": "AppCompatCache (Shimcache)",
    "aka": "Shimcache, AppCompatCache, ShimCacheParser, 実行痕跡",
    "cat": "logging",
    "body": "AppCompatCache（通称Shimcache）は、アプリケーション互換性シム機構の一部としてWindowsが記録する実行痕跡アーティファクトで、SYSTEMレジストリハイブの「SYSTEM\\CurrentControlSet\\Control\\Session Manager\\AppCompatCache」に格納される。各エントリはファイルフルパスと$STANDARD_INFORMATIONの最終更新日時（実行時刻ではない点に注意）を保持し、エントリは概ね最近アクセス・登録された順に並ぶため、フォレンジックでの相対的タイムライン再構成に有用である。キャッシュはメモリ上に保持され原則シャットダウン時にレジストリへ書き出されるため稼働中のメモリ値と差異が生じる。またWin7までは実行を示すInsertFlagがあったが、Win8以降で撤廃され（EZのAppCompatCacheParserでも実行データはNA表示）、Win10/11では単独では実行の証明にならず存在・認識の痕跡として扱う。",
    "points": [
      "格納先: SYSTEMハイブ ControlSet...\\Session Manager\\AppCompatCache",
      "タイムスタンプはファイル最終更新日時であり実行時刻ではない",
      "原則シャットダウン時にレジストリへ書き出される（生存中はメモリ上）",
      "Win8以降は実行フラグが撤廃され実行の証明には使えない",
      "解析: AppCompatCacheParser。シム機構悪用の永続化はT1546.011（それ自体は技術IDでなくDFIR痕跡）"
    ],
    "related": [
      "amcache",
      "prefetch",
      "registry",
      "threathunting",
      "iocioa"
    ]
  },
  {
    "id": "amcache",
    "term": "Amcache",
    "en": "Amcache",
    "aka": "Amcache.hve, InventoryApplicationFile, SHA1, 実行痕跡",
    "cat": "logging",
    "body": "Amcacheは、システム上に存在・登録された実行ファイルのメタデータをレジストリハイブ形式「C:\\Windows\\AppCompat\\Programs\\Amcache.hve」に記録するフォレンジックアーティファクトである。InventoryApplicationFileキー配下の各サブキーに、ファイルのSHA-1ハッシュ（FileID値=『0000』+40桁hexで、先頭4文字の0000を除去してSHA-1として解釈。先頭31MiBのSHA-1）、フルパス（LowerCaseLongPath）、サイズ、PEヘッダのコンパイル日時（LinkDate）などが保持され、既知マルウェアのハッシュ照合や不審バイナリの特定に極めて有用である。ただしAmcacheはファイルの存在・登録を示すもので実行を確定するものではないため、Prefetch・Shimcache・イベントログと突き合わせて実行有無を確定させるのが定石である。",
    "points": [
      "格納先: C:\\Windows\\AppCompat\\Programs\\Amcache.hve",
      "InventoryApplicationFileにSHA-1・パス・サイズ・LinkDateを記録",
      "FileID=『0000』+SHA-1、先頭4文字を除去して照合",
      "解析ツール: AmcacheParser（Eric Zimmerman）",
      "存在の痕跡であり実行確定には他アーティファクトとの相関が必要"
    ],
    "related": [
      "shimcache",
      "prefetch",
      "registry",
      "threathunting",
      "iocioa"
    ]
  },
  {
    "id": "prefetch",
    "term": "Prefetch",
    "en": "Prefetch",
    "aka": "*.pf, Prefetch, run count, last run time, PECmd",
    "cat": "logging",
    "body": "Prefetchは、アプリ起動高速化のためWindowsが生成するキャッシュファイル（C:\\Windows\\Prefetch\\<実行ファイル名>-<パスのハッシュ>.pf）で、実行の強力な証拠となる貴重なフォレンジックアーティファクトである。各.pfには実行回数（run count）、直近の実行時刻（Win8以降は最大8回分）、起動時に参照されたファイル・ディレクトリ一覧が含まれ、いつ・何回・どこから実行されたかの再構成に使える。同名バイナリでもパスが異なればハッシュが変わるため別エントリとなり、ファイル数上限はWin8以降で1024、XP〜Win7で128である。動作はレジストリHKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management\\PrefetchParameters の EnablePrefetcher（0=無効/1=アプリのみ/2=ブートのみ/3=両方、クライアントOSは既定3）で制御され、値0への改変はアンチフォレンジックの痕跡となる。重要な注意点として、Windows Serverは既定値2（ブートのみ＝アプリ実行時のPrefetchは生成されない）のため、.pfの不在は非実行の証明にならない。Win10/11では.pf自体がMAMコンテナ内でXPRESS Huffman（COMPRESSION_FORMAT_XPRESS_HUFF, 0x0004）圧縮されており、PECmd等で解凍・解析する。",
    "points": [
      "配置: C:\\Windows\\Prefetch\\NAME-HASH.pf、実行の強力な証拠",
      "制御レジストリ: ...\\Memory Management\\PrefetchParameters\\EnablePrefetcher（クライアント既定3、0=無効化=改ざん痕跡）",
      "Windows Serverは既定値2(ブートのみ/アプリPrefetch無効) → .pf不在=非実行ではない点に注意",
      "実行回数と直近実行時刻（Win8+で最大8件）、上限 Win8+ 1024 / XP〜7 128",
      "Win10/11はMAMコンテナ内でXPRESS Huffman(0x0004)圧縮、解析はPECmd(Eric Zimmerman)"
    ],
    "related": [
      "shimcache",
      "amcache",
      "threathunting",
      "iocioa",
      "lolbin",
      "userart",
      "ntfsart"
    ]
  },
  {
    "id": "dllhijack",
    "term": "DLLハイジャック / サイドローディング",
    "en": "DLL Search-Order Hijacking / Sideloading",
    "aka": "DLL search-order hijacking, phantom DLL, DLL sideloading, proxy DLL",
    "cat": "prim",
    "body": "DLLハイジャック／サイドローディングは、正規プロセスがロードするDLLの検索順序や不在を悪用し、攻撃者のDLLを先に読み込ませて任意コードを正規署名済みプロセスのコンテキストで実行させる手法である。SafeDllSearchMode有効（既定）時の標準検索順序は、(1)既にメモリにロード済みのDLL →(2)KnownDLLs（HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\KnownDLLs 登録分）→(3)実行ファイルのディレクトリ →(4)システムディレクトリ(System32)→(5)16bitシステムディレクトリ(System)→(6)Windowsディレクトリ →(7)カレントディレクトリ(CWD)→(8)PATH環境変数、の順で、攻撃者は(3)以降の書込可能ディレクトリに悪性DLLを植える。代表的な亜種に、検索順序ハイジャック、本来存在しないDLL名を突く幻DLL（phantom/ghost DLL）、正規署名済みEXEに攻撃DLLを同梱ディレクトリから読み込ませるサイドローディング、正規DLLへエクスポートを転送するプロキシDLLがある。SafeDllSearchMode（HKLM\\System\\CurrentControlSet\\Control\\Session Manager\\SafeDllSearchMode を0で無効化するとCWDが前方に繰り上がる）やKnownDLLsが保護となるが、多くのLOLBin/署名バイナリが悪用可能で、EDR回避や永続化に用いられる（MITRE ATT&CK T1574.001/002）。",
    "points": [
      "検索順序(Safe有効): メモリ→KnownDLLs→アプリDir→System32→System(16bit)→Windows→CWD→PATH",
      "攻撃点はアプリDir以降の書込可能ディレクトリへの悪性DLL植込み(binary planting)",
      "亜種: search-order / phantom(ghost) / sideloading / proxy DLL",
      "緩和: KnownDLLsレジストリ登録、SafeDllSearchMode=1(既定/CWD降格)、完全パス指定ロード",
      "MITRE ATT&CK: T1574.001（検索順序）/ T1574.002（サイドロード）、proxy DLLは正規DLLへエクスポート転送"
    ],
    "related": [
      "lolbin",
      "asep",
      "procinjection",
      "motw",
      "byovd",
      "dll"
    ]
  },
  {
    "id": "spcredadd",
    "term": "SPへの資格情報追加 (アプリ乗っ取り)",
    "en": "Service Principal Credential Abuse",
    "aka": "Additional Cloud Credentials, addPassword/addKey, app registration hijack, T1098.001",
    "cat": "prim",
    "body": "SPへの資格情報追加は、Entra ID（Azure AD）のサービスプリンシパルまたはアプリ登録に、攻撃者が独自のシークレット（パスワード）や証明書（キー）を追加し、そのアプリが持つAPI権限・ロールを乗っ取って永続化・権限昇格を図る手法である。Microsoft GraphのservicePrincipal:addPassword／addKey（PowerShellではAdd-MgServicePrincipalPassword／Add-MgServicePrincipalKey）で実行され、既存アプリに新たな認証手段を紐付けるため元の資格情報を盗む必要がなく、追加されたクレデンシャルで正規アプリとしてトークンを取得できる。Application AdministratorやCloud Application Administratorロールがあれば悪用可能で、APT29がSolarWinds（Solorigate）事件で悪用したことで知られる（MITRE ATT&CK T1098.001）。",
    "points": [
      "Graph API: servicePrincipal:addPassword / addKey で資格情報を追加",
      "MITRE ATT&CK: T1098.001（Additional Cloud Credentials）",
      "Application/Cloud Application Administratorロールで悪用可能",
      "APT29がSolorigate攻撃で使用した永続化手法",
      "監視: AuditLogsのAdd service principal credentials / Update application"
    ],
    "related": [
      "entra",
      "sp",
      "oauth",
      "graphapi",
      "illicitconsent"
    ]
  },
  {
    "id": "bloodhound",
    "term": "BloodHound / SharpHound（AD攻撃経路列挙）",
    "en": "BloodHound / SharpHound",
    "aka": "attack path enumeration, AD attack graph, SharpHound collector, ADExplorer, Cypher",
    "cat": "prim",
    "body": "BloodHoundは、Active Directory／Entra IDの攻撃経路をグラフ理論で可視化する列挙ツールで、収集エージェントSharpHound（Azure向けはAzureHound）がLDAP・SAMR・SMB等を通じてユーザー・グループ・ACL・セッション・信頼関係などを収集し、Neo4jグラフDBに取り込む。攻撃者・レッドチームはCypherクエリで「任意の侵害済みノードからDomain Adminへの最短経路」を算出でき、GenericAll・WriteDacl・AddMember・HasSession・AdminToといったエッジ（権限関係）を辿って権限昇格・横展開を計画する。防御側も同じグラフでTier違反や過剰委任を検出できるため、攻防双方で用いられる（現行はBloodHound Community Edition／CE）。",
    "points": [
      "収集: SharpHound（AD）/ AzureHound（Entra）、ADExplorerでオフライン収集も可",
      "バックエンドはNeo4j、Cypherで攻撃経路を照会",
      "エッジ例: GenericAll / WriteDacl / AddMember / HasSession / AdminTo",
      "代表クエリ: Domain Adminsへの最短経路（Shortest Path）",
      "攻撃経路可視化と同時に防御側の過剰権限・Tier違反監査に有用"
    ],
    "related": [
      "dacl",
      "kerberoast",
      "dcsync",
      "tiermodel",
      "threathunting",
      "discovery"
    ]
  },
  {
    "id": "diamondticket",
    "term": "Diamond / Sapphire Ticket",
    "en": "Diamond / Sapphire Ticket",
    "aka": "Diamond Ticket, Sapphire Ticket, modified legitimate PAC, stealthy forged ticket",
    "cat": "prim",
    "body": "Diamond／Sapphireチケットは、ゼロから偽造するGoldenチケットより検出困難な、次世代のKerberosチケット偽造手法である。いずれもkrbtgtアカウントのキー（ハッシュ）を必要とするが、正規のTGTをKDCから実際に取得して復号し、そのPACを改変して再暗号化する点で共通する。Diamondチケットは取得した正規TGTのPACに直接特権グループSID等を追加・改変する方式で、Sapphireチケットはさらに巧妙に、S4U2self＋U2Uトリックで高権限ユーザーの正規PACを入手し、それを自分の正規TGTのPACと差し替える。結果として正規要素の組み合わせと標準的なチケット要求フローになるため、Golden/Silverの中で最も検出が難しい部類とされる。",
    "points": [
      "前提: krbtgtキーが必要（Goldenと同様）",
      "Golden=完全偽造に対し、Diamond/Sapphire=正規TGTを復号しPACを改変",
      "Diamond: 正規PACにSID等を追加改変／Sapphire: S4U2self+U2Uで高権限PACを差し替え",
      "正規要素の組合せで最も検出困難、Rubeus等が対応",
      "対策: PAC検証(pacvalidation)、krbtgt定期二重ローテーション"
    ],
    "related": [
      "goldenticket",
      "krbtgt",
      "pac",
      "silverticket",
      "kerberos",
      "u2u"
    ]
  },
  {
    "id": "badsuccessor",
    "term": "BadSuccessor (dMSA 委任乗っ取り)",
    "en": "BadSuccessor (dMSA Migration Abuse)",
    "aka": "msDS-ManagedAccountPrecededByLink, dMSA privesc",
    "cat": "prim",
    "body": "BadSuccessorは、Windows Server 2025で導入された委任管理サービスアカウント（dMSA）の移行機構の設計上の欠陥を突く権限昇格手法で、Akamaiの研究者Yuval Gordonが2025年5月に公表した。dMSAが認証する際、KDCは属性msDS-ManagedAccountPrecededByLinkが指す『移行元』アカウントのSIDを用いてPACを構築するため、攻撃者がこのリンクをDomain Admin等の高権限ユーザーに設定すると、KDCが正当な移行とみなしてdMSAに移行元の全権限を継承させてしまう。OUに対するCreateChild（子オブジェクト作成）権限さえあればdMSAを新規作成してこの攻撃が成立し、DCSync相当の権限奪取に至るため影響が大きい（Akamaiは調査環境の91%に悪用可能なOUがあったと報告）。MicrosoftはCVE-2025-53779として2025年8月Patch Tuesdayで修正した（一方向リンクを無効化し双方向のペアリングを要求）。",
    "points": [
      "対象: Windows Server 2025のdMSA（委任管理サービスアカウント）",
      "鍵となる属性: msDS-ManagedAccountPrecededByLink（PAC継承を制御）",
      "前提権限: OUに対するCreateChild権限のみでDomain Admin相当を奪取可能",
      "公表: Akamai(Yuval Gordon)2025年5月、CVE-2025-53779として2025年8月Patch Tuesdayで修正",
      "監視: dMSA作成とmsDS-ManagedAccountPrecededByLink変更を監査"
    ],
    "related": [
      "gmsa",
      "kdsrootkey",
      "dcsync",
      "kerberos",
      "pac"
    ]
  },
  {
    "id": "mfafatigue",
    "term": "MFA 疲労攻撃 (プッシュ爆撃)",
    "en": "MFA Fatigue (Push Bombing)",
    "aka": "MFA prompt bombing, push bombing, number matching, MFA spamming",
    "cat": "prim",
    "body": "MFA疲労攻撃（プッシュ爆撃）は、攻撃者が窃取済みの正規パスワードで繰り返しサインインを試み、被害者のスマートフォンに大量のMFAプッシュ承認通知を送りつけて、根負けや誤操作による「承認」を誘発する手法。単純な承認/拒否型のプッシュMFA（Microsoft Authenticator旧仕様、Duo Push、Okta Verify等）が標的となり、成功すれば正規MFAを突破してセッションを確立できる。MITRE ATT&CKではT1621（Multi-Factor Authentication Request Generation）に該当し、2022年9月のUber侵害（Lapsus$の関係者「Tea Pot」）が代表事例。対策として番号照合（number matching）が有効で、Microsoftは2023年5月8日にAuthenticatorのプッシュ通知全体でテナント横断的に強制有効化した。",
    "points": [
      "MITRE ATT&CK T1621（MFA Request Generation）",
      "番号照合(number matching)がMicrosoft Authenticatorで2023年5月8日にテナント横断で強制有効化された有効な緩和策",
      "短時間の大量MFA拒否イベントや連続サインイン試行が検知の指標",
      "フィッシング耐性MFA(FIDO2)への移行が根本対策",
      "代表事例: 2022年9月Uber侵害(Lapsus$関係者「Tea Pot」)"
    ],
    "related": [
      "passwordspray",
      "condaccess",
      "fido2",
      "entraidp",
      "aitm",
      "phishing"
    ]
  },
  {
    "id": "gpoabuse",
    "term": "GPO悪用（グループポリシー悪用）",
    "en": "GPO Abuse",
    "aka": "SharpGPOAbuse, gPLink abuse, immediate scheduled task via GPO, GPO privilege escalation",
    "cat": "prim",
    "body": "GPO悪用は、攻撃者が書き込み可能なグループポリシーオブジェクト（GPO）のACLを悪用し、そのGPOがリンクされたOU配下の全コンピュータ/ユーザーに任意のコード実行や設定変更を配布する権限昇格・横展開手法。SharpGPOAbuse等のツールは、SYSVOL内のGPOファイルに「即時スケジュールタスク（Immediate Scheduled Task）」を書き込み、同時にLDAP上のgPCMachineExtensionNames属性とversionNumberを更新して、クライアントのgpupdate時にポリシー再適用と即時実行を強制する。gPLink属性を書き換えて悪意あるGPOを新たなコンテナにリンクする亜種もある。ドメイン全体に影響しうるため、GPOやOUへのWrite権限の棚卸しが重要。",
    "points": [
      "ツール: SharpGPOAbuse、PowerView、GPOddity(NTLMリレー経由)",
      "即時スケジュールタスクがSYSVOLに書き込まれ最速のコード実行手段",
      "要更新属性: gPCMachineExtensionNames / versionNumber / gPLink",
      "検知: DSアクセス監査 Event ID 5136(ディレクトリオブジェクト変更)",
      "BloodHoundでGPO書き込み可能な攻撃パスを可視化"
    ],
    "related": [
      "gpo",
      "gpp",
      "schtask",
      "dacl",
      "sysvol"
    ]
  },
  {
    "id": "etwbypass",
    "term": "ETWパッチング（ETWバイパス）",
    "en": "ETW Patching / ETW Bypass",
    "aka": "EtwEventWrite patch, ETW blinding, telemetry tampering, ntdll ETW patch",
    "cat": "prim",
    "body": "ETWパッチング（ETWバイパス）は、Event Tracing for Windows（ETW）のイベント書き込み経路を自プロセスのメモリ上で無効化し、EDR/アンチマルウェアが依存するテレメトリを「盲目化」する防御回避手法。典型的には、ntdll.dll内のEtwEventWrite（最終的にシステムコールNtTraceEventを呼ぶ）の先頭バイトを、即時復帰する命令（RET, 0xC3）やxor eax,eax; retに書き換え、常に成功(0)を返させてイベント生成を抑止する。.NET CLRのETWプロバイダやAMSIと組み合わせて悪用され、in-memoryパッチのためディスク上の痕跡は残りにくい。近年のEDRはこれらの関数のインメモリ改ざんを整合性チェックで検出する。",
    "points": [
      "対象関数: ntdll!EtwEventWrite / EtwEventWriteFull、最終的にNtTraceEventを呼ぶ",
      "手口: 先頭命令をRET(0xC3)等に上書きしイベント生成を無効化",
      "AMSIパッチやアンフックと併用されることが多い",
      "検知: ntdllコードセクションのインメモリ改ざん/整合性検証",
      "MITRE ATT&CK T1562.006(Indicator Blocking)関連"
    ],
    "related": [
      "etw",
      "apihook",
      "amsi",
      "edr",
      "procinjection"
    ]
  },
  {
    "id": "soar",
    "term": "SOAR（セキュリティ運用の自動化・オーケストレーション）",
    "en": "Security Orchestration, Automation and Response (SOAR)",
    "aka": "SOAR, playbook, automated response, Sentinel automation rules/Logic Apps",
    "cat": "soc",
    "body": "SOAR（Security Orchestration, Automation and Response）は、複数のセキュリティ製品やIT基盤を連携（オーケストレーション）し、プレイブックと呼ばれる定義済みワークフローでインシデント対応を自動化・半自動化するプラットフォーム。アラートのトリアージ、脅威インテリジェンスによるエンリッチメント、アカウント無効化やホスト隔離といった封じ込め処理をコード化し、対応時間（MTTR）とアナリストの負荷を削減する。Microsoft SentinelではオートメーションルールとLogic Apps（プレイブック）がSOAR機能を担い、SIEMと統合される。誤検知への過剰自動化は業務影響を招くため、封じ込めアクションには承認ゲートの設計が重要。",
    "points": [
      "3要素: オーケストレーション/自動化/レスポンス、中核はプレイブック",
      "目的: MTTR短縮とSOCのアラート疲労軽減",
      "Microsoft Sentinel: オートメーションルール + Logic Apps(プレイブック)",
      "SIEM/EDR/XDRのアラートを入力に封じ込めを自動実行",
      "破壊的アクションには承認ステップの組み込みが推奨"
    ],
    "related": [
      "siem",
      "ir",
      "mde",
      "advhunting",
      "xdr",
      "mttdmttr"
    ]
  },
  {
    "id": "apihook",
    "term": "ユーザーモードAPIフック / アンフック",
    "en": "User-mode API Hooking / Unhooking",
    "aka": "EDR userland hooks, ntdll unhooking, IAT/inline hook, module stomping",
    "cat": "soc",
    "body": "ユーザーモードAPIフックは、EDRがntdll.dllやkernel32.dll等の重要API（例: NtAllocateVirtualMemory、NtProtectVirtualMemory）の先頭にjmp命令を挿入するインラインフックや、IAT書き換えを行い、呼び出しを自社の監視スタブへ迂回させて挙動を可視化する仕組み。x64のクリーンなsyscallスタブは `4C 8B D1`(mov r10,rcx) `B8 <SSN>`(mov eax,システムサービス番号) … `0F 05`(syscall) `C3`(ret) という定型バイト列を持ち、フック時は先頭が `E9`(相対jmp)や `FF 25`(間接jmp)へ書き換わるため、これが検知アーティファクトとなる。攻撃者側は「アンフック」により、ディスク上やKnownDlls等から取得したクリーンなntdllコピーで改ざん済み.textセクションを上書きしてEDRの監視を無効化し、フックを迂回する直接/間接システムコール（Hell's Gate/Halo's Gate/SysWhispers等でSSNを動的解決）やモジュールストンピングも併用する。防御側はメモリ上の.textとディスク上の正本のバイト/ハッシュ比較、セルフフックの整合性監視、カーネルコールバックで補完する。",
    "points": [
      "フック方式: インラインフック(先頭に E9 相対jmp / FF 25 間接jmp をパッチ)、IAT/EATフック",
      "クリーンなx64 syscallスタブ: 4C 8B D1(mov r10,rcx) / B8 <SSN>(mov eax,SSN) / 0F 05(syscall) / C3(ret)",
      "検知: メモリ上ntdll .text とディスク/KnownDlls の正本をバイト・ハッシュ比較し、先頭のjmp改変を検出",
      "アンフック: クリーンntdllで.textを復元。direct/indirect syscallはHell's/Halo's Gate・SysWhispersでSSNを動的解決",
      "カーネルコールバックやETW/スタックウォークがユーザーモードフック回避への補完策"
    ],
    "related": [
      "edr",
      "etwbypass",
      "syscall",
      "procinjection",
      "byovd"
    ]
  },
  {
    "id": "mdca",
    "term": "Microsoft Defender for Cloud Apps (MDCA)",
    "en": "Microsoft Defender for Cloud Apps",
    "aka": "MDCA, MCAS, CASB, Cloud App Security, app governance",
    "cat": "soc",
    "body": "Microsoft Defender for Cloud Apps（MDCA、旧Microsoft Cloud App Security/MCAS）は、ユーザーとSaaSアプリの間に位置するCASB（Cloud Access Security Broker）で、シャドーIT可視化、情報保護、脅威検知、アプリガバナンスを提供する。Cloud Discovery（ログ解析によるアプリ発見）、App Connector（APIによるSaaS連携）、そしてEntra条件付きアクセスと連携するConditional Access App Control（リバースプロキシによるセッション制御）の3方式で機能する。セッションポリシーによりダウンロード阻止・読み取り専用強制・リアルタイムDLPを実現し、OAuthアプリの不正同意（illicit consent）検知やアプリガバナンスでSaaSの脅威対策を担う。",
    "points": [
      "CASB。旧称 Microsoft Cloud App Security(MCAS)",
      "3方式: Cloud Discovery / App Connector(API) / CA App Control(リバースプロキシ)",
      "セッション制御でDL阻止・読取専用・リアルタイムDLPを実施",
      "OAuth不正同意やリスクの高いアプリのアプリガバナンス",
      "Entra条件付きアクセスおよびDefender XDRと統合"
    ],
    "related": [
      "entra",
      "condaccess",
      "illicitconsent",
      "oauth",
      "siem"
    ]
  },
  {
    "id": "entraidp",
    "term": "Entra ID Protection (リスクベース検知)",
    "en": "Microsoft Entra ID Protection",
    "aka": "user risk, sign-in risk, risky user, risk detections, risk-based CA",
    "cat": "soc",
    "body": "Microsoft Entra ID Protection（旧Azure AD Identity Protection）は、機械学習を用いてサインインごと・ユーザーごとのリスクを算出し、アカウント侵害の兆候を検知するリスクベース防御機能。検知はサインインリスク（当該認証が正規所有者でない確率）とユーザーリスク（ID全体が侵害された確率）に大別され、匿名IP、非定型な移動（atypical travel、旧称impossible travel）、漏洩資格情報、なじみのないサインインプロパティ等を低・中・高で評価する。リスクベース条件付きアクセスと連動し、リスク検知時にMFA強制やセキュアなパスワードリセットを要求して自動修復できる。利用にはEntra ID P2ライセンスが必要。",
    "points": [
      "2軸: サインインリスク / ユーザーリスク、レベルは低/中/高",
      "代表検知: 漏洩資格情報、匿名IP、非定型な移動(atypical travel)、なじみのないサインイン",
      "リスクベース条件付きアクセスでMFA/パスワードリセットを強制し自動修復",
      "Entra ID P2ライセンスが必要",
      "Microsoft Graph/Defender XDRへリスク信号を連携"
    ],
    "related": [
      "entra",
      "condaccess",
      "mfafatigue",
      "tokentheft",
      "aitm"
    ]
  },
  {
    "id": "fido2",
    "term": "フィッシング耐性MFA / パスワードレス",
    "en": "Phishing-resistant MFA / FIDO2",
    "aka": "FIDO2, passkey, certificate-based auth, phishing-resistant authentication",
    "cat": "soc",
    "body": "フィッシング耐性MFA（FIDO2/パスキー）は、WebAuthn（W3C）とCTAP2から成る公開鍵暗号ベースの認証方式で、共有シークレット（パスワードやOTP）を送受信しない点が特徴。サーバーは公開鍵のみを保持し、サインイン時はサーバーが送るチャレンジ（ノンス）に秘密鍵で署名して検証する。デバイスバウンドな認証器（セキュリティキー、TPM連動の端末固有資格情報）では秘密鍵がハードウェアから外に出ないが、同期パスキーはiCloudキーチェーンやGoogle/Microsoft等のクラウド経由で暗号化のうえ複数端末へ複製される点に留意する。資格情報はRP（リライング・パーティ）のオリジンに暗号的に束縛（origin binding）され、ブラウザは登録ドメイン以外での使用を拒否するため、AiTMプロキシによる中間者フィッシングやNTLM/認証情報リレーが構造的に無効化される。生体認証やPINでローカルにユーザー確認を行い、パスワードレス多要素を実現する。",
    "points": [
      "構成: WebAuthn(W3C) + CTAP2、公開鍵暗号によるチャレンジ応答",
      "オリジン束縛でAiTM中間者フィッシング/リレーを構造的に無力化",
      "秘密鍵はデバイスバウンド認証器(セキュリティキー/TPM)では非流出、同期パスキーはクラウドで複製される",
      "サーバーは公開鍵のみ保持、生体・PINでローカルにユーザー確認",
      "MFA疲労やパスワードスプレー等の資格情報攻撃への根本対策"
    ],
    "related": [
      "mfafatigue",
      "aitm",
      "whfb",
      "condaccess",
      "ntlmrelay"
    ]
  },
  {
    "id": "breakglass",
    "term": "非常用アカウント (ブレークグラス)",
    "en": "Break-glass / Emergency Access Account",
    "aka": "break glass, emergency access account, CA-excluded cloud-only account",
    "cat": "soc",
    "body": "非常用アカウント（ブレークグラス）は、Conditional Access（条件付きアクセス）による締め出しやフェデレーション障害・MFAインフラ停止などの緊急時に、Entra ID / テナントへ確実にサインインするために用意する高権限の予備アカウントである。Microsoftは、クラウド専用（オンプレ同期しない *.onmicrosoft.com）でグローバル管理者ロールを永続付与したアカウントを2つ以上作成し、ブロック系の条件付きアクセスポリシーから除外することを推奨する。ただし除外してもMFA必須化（mandatory MFA）ではAzure/Entra/Intune管理ポータルでMFAが強制されるため、現在Microsoftは通常の管理者とは異なる認証手段として、フィッシング耐性MFA（FIDO2パスキーまたは証明書ベース認証/CBA）を各ブレークグラスに登録することを推奨する。除外している分だけ悪用時のリスクが高いため、これらのアカウントのサインインは常時監視し、使用されたら即座にアラート・調査する運用が必須である。",
    "points": [
      "クラウド専用アカウントを最低2つ、ブロック系CAポリシーから除外（一斉ロックアウト回避）",
      "グローバル管理者を永続割り当て（PIMのJIT対象にはしないのが定石）",
      "CA除外でもMFA必須化下ではMFAが強制されるため、FIDO2/CBA等フィッシング耐性MFAを登録",
      "通常管理者と別の認証手段にし、パスワード運用時は長大・複数分割保管",
      "サインイン/ロール使用を監視しハニートークン的にアラート化するのが要点"
    ],
    "related": [
      "condaccess",
      "entraroles",
      "pim",
      "tenant",
      "honeytoken"
    ]
  },
  {
    "id": "sigma",
    "term": "Sigmaルール",
    "en": "Sigma Rules",
    "aka": "Sigma, generic detection rule format, sigma-to-KQL, detection-as-code",
    "cat": "soc",
    "body": "Sigmaは、ログベースの検知ロジックをSIEM製品に依存しない汎用フォーマットで記述するためのYAMLベースのオープン標準である。ルールは title / id(UUID) / status / level / tags などのメタデータと、logsource（対象ログ種別: category・product・service）、detection（検索識別子＋condition）から成る。フィールド値には修飾子をパイプで付与でき（|contains, |startswith, |endswith, |re 正規表現, |base64/|base64offset, |all, |windash 等）、conditionは and/or/not と `1 of selection*` / `all of them` / `1 of them` / near 等で検索識別子を論理結合する。status は stable/test/experimental/deprecated/unsupported、level は informational/low/medium/high/critical の語彙を用いる。pySigma / sigma-cli とパイプライン(フィールドマッピング)でMicrosoft Sentinel(KQL)、Splunk(SPL)、Elastic(Lucene/EQL/ES|QL)等へ変換し、detection-as-codeとしてGit管理・共有する。",
    "points": [
      "ルール骨子: メタデータ(title/id=UUID/status/level/tags) + logsource(category/product/service) + detection(識別子+condition)",
      "フィールド修飾子(パイプ): |contains・|startswith・|endswith・|re・|base64/|base64offset・|all・|windash",
      "condition演算子: and/or/not、`1 of selection*`・`all of them`・`1 of them`・near で識別子を結合",
      "語彙: status=stable/test/experimental/deprecated/unsupported、level=informational/low/medium/high/critical",
      "pySigma/sigma-cli＋パイプラインでKQL・SPL・EQL等へ変換し、ATT&CK tagsを付与してdetection-as-codeで運用"
    ],
    "related": [
      "siem",
      "advhunting",
      "threathunting",
      "iocioa",
      "mitreattack",
      "deteng"
    ]
  },
  {
    "id": "ueba",
    "term": "UEBA（ユーザー・エンティティ行動分析）",
    "en": "User and Entity Behavior Analytics (UEBA)",
    "aka": "UEBA, behavioral analytics, anomaly detection, Sentinel UEBA",
    "cat": "soc",
    "body": "UEBA（ユーザー・エンティティ行動分析）は、ユーザーやホスト・サービスアカウント等のエンティティごとに通常の行動ベースライン（ログオン時刻・元ホスト・アクセス先・データ量など）を機械学習で構築し、そこからの逸脱を異常スコアとして検知する仕組みである。単一イベントの静的ルールでは捉えにくい「初めてのリソースへのアクセス」「不可能な移動（impossible travel）」「休眠アカウントの突然の活動」といった振る舞いの変化を浮かび上がらせる。Microsoft Sentinel UEBAやMicrosoft Defender for Identity等に組み込まれ、内部不正・アカウント乗っ取り・横展開の早期検知に寄与する。",
    "points": [
      "個々のユーザー/エンティティのベースラインからの逸脱を異常スコア化",
      "impossible travel、初回アクセス、休眠アカウント再活性などを検知",
      "静的ルールを補完し、ラテラルムーブメント・内部脅威の兆候を可視化",
      "Sentinel UEBA、Defender for Identity(MDI)等に実装",
      "誤検知抑制のためリスクスコアと相関分析を併用"
    ],
    "related": [
      "siem",
      "mdi",
      "threathunting",
      "iocioa",
      "advhunting"
    ]
  },
  {
    "id": "ir",
    "term": "インシデントレスポンス / DFIR",
    "en": "Incident Response / DFIR",
    "aka": "IR, DFIR, containment/eradication/recovery, NIST IR lifecycle, forensics",
    "cat": "soc",
    "body": "インシデントレスポンス（IR）/ DFIRは、セキュリティ侵害を検知してから封じ込め・根絶・復旧し、再発防止まで行う一連のプロセスと、その裏付けとなるデジタルフォレンジック（証拠保全と分析）を指す。NIST SP 800-61では、Rev.2が4フェーズ（準備／検知・分析／封じ込め・根絶・復旧／事後活動）を定義していたが、2025年4月に確定したRev.3はこれを廃してCSF 2.0の6機能（統治・識別・防御・検知・対応・復旧）に整合させたコミュニティプロファイルとなった。ほかにSANSのPICERLモデルも代表的である。AD侵害では、krbtgtの二重ローテーション、侵害された特権アカウントの無効化、ゴールデンチケット無効化などが根絶フェーズの具体策となり、揮発性データ・メモリ・イベントログの保全が分析の要となる。",
    "points": [
      "NIST SP 800-61 Rev.2の4フェーズ：準備→検知・分析→封じ込め・根絶・復旧→事後活動",
      "Rev.3（2025）はRev.2を廃止しCSF 2.0の6機能に整合するプロファイルへ再構成",
      "SANS PICERL（Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned）",
      "AD侵害の根絶ではkrbtgtパスワードの2回リセットが定石",
      "証拠保全は揮発性の高い順（メモリ→ディスク上ログ）で実施し、SOAR/CTIと連携"
    ],
    "related": [
      "threathunting",
      "soar",
      "siem",
      "cti",
      "iocioa",
      "mttdmttr",
      "memforensics"
    ]
  },
  {
    "id": "cti",
    "term": "サイバー脅威インテリジェンス (CTI)",
    "en": "Cyber Threat Intelligence (CTI)",
    "aka": "CTI, threat intel, TI feeds, STIX/TAXII, threat actor profiling",
    "cat": "soc",
    "body": "サイバー脅威インテリジェンス（CTI）は、攻撃者のTTP（戦術・技術・手順）、インフラ、IoC、動機などに関する情報を収集・分析し、意思決定に資する形へ加工した知見である。戦略的（経営向けの脅威動向）・運用的（キャンペーンや脅威アクターの意図）・戦術的（IoCやTTPなど即時防御に使える情報）に層別され、STIX（構造化表現）とTAXII（交換プロトコル）で機械可読な共有が行われる。MITRE ATT&CK、Diamond Model、Cyber Kill Chainといった分析枠組みと組み合わせ、検知ルール作成・脅威ハンティング・優先度付けに活用される。",
    "points": [
      "層別：戦略的 / 運用的 / 戦術的インテリジェンス",
      "STIX（データ形式）＋TAXII（配信プロトコル）で共有",
      "分析枠組み：MITRE ATT&CK、Diamond Model、Cyber Kill Chain",
      "IoC（既知の痕跡）よりTTP/IoA（振る舞い）の方が持続的価値が高い",
      "ハンティング仮説・検知エンジニアリングの入力として活用"
    ],
    "related": [
      "mitreattack",
      "iocioa",
      "threathunting",
      "c2",
      "killchain",
      "diamondmodel"
    ]
  },
  {
    "id": "pim",
    "term": "Privileged Identity Management (PIM)",
    "en": "Privileged Identity Management (PIM)",
    "aka": "PIM, just-in-time, eligible role, role activation, PAM, access review",
    "cat": "soc",
    "body": "Privileged Identity Management（PIM）は、Microsoft Entra IDの機能で、特権ロールを常時付与（永続的アクティブ）ではなく「対象（eligible）」として割り当て、必要時にJust-In-Time（JIT）で一定時間だけ有効化（activation）させる仕組みである。有効化時にMFA・理由入力・承認ワークフロー・チケット番号を要求でき、有効期限付きで自動的に権限が失効するため、常時特権を持つアカウントを削減してTier-0の攻撃対象領域を縮小できる。定期的なアクセスレビューと有効化ログの監査により、過剰権限の是正と特権利用の追跡（PAMの一部）を実現する。",
    "points": [
      "対象(eligible)割り当て＋JITでの時間制限付きactivation",
      "有効化時にMFA・承認・理由/チケット要求を強制可能",
      "Entraロールおよびグループ、Azureリソースロールに適用",
      "アクセスレビューで棚卸し、有効化はログ監査対象",
      "常時特権を減らしTier-0/最小権限を実現するPAM機能"
    ],
    "related": [
      "entraroles",
      "condaccess",
      "tiermodel",
      "privgroups",
      "breakglass"
    ]
  },
  {
    "id": "proctree",
    "term": "正常なプロセスツリー(プロセス系譜)",
    "en": "Normal Process Tree / Process Ancestry",
    "aka": "process ancestry, parent-child, PPID, System/smss/csrss/wininit/services/lsass",
    "cat": "os",
    "body": "Windows起動時の中核プロセスは決まった親子関係(系譜)で生成され、この「正常形」を知ることが異常検知の土台になる。System(PID 4、カーネル)→smss.exe(セッションマネージャ)→各セッションのcsrss.exeとwininit.exe(セッション0)/winlogon.exe(対話セッション)。wininit.exeの子がservices.exe(SCM)とlsass.exeで、services.exeが多数のsvchost.exe(必ず-k <グループ>引数付き)やspoolsv.exe等を起動する。対話ログオンではwinlogon→userinit(即終了)→explorer.exeとなり、ユーザーのcmd/powershellはexplorer配下に生える。SOCではこの基準線からの逸脱—lsass.exeの親がwininit以外、svchost.exeが引数なし/services.exe以外の親、WINWORD.EXEやOUTLOOK.EXEがpowershell.exeを起動、等—を強い異常シグナルとして扱う。",
    "points": [
      "中核系譜: System(4)→smss→wininit→services.exe/lsass.exe(セッション0)",
      "svchost.exeは必ずservices.exeの子で -k <サービスグループ> 引数付き",
      "対話: winlogon→userinit(即終了)→explorer.exe→ユーザーのcmd/powershell",
      "異常例: lsass親がwininit以外、Office製品→powershell、引数なしsvchost",
      "監視: Sysmon EID1 / Security 4688(親プロセス名・PPID・コマンドライン)"
    ],
    "related": [
      "process",
      "service",
      "lsass",
      "sysmon",
      "ev4688"
    ]
  },
  {
    "id": "dll",
    "term": "DLL(動的リンクライブラリ)",
    "en": "Dynamic Link Library",
    "aka": "exports, LoadLibrary, DLL search order, sideloading",
    "cat": "os",
    "body": "DLLは複数プロセスが共有する再利用可能なコード/データのモジュールで、エクスポート関数を介して呼び出される。プロセスは静的インポート(PEのインポートテーブル)または実行時のLoadLibrary/GetProcAddressで読み込む。名前だけで指定されたDLLはWindowsの「DLL検索順序」(アプリのディレクトリ→System32→…→PATH)に従って探索されるため、この順序の隙を突くのがDLLサーチオーダーハイジャックやDLLサイドローディング(正規署名EXEに悪性DLLを同梱)である。rundll32.exeは任意DLLの指定エクスポートを実行するLOLBinとして悪用される。SOCでは署名のないDLLの異常な場所からのロードや、既知プロセスによる予期しないDLL読込(Sysmon EID7=Image Loaded)を監視する。",
    "points": [
      "エクスポート関数を静的インポート or LoadLibrary/GetProcAddressで解決",
      "DLL検索順序の隙→サーチオーダーハイジャック/サイドローディング",
      "rundll32.exeで任意DLLエクスポートを実行(LOLBin)",
      "監視: Sysmon EID7(Image Loaded)、署名なし/非標準パスのDLL"
    ],
    "related": [
      "dllhijack",
      "peformat",
      "process",
      "lolbin",
      "sysmon"
    ]
  },
  {
    "id": "peformat",
    "term": "PE ファイル形式",
    "en": "Portable Executable (PE) Format",
    "aka": "PE header, MZ, sections, IAT, entry point, .text/.data/.rsrc, Authenticode",
    "cat": "os",
    "body": "PE(Portable Executable)はWindowsのEXE/DLL/SYS等の実行ファイル形式で、マルウェアトリアージの基本知識となる。先頭のDOSヘッダ(MZシグネチャ)からPE/NTヘッダへつながり、セクション(.text=コード、.data=データ、.rsrc=リソース、.reloc等)、インポートテーブル(使用APIの一覧)、エクスポートテーブル、エントリポイントを含む。アナリストはインポートAPI(例:VirtualAlloc/CreateRemoteThread=注入示唆)、疑わしいセクション名やRWX属性、高エントロピー(パッカー/暗号化の兆候)、コンパイル時刻、埋め込みリソース、Authenticode署名の有無/失効から悪性度を推定する。",
    "points": [
      "構造: DOS(MZ)→NTヘッダ→セクション(.text/.data/.rsrc/.reloc)",
      "インポートAPI(IAT)は挙動推定の手がかり(注入・暗号・通信API)",
      "高エントロピー/異常セクション=パッカー・暗号化の兆候",
      "Authenticode署名の有無・失効を確認"
    ],
    "related": [
      "dll",
      "procinjection",
      "yara",
      "sandbox"
    ]
  },
  {
    "id": "bits",
    "term": "BITS(バックグラウンド インテリジェント転送サービス)",
    "en": "Background Intelligent Transfer Service",
    "aka": "bitsadmin, BITSAdmin, BITS jobs, Start-BitsTransfer, T1197",
    "cat": "os",
    "body": "BITSはWindows標準の帯域制御付きファイル転送サービスで、Windows Update等が利用する。攻撃者はbitsadmin.exeやPowerShellのStart-BitsTransferを使い、正規のシステムサービス経由でペイロードをダウンロード(AV/プロキシ検査を透過)したり、BITSジョブのSetNotifyCmdLineで転送完了時に任意コマンドを実行させ永続化する。ジョブはユーザー単位で保存され再起動をまたいで再試行するため、隠れた持続化に悪用される(MITRE ATT&CK T1197)。SOCではbitsadminのコマンドライン、異常なBITSジョブ、BITS-Client運用ログ(EID 59/60/16403)やsvchost経由の異常な外部通信を監視する。",
    "points": [
      "正規サービス経由のダウンロードでAV/プロキシ検査を回避(T1197)",
      "SetNotifyCmdLineで転送完了時にコマンド実行→永続化",
      "ジョブはユーザー単位で永続・再試行し隠れやすい",
      "監視: bitsadminコマンドライン、BITS-Client運用ログ(59/60/16403)"
    ],
    "related": [
      "lolbin",
      "service",
      "schtask",
      "c2"
    ]
  },
  {
    "id": "mutex",
    "term": "ミューテックス(Mutant)",
    "en": "Mutex / Mutant Object",
    "aka": "mutant, named mutex, single-instance marker, vaccine",
    "cat": "os",
    "body": "ミューテックス(カーネルオブジェクト名はMutant)は本来スレッド/プロセス間の排他制御に使う同期オブジェクトだが、マルウェアは「多重感染防止マーカー」として固有名の名前付きミューテックスを作成することが多い。同名ミューテックスが既存なら自身を終了することで二重実行を防ぐ。この固有名は強力なホストIOCとなり(例:特定ボットネットの既知ミューテックス名)、YARA/EDRでの検知や、先回りして同名を作成し感染を阻止するワクチンに利用される。SOCではSysmonでは直接取得しづらいが、EDRのカーネルテレメトリやメモリフォレンジック(ハンドル列挙)で観測する。",
    "points": [
      "Mutant=排他制御用の同期オブジェクト、名前付きで生成可能",
      "マルウェアが多重感染防止マーカーに悪用→固有名は強力なホストIOC",
      "ワクチン(先回り作成)で感染阻止に応用可能",
      "取得: EDRカーネルテレメトリ/メモリ解析(ハンドル列挙)"
    ],
    "related": [
      "handle",
      "namedpipe",
      "yara",
      "iocioa"
    ]
  },
  {
    "id": "vbs",
    "term": "VBS / HVCI(仮想化ベースセキュリティ)",
    "en": "Virtualization-Based Security / HVCI",
    "aka": "Virtualization-Based Security, Hypervisor-protected Code Integrity, VSM, VTL, lsaiso, Core Isolation, Memory Integrity",
    "cat": "os",
    "body": "VBS(Virtualization-Based Security)はHyper-Vハイパーバイザで通常OS(VTL0)から隔離した安全領域(VTL1/Secure Kernel)を作り、資格情報や整合性検証をそこで守る仕組み。この上でCredential Guardはlsass.exeの秘密(NTLMハッシュ/Kerberos鍵)をlsaiso.exe(隔離LSA)へ退避し、SYSTEM権限のマルウェアでも平文/ハッシュを直接読めなくする。HVCI(Hypervisor-protected Code Integrity、別名メモリ整合性)はカーネルへのコード署名検証を隔離環境で強制し、未署名/改ざんドライバのロードを阻止—BYOVD対策の要となる。Windows 11では既定での有効化が進む。",
    "points": [
      "ハイパーバイザでVTL0(通常OS)とVTL1(Secure Kernel)を分離",
      "Credential Guard: 資格情報をlsaiso.exeへ隔離し直接ダンプを阻止",
      "HVCI(メモリ整合性): カーネルコード署名を強制→BYOVD対策の要",
      "Windows 11で既定有効化が進行"
    ],
    "related": [
      "credguard",
      "byovd",
      "lsass",
      "secureboot",
      "ppl"
    ]
  },
  {
    "id": "ntfsart",
    "term": "NTFS フォレンジックアーティファクト",
    "en": "NTFS Forensic Artifacts ($MFT / USN Journal / $LogFile)",
    "aka": "MFT, Master File Table, USN Journal, $J, $LogFile, timestomping, MFTECmd",
    "cat": "logging",
    "body": "NTFSはファイル操作の痕跡を複数のメタデータファイルに残し、DFIRの中核証跡になる。$MFT(マスターファイルテーブル)は全ファイル/ディレクトリのエントリで、作成/更新/MFT更新/アクセスの各タイムスタンプ(標準情報($SI)と$FILE_NAME($FN)の2組=タイムストンピング検知に有効)、常駐する小ファイルの中身、削除エントリを保持する。$UsnJrnl:$J(USNジャーナル)はファイルの作成/削除/リネーム/書込みを時系列で記録し、削除済みファイルの存在証明に使える。$LogFileはトランザクションログ。攻撃者による自己削除やファイル生成・改ざんの再構成に不可欠で、KAPE等で収集しMFTECmd等で解析する。",
    "points": [
      "$MFT: 全ファイルのエントリ+2組のMACタイムスタンプ($SI/$FN)",
      "タイムストンピング(時刻改ざん)は$SIと$FNの矛盾で検知",
      "$UsnJrnl:$J: 作成/削除/リネームの時系列→削除済みファイルの証明",
      "収集/解析: KAPE、MFTECmd、$SI/$FN のMACb比較"
    ],
    "related": [
      "shimcache",
      "amcache",
      "prefetch",
      "vss",
      "userart"
    ]
  },
  {
    "id": "userart",
    "term": "ユーザー活動アーティファクト",
    "en": "User-Activity Artifacts (LNK / Jump List / ShellBags / RunMRU)",
    "aka": "LNK files, Jump Lists, ShellBags, RunMRU, RecentDocs, UserAssist, OpenSavePidlMRU",
    "cat": "logging",
    "body": "ユーザーのファイル/フォルダ操作やプログラム実行は、レジストリとファイルの各所に痕跡を残し、対話的操作の再構成に使う。LNK(ショートカット)とジャンプリストは開いたファイルのパス・タイムスタンプ・ボリューム情報を保持し、外部USBや削除済みファイルの利用を示す。ShellBags(レジストリ)は閲覧したフォルダの表示設定を残しフォルダアクセス履歴を示す。RunMRU(Win+R実行履歴)、OpenSavePidlMRU(ファイルダイアログ履歴)、RecentDocs、UserAssist(GUIプログラム実行回数)なども対話操作の裏付けになる。これらは実行証跡(prefetch/amcache)と組み合わせ、「誰が・何を・いつ操作したか」を立証する。",
    "points": [
      "LNK/ジャンプリスト: 開いたファイルのパス・時刻・ボリューム(USB痕跡)",
      "ShellBags: フォルダ閲覧履歴(削除済みフォルダも)",
      "RunMRU/UserAssist/RecentDocs: 対話的実行・操作の裏付け",
      "実行系(prefetch/amcache)と併用し操作主体・時系列を立証"
    ],
    "related": [
      "ntfsart",
      "prefetch",
      "amcache",
      "shimcache"
    ]
  },
  {
    "id": "triage",
    "term": "トリアージと FP/TP/FN",
    "en": "Alert Triage & FP/TP/FN",
    "aka": "false positive, true positive, false negative, true negative, alert fatigue, tuning, 誤検知, 検知漏れ",
    "cat": "soc",
    "body": "トリアージはSOCに流入する大量アラートを優先度付けし、正検知(TP)か誤検知(FP)かを迅速に判定してエスカレーション/クローズする一次分析活動である。判定は混同行列で整理される—TP(真陽性:実際の脅威を正しく検知)、FP(偽陽性:脅威でないのに発報=誤検知)、FN(偽陰性:脅威を見逃し=検知漏れ、最も危険)、TN(真陰性:正常を正常と判定)。FPが多いとアラート疲れ(alert fatigue)を招き重要な脅威を見落とすため、検知ルールのチューニング(閾値・除外・コンテキスト付与)が継続的に必要。ジュニアアナリストの中核業務であり、エンリッチメント(資産・ユーザー・脅威情報の付加)で判定精度を高める。",
    "points": [
      "TP=正検知 / FP=誤検知 / FN=検知漏れ(最も危険) / TN=真陰性",
      "流れ: 発報→エンリッチ→検証→エスカレ or クローズ",
      "FP多発=アラート疲れ→重大脅威の見落とし。チューニングが必須",
      "エンリッチメント(資産/ユーザー/脅威情報)で判定精度を上げる"
    ],
    "related": [
      "siem",
      "iocioa",
      "threathunting",
      "ir",
      "ueba"
    ]
  },
  {
    "id": "pyramid",
    "term": "痛みのピラミッド",
    "en": "Pyramid of Pain",
    "aka": "Pyramid of Pain, David Bianco, indicator value",
    "cat": "soc",
    "body": "David Biancoが提唱した、防御側が各種インジケータをブロックした際に「攻撃者にどれだけの痛み(変更コスト)を与えるか」を6段階で表すモデル。下から、ハッシュ値(自明・即変更可)、IPアドレス(容易)、ドメイン名(やや手間)、ネットワーク/ホストアーティファクト(面倒)、ツール(困難)、TTP(戦術・技術・手順=最も困難)。下位のIOCは攻撃者が瞬時に変えられるため防御効果が薄く陳腐化しやすい一方、上位のTTPを検知・遮断すると攻撃者は手口自体の再設計を迫られ最大の痛みを与えられる。IOAやMITRE ATT&CKベースの挙動検知が上位に位置し、脅威ハンティングや検知エンジニアリングの優先度指針となる。",
    "points": [
      "6段階(下→上): ハッシュ→IP→ドメイン→アーティファクト→ツール→TTP",
      "下位IOCは変更容易で陳腐化、上位ほど攻撃者の痛みが大きい",
      "TTP検知(IOA/ATT&CK)が最も効果的で回避されにくい",
      "検知エンジニアリング/ハンティングの優先度指針"
    ],
    "related": [
      "iocioa",
      "mitreattack",
      "threathunting",
      "cti"
    ]
  },
  {
    "id": "yara",
    "term": "YARA ルール",
    "en": "YARA Rules",
    "aka": "YARA, pattern matching, malware classification, strings + condition, VirusTotal",
    "cat": "soc",
    "body": "YARAはマルウェアを分類・検知するためのパターンマッチングツール/ルール記述言語で、「パターンマッチングのスイスアーミーナイフ」と称される。ルールはmeta(説明・作者)、strings(検索する文字列・16進バイト列・正規表現)、condition(発火条件:文字列の組合せ・出現数・ファイルオフセット・PE構造条件)の3ブロックで構成される。EDR、サンドボックス、メールゲートウェイ、メモリスキャン(YARA on memory)、脅威ハンティングで広く使われ、ファミリ単位の検知や亜種の網羅に強い。VirusTotalが開発を主導し、CTIフィードでルールが共有される。過剰に緩いルールはFP、狭すぎると亜種を取り逃すため精度設計が肝要。",
    "points": [
      "構造: meta / strings(文字列・hex・正規表現) / condition(発火条件)",
      "用途: EDR・サンドボックス・メモリスキャン・脅威ハンティング",
      "ファミリ/亜種の網羅に強い、CTIで共有(VirusTotal主導)",
      "緩すぎ=FP、狭すぎ=見逃し。精度設計が重要"
    ],
    "related": [
      "sandbox",
      "iocioa",
      "cti",
      "sigma",
      "peformat"
    ]
  },
  {
    "id": "sandbox",
    "term": "サンドボックス(動的解析)",
    "en": "Malware Sandbox / Detonation",
    "aka": "detonation, dynamic analysis, Cuckoo, CAPE, ANY.RUN, Joe Sandbox, 自動デトネーション",
    "cat": "soc",
    "body": "サンドボックスは隔離された使い捨て仮想環境で検体を実際に実行(デトネーション)し、挙動を観測する動的マルウェア解析基盤。API呼び出し、生成・改変ファイル、レジストリ操作、プロセス生成、ネットワーク通信(C2先・DNS)を記録し、IOC/IOAやYARA適合を自動抽出する。メールゲートウェイやEDRが疑わしい添付/実行ファイルを自動デトネーションして判定に使う。マルウェアはVM検出(デバイス名・CPUコア数・MACベンダ)、スリープ/時間差、ユーザー操作待ち、環境チェックといったサンドボックス回避を行うため、解析側はステルス化やユーザー操作の模倣で対抗する。代表例: Defender自動デトネーション、Joe Sandbox、ANY.RUN、Cuckoo/CAPE。",
    "points": [
      "隔離VMで実行し挙動(API/ファイル/レジストリ/通信)を自動抽出",
      "メール/EDRの自動デトネーションで未知検体を判定",
      "回避: VM検出・スリープ・ユーザー操作待ち・環境チェック",
      "代表: Defender、Joe Sandbox、ANY.RUN、Cuckoo/CAPE"
    ],
    "related": [
      "yara",
      "iocioa",
      "c2",
      "edr"
    ]
  },
  {
    "id": "mttdmttr",
    "term": "MTTD / MTTR / 滞留時間",
    "en": "MTTD / MTTR / Dwell Time",
    "aka": "Mean Time to Detect, Mean Time to Respond, dwell time, M-Trends, KPI",
    "cat": "soc",
    "body": "SOC/インシデント対応の有効性を測る時間指標。MTTD(平均検知時間)は侵害発生から検知までの平均、MTTR(平均対応/復旧時間)は検知から封じ込め・復旧までの平均。滞留時間(dwell time)は攻撃者が最初に侵入してから検知(または排除)されるまで環境内に潜伏していた期間で、Mandiant M-Trendsが業界中央値を毎年公表している(グローバル中央値は10日(CY2023)→11日(CY2024)→14日(CY2025)と直近は長期化傾向)。検知経路で大きく差が出て、内部検知は短く、外部組織からの通知は長い(=検知能力の内製化が鍵)。これらの短縮がSOC投資(EDR/自動化/SOAR/ハンティング)の主目的であり、KPIとして経営報告にも使われるが、数値は文脈依存で単独では良否を判断しない。",
    "points": [
      "MTTD=検知まで / MTTR=対応・復旧まで / 滞留時間=潜伏期間",
      "M-Trends中央値: 10日(CY23)→11日(CY24)→14日(CY25)と長期化傾向",
      "内部検知は短く外部通知は長い—検知の内製化が滞留短縮の鍵",
      "SOC投資(EDR/SOAR/ハンティング)のKPI。数値は文脈依存"
    ],
    "related": [
      "ir",
      "soar",
      "edr",
      "killchain",
      "cti"
    ]
  },
  {
    "id": "diamondmodel",
    "term": "ダイヤモンドモデル",
    "en": "Diamond Model of Intrusion Analysis",
    "aka": "Diamond Model, adversary-capability-infrastructure-victim, pivoting",
    "cat": "soc",
    "body": "侵入分析のダイヤモンドモデルは、あらゆる侵害イベントを4つの中核要素—敵対者(Adversary)、能力(Capability:マルウェア/エクスプロイト等のTTP)、インフラ(Infrastructure:C2・ドメイン・IP)、被害者(Victim)—の関係として表現するフレームワーク。4頂点は辺で結ばれ、1つの頂点(例:あるC2 IP)から他の頂点(それを使う敵対者や別の被害者)へ分析を軸旋回(ピボット)できるのが強み。時系列を追うキルチェーンやTTPを体系化するATT&CKと相補的に使われ、CTIの構造化・相関・アトリビューション(攻撃者帰属)に用いられる。",
    "points": [
      "4頂点: 敵対者・能力(TTP)・インフラ(C2)・被害者",
      "1頂点から他頂点へピボット(相関・アトリビューション)",
      "キルチェーン(時系列)・ATT&CK(TTP)と相補的",
      "CTIの構造化・脅威アクター追跡に活用"
    ],
    "related": [
      "cti",
      "killchain",
      "mitreattack",
      "iocioa"
    ]
  },
  {
    "id": "credssp",
    "term": "CredSSP",
    "en": "Credential Security Support Provider",
    "aka": "CredSSP, Restricted Admin, Remote Credential Guard, NLA, CVE-2018-0886",
    "cat": "auth",
    "body": "CredSSPはネットワーク経由でユーザー資格情報を委任する認証プロバイダ(SSP)で、主にRDPのNLA(ネットワークレベル認証)で使われ、クライアントの資格情報をサーバへ安全に渡す。RDP接続時にサーバ側のlsassへ平文相当の資格情報が渡るため、侵害済みサーバへRDPすると資格情報を奪われる(=Restricted Admin/Remote Credential Guardで委任を抑止できる)。2018年のCVE-2018-0886はCredSSPの論理的欠陥で、中間者攻撃者がRDPセッション内で任意コード実行を可能にした(パッチ+EncryptionOracleRemediationレジストリの強制で対処)。SOCではRDPの認証方式、Restricted Admin/RCGの有無、CredSSP関連の暗号エラーを確認する。",
    "points": [
      "RDPのNLAで資格情報をサーバへ委任するSSP",
      "侵害サーバへのRDPは資格情報窃取リスク→Restricted Admin/RCGで抑止",
      "CVE-2018-0886: MITMによるRCE(EncryptionOracleRemediationで対処)",
      "関連防御: Remote Credential Guard、Restricted Admin mode"
    ],
    "related": [
      "rdp",
      "delegation",
      "sspi",
      "credguard",
      "kerberos"
    ]
  },
  {
    "id": "nopac",
    "term": "noPac / sAMAccountName スプーフィング",
    "en": "noPac / sAMAccountName Spoofing",
    "aka": "CVE-2021-42278, CVE-2021-42287, sAMAccountName spoofing",
    "cat": "prim",
    "body": "標準ドメインユーザーを一撃でドメイン管理者相当へ昇格させる2つのCVEの連鎖。既定のms-DS-MachineAccountQuota=10で誰でもマシンアカウントを作成でき、CVE-2021-42278(SAM名検証の不備)によりそのsAMAccountNameを末尾$なしでDC名(例:DC01)へ改名できる。このアカウントでTGTを取得後、アカウントを削除/改名すると、CVE-2021-42287(KDC/PAC混同)によりKDCが「DC01」を解決できず末尾に$を補完して実在DC(DC01$)へフォールバックし、DCになりすましたサービスチケットを発行—DCSync等でドメイン全体を掌握できる。片方だけのパッチでは連鎖は途切れない。",
    "points": [
      "CVE-2021-42278(SAM名検証不備)+CVE-2021-42287(KDC PAC混同)の連鎖",
      "前提: MachineAccountQuota>0で標準ユーザーがマシンアカウント作成可",
      "監視: 4741(作成)/4742(変更)/4781(名前変更—旧名末尾$→新名がDC名)",
      "対策: KB5008102+KB5008380(2021/11)、MAQを0に、Kerberos監査"
    ],
    "related": [
      "kerberos",
      "machineacct",
      "maq",
      "dcsync",
      "s4u"
    ]
  },
  {
    "id": "zerologon",
    "term": "Zerologon",
    "en": "Zerologon",
    "aka": "CVE-2020-1472, Netlogon, MS-NRPC, AES-CFB8",
    "cat": "prim",
    "body": "CVE-2020-1472。Netlogonリモートプロトコル(MS-NRPC)の認証計算がAES-128-CFB8をIV全ゼロで用いる欠陥。クライアントチャレンジを全ゼロにすると約1/256の確率でセッション鍵が全ゼロ暗号文を生むため、認証情報を持たない攻撃者がDCへのネットワーク到達性だけで数百回の試行(数秒)でNetrServerAuthenticate2/3を成立させられる。続いてNetrServerPasswordSet2でAD上のDCマシンアカウントのパスワードを空に設定し、DCSync等でドメインを完全掌握する(ローカルレジストリの秘密は変わらずDCが不整合で不安定化するため復旧が必要)。",
    "points": [
      "Netlogon MS-NRPCのAES-CFB8+IV全ゼロ欠陥(CVE-2020-1472)",
      "未認証でDCマシンアカウントのパスワードを空に→ドメイン掌握",
      "監視: 4742(DCマシンアカウント変更/Anonymous)、5827/5829、Netlogon RPC急増",
      "対策: 2020/8パッチ+2021/2既定で強制モード(5827で拒否記録)"
    ],
    "related": [
      "netlogon",
      "machineacct",
      "dcsync",
      "dc",
      "rpc"
    ]
  },
  {
    "id": "printnightmare",
    "term": "PrintNightmare",
    "en": "PrintNightmare",
    "aka": "CVE-2021-1675, CVE-2021-34527, Print Spooler, RpcAddPrinterDriverEx, spoolsv",
    "cat": "prim",
    "body": "Windows印刷スプーラ(spoolsv.exe)のドライバインストール経路の欠陥。RpcAddPrinterDriverExがドライバ導入者を適切に制限せず、認証済みユーザーが攻撃者用の「ドライバ」DLL(多くはUNC/SMB経由)をSYSTEM権限のスプーラにロードさせる。CVE-2021-1675は当初ローカル権限昇格として6月に修正されたが、同関数がリモートでも悪用可能と判明しMicrosoftは別個のCVE-2021-34527(SYSTEM権限でのリモートコード実行)を割当てた。結果、SYSTEMへのLPEとドメイン全体へのRCEが成立する。",
    "points": [
      "spoolsvのRpcAddPrinterDriverEx悪用でSYSTEM RCE/LPE",
      "CVE-2021-1675(LPE)とCVE-2021-34527(RCE)は別個",
      "監視: PrintService/Admin EID316、spoolsvの子プロセス、spool\\drivers配下の新規DLL",
      "注意: Point-and-Print NoWarningNoElevationOnInstall=1はパッチを無効化"
    ],
    "related": [
      "coercion",
      "service",
      "dllhijack",
      "smb",
      "rpc"
    ]
  },
  {
    "id": "potato",
    "term": "Potato 系 / SeImpersonate 悪用",
    "en": "Potato Family / SeImpersonate Abuse",
    "aka": "JuicyPotato, RoguePotato, PrintSpoofer, GodPotato, EfsPotato, SeImpersonatePrivilege",
    "cat": "prim",
    "body": "SeImpersonatePrivilege(および SeAssignPrimaryTokenPrivilege)を悪用したSYSTEMへのローカル権限昇格。攻撃者はSYSTEM権限のWindowsコンポーネントを攻撃者制御のエンドポイント(名前付きパイプ・ローカルRPC・DCOM/OXIDリゾルバ)へ認証させ、得られたSYSTEMトークンをSeImpersonateで偽装して任意プロセスをSYSTEMとして起動する。変種は誘発手段の違いだけ—JuicyPotato(旧OXIDリゾルバ、Win10 1809/Server2019で死亡)、RoguePotato(リモートOXID/135)、PrintSpoofer(spoolssパイプ)、GodPotato(汎用DCOM/RPC、Win8-11/2012-2022で有効)、EfsPotato(MS-EFSR)。IISアプリプールやMSSQLサービスアカウントは既定でSeImpersonateを持つため、Webシェル/SQLi→SYSTEMの定番踏み台になる。",
    "points": [
      "SeImpersonate保有サービスがSYSTEMトークンを奪取→SYSTEM昇格(T1134)",
      "特権悪用でCVEなし(特権自体はパッチ対象外)だが個別の誘発経路は逐次緩和。GodPotato/EfsPotato等は現行でも有効",
      "定番文脈: IISアプリプール/MSSQL(w3wp.exe/sqlservr.exe配下)",
      "監視: 4673/4674(特権使用)、異常な名前付きパイプ(Sysmon17/18)、サービス→SYSTEMシェル"
    ],
    "related": [
      "abusableprivs",
      "token",
      "tokentheft",
      "namedpipe",
      "coercion"
    ]
  },
  {
    "id": "skeletonkey",
    "term": "スケルトンキー",
    "en": "Skeleton Key",
    "aka": "Skeleton Key, misc::skeleton, master password, DC LSASS patch, T1556.001",
    "cat": "prim",
    "body": "ドメインコントローラのlsass.exeをメモリ上でパッチ(Mimikatz misc::skeleton)し、RC4検証経路を細工することで、任意のドメインアカウントに対しハードコードされたマスターパスワード(既定\"mimikatz\")での認証を通す資格情報バイパス/持続化。各アカウントの本来のパスワードも並行して有効なままなので利用者は異常に気づかない。前提としてドメイン管理者権限とSeDebugPrivilege(LSASS注入)が必要で、認証を担う全DCへ適用する必要がある。メモリ上のみのためDC再起動で消える(再注入が必要)。RC4(etype 0x17)のみに作用し、AES強制環境では成立しない。",
    "points": [
      "DCのLSASSをメモリパッチしマスターパスワードを注入(T1556.001)",
      "前提: DA+SeDebug、全DCへ適用、再起動で消滅(非永続)",
      "RC4のみ—AES強制(RC4無効化)で成立不可。RunAsPPLでLSASS注入を妨害(Credential GuardはDC非対応)",
      "監視: 4673/4611、注入後のRC4(0x17)ログオン、LSASSアクセス(Sysmon10)"
    ],
    "related": [
      "lsass",
      "kerberos",
      "etype",
      "creddump",
      "ppl"
    ]
  },
  {
    "id": "timeroast",
    "term": "Timeroasting",
    "en": "Timeroasting",
    "aka": "Timeroast, MS-SNTP, trustroasting, computer account, hashcat 31300",
    "cat": "prim",
    "body": "Secura(Tom Tervoort)が2023年に公表した、MicrosoftのSNTP認証拡張(MS-SNTP)を悪用するオフラインパスワードクラック手法。完全に未認証の攻撃者が、認証子フィールドにコンピュータアカウントのRIDだけを載せた細工NTP/SNTP要求をDCへ送ると、DCはコンピュータアカウントのNTハッシュ(MD4)を鍵としたMD5クリプトチェックサムを返す—認証もログもなしに。RIDを列挙して1アカウント1チェックサムを収集し、オフラインでクラックする。マシンアカウントの既定パスワードは120文字ランダムで事実上解けないが、弱い/手動設定のコンピュータ・信頼アカウント(アプライアンス・レガシー参加・事前準備アカウント)が本当のリスク。hashcatモード31300。",
    "points": [
      "未認証でRIDごとにコンピュータアカウントのクラック材料を収集(ログなし)",
      "リスクは弱い/手動設定のコンピュータ・信頼アカウントのみ(既定は強固)",
      "CVEなし—MS-SNTPの設計弱点。hashcat 31300でオフラインクラック",
      "監視困難(通常NTPに酷似)。対策はパスワード強度とNTP露出制限"
    ],
    "related": [
      "rid",
      "machineacct",
      "kerberoast",
      "nthash",
      "tdo"
    ]
  },
  {
    "id": "uacbypass",
    "term": "UAC バイパス",
    "en": "UAC Bypass",
    "aka": "fodhelper, eventvwr, ICMLuaUtil, auto-elevate, UACME, T1548.002",
    "cat": "prim",
    "body": "中程度整合性のプロセスからUAC同意プロンプトなしに高整合性プロセスを得る手法群。自動昇格(autoElevate=true)する署名済みMSバイナリと、それらが信頼するHKCUの状態を悪用する。古典的なfodhelperはHKCU\\Software\\Classes\\ms-settings\\shell\\open\\commandに空のDelegateExecuteでペイロードを書き込み、fodhelper.exe(高整合性へ自動昇格)がms-settingsハンドラを乗っ取られたHKCUキーから解決して実行する。eventvwr.exe(mscfile)やcomputerdefaults.exe/sdclt.exeも同様。ICMLuaUtilはCOMベースのバイパス。Microsoftは「UACはセキュリティ境界ではない」との立場で多くは仕様扱い=現行でも有効。",
    "points": [
      "自動昇格バイナリ+HKCUクラス乗っ取りで無警告に高整合性化(T1548.002)",
      "代表: fodhelper(ms-settings)/eventvwr(mscfile)/ICMLuaUtil(COM)",
      "監視: HKCU\\...\\shell\\open\\commandへの書込(Sysmon13)、fodhelper→シェル",
      "Microsoftは仕様扱い—多くは未修正。Always Notify+管理者権限剥奪で緩和"
    ],
    "related": [
      "uac",
      "integrity",
      "registry",
      "abusableprivs",
      "lolbin"
    ]
  },
  {
    "id": "logonevents",
    "term": "ログオンイベント(4624/4625/4634/4648)",
    "en": "Logon Events 4624 / 4625 / 4634 / 4648",
    "aka": "4624, 4625, 4634, 4647, 4648, logon success/failure, Logon Type",
    "cat": "logging",
    "body": "SOCのトリアージで最も多用されるホスト側テレメトリ。4624=ログオン成功、4625=ログオン失敗、4634/4647=ログオフ、4648=明示的資格情報でのログオン(runas/横展開の痕跡)。各イベントはログオンタイプ(2=対話/3=ネットワーク/9=NewCredentials/10=RDP/5=サービス等)、アカウント名、送信元IP・ワークステーション名、ログオンID(LUID)を含み、横展開・総当たり・不審ログオン調査の起点になる。特に「Type3の失敗(4625)が多数の異なるアカウントで少数ずつ」=パスワードスプレー、「Type10成功の異常な送信元」=RDP侵害、「4648の連鎖」=資格情報を使った横展開の兆候として読む。DC側の4768/4769等はKerberos、こちらは各ホストのローカル/ネットワークログオンを捉える。",
    "points": [
      "4624成功/4625失敗/4634-4647ログオフ/4648明示的資格情報",
      "鍵はLogon Type+送信元IP+アカウント(横展開/スプレー/RDP侵害の判別)",
      "Type3失敗が多アカウント少数=スプレー、Type10異常送信元=RDP侵害",
      "DC側4768/4769(Kerberos)と補完—こちらはホスト側ログオン"
    ],
    "related": [
      "logontype",
      "authevents",
      "acctmgmtevents",
      "passwordspray",
      "rdp"
    ]
  },
  {
    "id": "acctmgmtevents",
    "term": "アカウント/グループ管理イベント",
    "en": "Account & Group Management Events",
    "aka": "4720, 4722, 4725, 4726, 4728, 4732, 4756, 4738, 4740, group membership change",
    "cat": "logging",
    "body": "アカウントの作成・変更やグループ加入を捉える、永続化・権限付与検知の中核ログ(Securityログ)。4720=ユーザー作成、4722=有効化、4725/4726=無効化/削除、4738=アカウント変更、4740=ロックアウト。グループ加入は4728(グローバル)/4732(ローカル)/4756(ユニバーサル)で、特に「Domain Adminsに追加」「Enterprise Adminsに追加」は最優先アラート。4720直後に4728でDomain Admins加入=攻撃者による特権アカウント作成の典型シグネチャ。4740のロックアウト多発は主に単一アカウントへの総当たりや設定不備を示す(慎重なスプレーは閾値を避けるため4740を出しにくい)。SIEMでは特権グループの加入・アカウント作成をユーザー/資産コンテキストで相関する。",
    "points": [
      "4720作成/4738変更/4725-4726無効化・削除/4740ロックアウト",
      "グループ加入: 4728(グローバル)/4732(ローカル)/4756(ユニバーサル)",
      "最優先: Domain/Enterprise Admins等の特権グループ加入",
      "4720→4728(DA加入)=特権アカウント作成の典型シグネチャ"
    ],
    "related": [
      "logonevents",
      "privgroups",
      "group",
      "sidhistory",
      "adminsdholder"
    ]
  },
  {
    "id": "eventlogclear",
    "term": "イベントログ消去・改ざん",
    "en": "Event Log Clearing / Tampering (1102 / 104)",
    "aka": "1102, 104, wevtutil cl, Clear-EventLog, anti-forensics, T1070.001",
    "cat": "logging",
    "body": "攻撃者が痕跡隠蔽(アンチフォレンジック)としてイベントログを消去・改ざんする行為で、それ自体が高シグナルの侵害指標(MITRE T1070.001)。Securityログの全消去はEvent ID 1102(監査ログがクリアされた)、System/その他ログの消去は104として記録される。wevtutil cl、Clear-EventLog、PowerShell/API経由のクリア、個別イベント削除ツール(Invoke-Phant0m等でスレッド停止)やログサービス停止も含む。正規のログローテーションと区別するため、消去の主体・時刻・直前の活動を相関する。WEF/SIEMへ即時転送していればローカル消去後も証跡が残るため、集中ログ化が最重要の対策となる。",
    "points": [
      "Security全消去=1102、System等=104(それ自体が侵害指標T1070.001)",
      "手段: wevtutil cl / Clear-EventLog / ログサービス停止 / スレッド停止",
      "対策: WEF/SIEMへ即時転送すればローカル消去後も証跡が残る",
      "消去の主体・時刻・直前活動を相関し正規ローテーションと区別"
    ],
    "related": [
      "eventlog",
      "wef",
      "etwbypass",
      "siem"
    ]
  },
  {
    "id": "dnslogging",
    "term": "DNS ログ / DNS 解析ログ",
    "en": "DNS Logging / DNS Analytical Log",
    "aka": "DNS analytical log, DNS debug log, Sysmon 22, C2, DGA, DNS tunneling",
    "cat": "logging",
    "body": "DNSクエリのログはC2コールバック・DGA(ドメイン生成アルゴリズム)・DNSトンネリングによる持ち出しを捉える重要テレメトリ。取得源はWindows DNSサーバの解析ログ(Analytical Log)やデバッグログ、エンドポイント側のSysmon Event ID22(DNSクエリ)、DNSファイアウォール/リゾルバのログ。検知観点は、高頻度・高エントロピー・ランダム文字列のサブドメイン(DGA/トンネリング)、長大なTXT/NULLレコード応答、新規登録ドメイン(NRD)への通信、既知C2ドメインとの照合、単一ホストからの異常なクエリ量。プロセス紐付け(Sysmon22はQueryName+Image)により、どのプロセスが不審な名前解決を行ったかを特定できる。",
    "points": [
      "用途: C2コールバック/DGA/DNSトンネリング(持ち出し)の検知",
      "取得源: DNSサーバ解析ログ、Sysmon EID22(QueryName+Image)、リゾルバログ",
      "観点: 高エントロピーサブドメイン、長大TXT/NULL、新規登録ドメイン(NRD)",
      "プロセス紐付けで不審な名前解決の主体を特定"
    ],
    "related": [
      "sysmon",
      "c2",
      "networktelemetry",
      "adidns"
    ]
  },
  {
    "id": "networktelemetry",
    "term": "ネットワーク監視データ",
    "en": "Network Telemetry (NSM / Zeek / NetFlow / PCAP)",
    "aka": "NSM, Zeek, Bro, NetFlow, IPFIX, PCAP, proxy logs, JA3, JA4",
    "cat": "logging",
    "body": "エンドポイント中心の可視化を補完する、SOCのネットワーク側テレメトリ。フルパケットキャプチャ(PCAP)は最も詳細だが保管コストが高い。Zeek(旧Bro)は接続・DNS・HTTP・TLS・ファイル転送等をメタデータ(conn.log等)に構造化するNSMの定番。NetFlow/IPFIXは送受信元IP・ポート・バイト数等のフローサマリで大量トラフィックの俯瞰・ビーコン検知に有効。プロキシ/WebゲートウェイログはURL・ユーザーエージェント・宛先を捉えC2やダウンロードを分析する。TLS普及で中身は見えにくくなったが、JA3/JA4フィンガープリント、SNI、証明書、通信の周期性(ビーコニング)といったメタデータから悪性通信を推定する。",
    "points": [
      "階層: PCAP(詳細/高コスト)→Zeekメタデータ→NetFlow(俯瞰)→プロキシ",
      "Zeek=接続/DNS/HTTP/TLSを構造化、NetFlow=フローサマリでビーコン検知",
      "TLS時代はJA3/JA4・SNI・証明書・周期性で悪性推定",
      "エンドポイント(EDR)とネットワーク(NSM)の両輪で可視化"
    ],
    "related": [
      "dnslogging",
      "c2",
      "sysmon",
      "exfil"
    ]
  },
  {
    "id": "emailauth",
    "term": "メール認証(SPF/DKIM/DMARC)",
    "en": "Email Authentication (SPF / DKIM / DMARC)",
    "aka": "SPF, DKIM, DMARC, ARC, spoofing, header analysis, Authentication-Results",
    "cat": "logging",
    "body": "送信者ドメインのなりすまし(スプーフィング)を検証するメール認証の3本柱で、フィッシング/BECのヘッダ解析トリアージの必須知識。SPF(Sender Policy Framework)は送信元IPが当該ドメインの許可送信サーバかをDNSのTXTで検証。DKIM(DomainKeys Identified Mail)は送信側が本文/ヘッダにデジタル署名し、受信側がDNS公開鍵で改ざん・正当性を検証。DMARCはSPF/DKIMの「アライメント」(Fromドメインとの一致)を評価し、失敗時のポリシー(none/quarantine/reject)とレポートを規定する。解析ではAuthentication-Resultsヘッダのpass/fail、Return-Path・From・Reply-Toの不一致、正規ドメインに酷似したルックアライク(homoglyph)を確認する。DMARC=rejectでも、正規ドメインの侵害や表示名詐称・類似ドメインは防げない点に注意。",
    "points": [
      "SPF=送信IP検証 / DKIM=署名検証 / DMARC=アライメント+ポリシー",
      "解析: Authentication-Results、From/Return-Path/Reply-Toの不一致",
      "類似ドメイン(homoglyph)・表示名詐称・正規ドメイン侵害は認証を通り得る",
      "BEC/フィッシングのヘッダトリアージの基礎"
    ],
    "related": [
      "phishing",
      "entralogs",
      "illicitconsent",
      "aitm"
    ]
  },
  {
    "id": "ransomware",
    "term": "ランサムウェア / 二重恐喝",
    "en": "Ransomware & Double Extortion",
    "aka": "ransomware, double extortion, RaaS, human-operated, data leak site",
    "cat": "soc",
    "body": "現在最大のインシデント種別。現代の人手による(human-operated)ランサムウェアは単なる暗号化ではなく、初期侵入→探索→権限昇格→横展開→データ持ち出し→暗号化という運用型キルチェーンを踏み、暗号化前にデータを窃取して「支払わなければ公開する」二重恐喝(さらにDDoSや顧客通知を加えた多重恐喝)を行う。RaaS(Ransomware-as-a-Service)によりアフィリエイトが分業で実行し、正規管理ツール(PsExec/GPO/PDQ)で全社展開する。SOCの勝機は暗号化(最終段)ではなく前段—初期アクセス、Cobalt Strike等のC2、資格情報窃取、探索コマンド、バックアップ(VSS)削除、大量アウトバウンド—の早期検知にある。滞留時間の短縮とオフライン/不変バックアップが被害を左右する。",
    "points": [
      "運用型キルチェーン: 侵入→探索→昇格→横展開→持ち出し→暗号化",
      "二重恐喝: 暗号化+窃取データ公開の脅迫(多重恐喝へ発展)",
      "RaaSで分業、正規ツール(PsExec/GPO/PDQ)で全社展開",
      "検知は前段(C2/資格情報/探索/VSS削除/大量送信)で—暗号化は手遅れ"
    ],
    "related": [
      "killchain",
      "c2",
      "remoteexec",
      "exfil",
      "vss"
    ]
  },
  {
    "id": "malwaretypes",
    "term": "マルウェア分類",
    "en": "Malware Taxonomy (RAT / Loader / Infostealer / Wiper)",
    "aka": "RAT, loader, dropper, infostealer, stealer, wiper, botnet, rootkit, bootkit",
    "cat": "soc",
    "body": "観測した挙動を機能で分類し、影響範囲(スコープ)と対応優先度を素早く判断するための語彙。主な型: ドロッパー/ローダー(次段ペイロードを取得・実行する初期段)、RAT(Remote Access Trojan、遠隔操作)、インフォスティーラー(ブラウザ資格情報・Cookie・暗号資産を窃取、近年のアラート量を席巻)、バンキングトロジャン、ボット/ボットネット(C2配下の群)、ランサムウェア(暗号化・恐喝)、ワイパー(破壊)、ルートキット/ブートキット(隠蔽・持続)、クリプトマイナー。1検体が複数機能を持つことも多い。特にスティーラーが盗んだセッションCookieはMFAを迂回するため、感染=単なる駆除でなく資格情報・トークンの失効(セッション無効化)まで対応する必要がある。",
    "points": [
      "型: ローダー/ドロッパー・RAT・スティーラー・ボット・ランサム・ワイパー・ルートキット",
      "インフォスティーラーが近年のアラート量を席巻(Cookie/資格情報窃取)",
      "スティーラーのセッションCookie窃取はMFAを迂回",
      "分類→影響範囲と対応(駆除+資格情報/トークン失効)を判断"
    ],
    "related": [
      "c2",
      "procinjection",
      "tokentheft",
      "sandbox",
      "ir"
    ]
  },
  {
    "id": "phishing",
    "term": "フィッシング / 標的型メール / BEC",
    "en": "Phishing / Spearphishing & BEC",
    "aka": "phishing, spearphishing, BEC, business email compromise, quishing, T1566",
    "cat": "soc",
    "body": "最大の初期アクセス経路であり、SOCの日常トリアージ対象。無差別フィッシング、特定個人を狙う標的型(spearphishing)、正規/侵害アカウントを装い送金や情報を詐取するBEC(ビジネスメール詐欺)に大別される(MITRE T1566)。手口は悪性リンク(認証情報窃取ページ/AiTMプロキシ)、悪性添付(マクロ/ISO/LNK/HTML密輸)、QRコード(quishing)、返信スレッド乗っ取り等。解析ではメール認証(SPF/DKIM/DMARC)、送信元・ヘッダ、URL/添付のサンドボックス、着弾範囲(誰に届き誰がクリックしたか)を調べ、クリック済みなら資格情報リセット・トークン失効・エンドポイント隔離へ展開する。ユーザー報告と自動検知の両輪で回す。",
    "points": [
      "型: 無差別/標的型(spearphishing)/BEC(送金・情報詐取)(T1566)",
      "手口: 悪性リンク(AiTM)・添付(マクロ/ISO/LNK/HTML密輸)・quishing",
      "解析: メール認証・ヘッダ・URL/添付サンドボックス・着弾範囲",
      "クリック後: 資格情報リセット・トークン失効・端末隔離"
    ],
    "related": [
      "emailauth",
      "aitm",
      "illicitconsent",
      "sandbox",
      "mfafatigue"
    ]
  },
  {
    "id": "vulnmgmt",
    "term": "脆弱性管理(CVE/CVSS/EPSS/KEV)",
    "en": "Vulnerability Management (CVE / CVSS / EPSS / KEV)",
    "aka": "CVE, CVSS, EPSS, CISA KEV, patch management, known exploited vulnerabilities",
    "cat": "soc",
    "body": "脆弱性を識別・評価・優先度付けして修復に結びつける規律で、アナリストが脅威と検知網羅を対応づける基礎語彙。CVE=個別脆弱性の一意識別子。CVSS=深刻度スコア(0-10、基本値)だが「悪用されやすさ」は表さない。EPSS=今後30日以内に実際に悪用される確率の予測。CISA KEV(Known Exploited Vulnerabilities)=現に悪用が確認された脆弱性の一覧で、実運用の修復優先度の要となる。実務では「CVSS高」だけでなく「KEV掲載+EPSS高+自組織で露出/資産価値が高い」を掛け合わせて優先する。SOCは新規KEV/大型CVEに対し、自組織の露出確認と検知ルール/ハンティングの有無を即座に照合する。",
    "points": [
      "CVE=識別子 / CVSS=深刻度 / EPSS=悪用確率 / KEV=悪用確認済みリスト",
      "CVSS高≠悪用されやすい—KEV+EPSS+自組織の露出で優先度を決める",
      "新規KEV/大型CVEは露出確認と検知網羅の照合を即実施",
      "脆弱性管理と検知エンジニアリング/脅威ハンティングを連携"
    ],
    "related": [
      "cti",
      "mitreattack",
      "deteng",
      "threathunting"
    ]
  },
  {
    "id": "obfuscation",
    "term": "難読化・パッキング・エンコード",
    "en": "Obfuscation, Packing & Encoding",
    "aka": "Base64, PowerShell -enc, packer, crypter, entropy, deobfuscation, T1027",
    "cat": "soc",
    "body": "検知回避・解析妨害のためにペイロードやコマンドを変形する手法群(MITRE T1027)。コマンドライン難読化(PowerShellの-EncodedCommand/Base64、文字列連結・逆順・環境変数展開、Invoke-Obfuscation)、パッカー/クリプター(実行ファイルを圧縮・暗号化しメモリ上で復号=高エントロピー化)、エンコード多段(Base64+gzip+XOR)などがある。SOCの観点では、Base64/長大なエンコード文字列を含むコマンドライン、異常に高いPEエントロピー、AMSIが復元した平文スクリプト(スクリプトブロックログ)から実体を捉える。難読化そのものが弱い異常シグナルであり、デオブフスケーション(復号・整形)がトリアージの一手となる。",
    "points": [
      "手段: コマンド難読化(PS -enc/Base64)、パッカー/クリプター、多段エンコード",
      "検知: 長大Base64コマンドライン、高PEエントロピー、AMSI復元後の平文",
      "難読化の存在自体が弱い異常シグナル(T1027)",
      "デオブフスケーション(復号・整形)がトリアージの一手"
    ],
    "related": [
      "amsi",
      "pslogging",
      "peformat",
      "lolbin",
      "yara"
    ]
  },
  {
    "id": "memforensics",
    "term": "メモリフォレンジック",
    "en": "Memory Forensics (RAM Analysis / Volatility)",
    "aka": "Volatility, RAM analysis, memory dump, fileless, malfind, WinPmem",
    "cat": "soc",
    "body": "物理メモリ(RAM)のダンプを解析し、ディスクに痕跡を残さないファイルレス/注入コードや、隠蔽されたプロセス・接続を復元するDFIR手法。代表ツールはVolatility(3系)で、実行中プロセス一覧・親子関係、隠蔽/アンリンクされたプロセス(psscan)、ネットワーク接続(netscan)、注入コード領域(malfind=RWXの無名メモリ)、ロード済みDLL/ドライバ、コマンド履歴、資格情報の痕跡などを抽出する。EDRが見逃した/改ざんされた事象の裏取りや、暗号化前のマルウェア設定・鍵の回収に有効。取得はライブ(WinPmem等)またはハイバネーション/クラッシュダンプから行い、揮発性が高いため保全順序(order of volatility)上は優先度が高い。",
    "points": [
      "RAMダンプから注入コード・隠蔽プロセス・接続・資格情報痕跡を復元",
      "Volatility: pslist/psscan(隠蔽)、malfind(RWX注入)、netscan",
      "ファイルレス/EDR回避の裏取り、マルウェア設定・鍵の回収に有効",
      "揮発性が高く保全順序で優先—ライブ取得(WinPmem)等"
    ],
    "related": [
      "procinjection",
      "reflectiveload",
      "ntfsart",
      "ir"
    ]
  },
  {
    "id": "purpleteam",
    "term": "レッド/ブルー/パープルチーム",
    "en": "Red / Blue / Purple Team & Adversary Emulation",
    "aka": "red team, blue team, purple team, Atomic Red Team, Caldera, adversary emulation",
    "cat": "soc",
    "body": "セキュリティ組織の役割分担。レッドチームは攻撃者を模して侵入・検知回避を試み、ブルーチームは検知・防御・対応を担う。パープルチームは両者を協調させ、攻撃技術(TTP)を実行しながらリアルタイムで検知の有無を確認し、ギャップを検知ルールへ即時反映する共同演習を指す。攻撃エミュレーション(adversary emulation)はMITRE ATT&CKのTTPを再現して検知網羅を客観評価する営みで、Atomic Red Team(技術単位の軽量テスト)やMITRE Caldera(自動化)が使われる。SOCにとっては、Sigma/ハンティング/検知ルールが「実際に発火するか」を検証し、机上でなく実測で検知能力を高める手段となる。",
    "points": [
      "レッド=攻撃側 / ブルー=防御側 / パープル=両者協調で検知ギャップを即修正",
      "攻撃エミュレーション: ATT&CK TTP再現で検知網羅を客観評価",
      "ツール: Atomic Red Team(軽量)、MITRE Caldera(自動化)",
      "検知ルール/ハンティングを実測で検証・改善する手段"
    ],
    "related": [
      "mitreattack",
      "sigma",
      "deteng",
      "threathunting"
    ]
  },
  {
    "id": "deteng",
    "term": "検知エンジニアリング",
    "en": "Detection Engineering / Detection-as-Code",
    "aka": "detection engineering, detection-as-code, tuning, FP reduction, coverage",
    "cat": "soc",
    "body": "脅威に対する検知ロジックを設計・実装・検証・運用・改善する規律。単発のルール作成でなく、ソフトウェア開発のようにバージョン管理(Git)・テスト・CI/CD・レビューを伴う「検知のコード化(Detection-as-Code)」として運用するのが現代的潮流。作業はユースケース定義→データソース確認→ロジック記述(Sigma/KQL/EQL等)→FP/FN検証→チューニング(除外・閾値・コンテキスト付与)→ATT&CKへのマッピングでカバレッジ管理、というライフサイクルを回す。誤検知(FP)の抑制とカバレッジの網羅を両立させ、脅威ハンティングで見つかった手口を再現可能な検知へ昇華させる。SOCの成熟度を左右する中核機能である。",
    "points": [
      "検知ロジックの設計→実装→検証→チューニング→運用のライフサイクル",
      "Detection-as-Code: Git/テスト/CI/CD/レビューで検知を管理",
      "ATT&CKマッピングでカバレッジ可視化、FP抑制と網羅を両立",
      "ハンティングの発見を再現可能な検知へ昇華"
    ],
    "related": [
      "sigma",
      "advhunting",
      "threathunting",
      "mitreattack",
      "triage"
    ]
  },
  {
    "id": "remoteexec",
    "term": "リモートサービス実行・管理共有",
    "en": "Remote Service Execution & Admin Shares",
    "aka": "PsExec, SMBExec, WMIExec, DCOM, ADMIN$, C$, IPC$, lateral movement, T1021",
    "cat": "prim",
    "body": "Windowsの定番横展開パターン。管理共有(ADMIN$=%windir%、C$=システムドライブ、IPC$=プロセス間通信)へSMB(445)で接続し、リモートでコードを実行する。PsExecはADMIN$へサービスバイナリを設置しSCM経由でサービスとして起動(新規サービスEvent 7045/4697)。WMIExecはWMI(DCOM/Win32_Process.Create)で、SMBExecはサービス+名前付きパイプで、DCOM実行はMMC20/ShellWindows等のCOMオブジェクトで、いずれも認証済み管理者権限を前提にSYSTEMまたは当該ユーザー権限で実行する。検知は管理共有アクセス(5140/5145)、新規サービス(7045)、ネットワークログオン(4624 Type3)、親プロセス(services.exe/WmiPrvSE.exe)配下の不審な子プロセスを相関する。Pass-the-Hash等と組み合わさることが多い。",
    "points": [
      "管理共有(ADMIN$/C$/IPC$)へSMB接続しリモート実行(T1021)",
      "PsExec=サービス(7045)、WMIExec=Win32_Process、DCOM=COMオブジェクト",
      "監視: 5140/5145(共有)、7045/4697(サービス)、4624 Type3、WmiPrvSE配下の子",
      "Pass-the-Hash/資格情報窃取と併用されることが多い"
    ],
    "related": [
      "smb",
      "service",
      "wmi",
      "pth",
      "proctree"
    ]
  },
  {
    "id": "discovery",
    "term": "探索・列挙(Discovery)",
    "en": "Discovery / Reconnaissance",
    "aka": "net, nltest, whoami, systeminfo, LDAP recon, situational awareness, T1087, T1018",
    "cat": "prim",
    "body": "侵入後、攻撃者が環境を把握するための情報収集段階(MITRE TA0007)。組込みコマンド(whoami /all、net user/group/localgroup、net view、nltest /dclist・/domain_trusts、systeminfo、ipconfig、tasklist、query user)やLDAPクエリ、SPN列挙、共有列挙、null/匿名セッションでのドメイン情報取得などが典型。単発では正常管理と紛れるが、短時間に多数の探索コマンドが連続する「バースト」は初期段階の強い検知機会となる。BloodHound等の自動列挙は大量のLDAP/SAMR/セッション照会を生む。SOCはコマンドライン(Sysmon1/4688)やLDAP/SAMRの異常量、非管理者端末からのドメイン列挙を相関して早期に捉える。",
    "points": [
      "組込み: whoami/net/nltest/systeminfo/tasklist/query、LDAP・SPN・共有列挙",
      "単発は正常と紛れるが、探索コマンドのバーストは強い検知機会",
      "BloodHound等は大量のLDAP/SAMR/セッション照会を生成",
      "監視: コマンドライン(Sysmon1/4688)、LDAP/SAMR異常量、匿名セッション"
    ],
    "related": [
      "bloodhound",
      "ldap",
      "proctree",
      "remoteexec",
      "adws"
    ]
  },
  {
    "id": "ppidspoof",
    "term": "親プロセスID偽装(PPID Spoofing)",
    "en": "Parent Process ID (PPID) Spoofing",
    "aka": "PPID spoofing, parent spoofing, PROC_THREAD_ATTRIBUTE_PARENT_PROCESS, T1134.004",
    "cat": "prim",
    "body": "プロセス生成時に本来の親と異なるプロセスを親に見せかける防御回避手法(MITRE T1134.004)。CreateProcessのUpdateProcThreadAttribute(PROC_THREAD_ATTRIBUTE_PARENT_PROCESS)で任意の既存プロセス(例:explorer.exe)を親に指定でき、実際の生成元を隠してプロセスツリー(系譜)ベースの検知を欺く。加えてトークンも指定プロセスから継承され得るため権限昇格にも悪用される。「正常なプロセスツリー」ヒューリスティックだけに頼るとこれで回避されるため、SOCはSysmon Event 1のParentProcessIdと実際の生成関係の齟齬、偽装親から不整合な整合性レベル/セッションで起動される子、EDRのカーネルコールバックが捉える真の生成元を用いて検知する。",
    "points": [
      "CreateProcessの親プロセス属性で任意プロセスを親に偽装(T1134.004)",
      "proctree(系譜)ヒューリスティックを欺き、トークン継承で昇格も",
      "単純な親子検知の弱点—EDRカーネルテレメトリで真の生成元を捕捉",
      "齟齬(親と不整合な整合性/セッションの子)を相関"
    ],
    "related": [
      "proctree",
      "procinjection",
      "token",
      "sysmon"
    ]
  },
  {
    "id": "reflectiveload",
    "term": "リフレクティブ/インメモリ実行",
    "en": "Reflective / In-Memory Loading & Shellcode",
    "aka": "reflective DLL, in-memory, fileless, Assembly.Load, execute-assembly, IEX, T1620",
    "cat": "prim",
    "body": "ディスクにファイルを書かずメモリ上でコードをロード・実行するファイルレス実行手法(MITRE T1620ほか)。リフレクティブDLL注入(ローダーがOSのLoadLibraryを介さずDLLを自前でメモリ展開)、シェルコードの直接実行、.NETのAssembly.Load/Cobalt Strikeのexecute-assembly(アセンブリをメモリで実行)、PowerShellのIEX(ダウンロード文字列を直接実行)などが該当する。ディスクベースのAVやMOTW/署名検査を回避し、C2のポストエクスプロイトの標準手段となっている。検知はディスクではなくメモリと挙動—RWXの無名メモリ領域、既知プロセスからの不審なメモリ確保、AMSI(.NET/PSのインメモリを可視化)、ETW、EDRのメモリスキャンに依存する。",
    "points": [
      "ディスク不使用でメモリ上にロード/実行(ファイルレス、T1620)",
      "例: リフレクティブDLL、execute-assembly、PowerShell IEX、直接シェルコード",
      "AV/MOTW/署名を回避—C2ポストエクスプロイトの標準",
      "検知: RWX無名メモリ、AMSI/ETW、EDRメモリスキャン(ディスクでなく挙動)"
    ],
    "related": [
      "procinjection",
      "amsi",
      "memforensics",
      "c2",
      "peformat"
    ]
  },
  {
    "id": "exfil",
    "term": "データ持ち出し・ステージング",
    "en": "Data Exfiltration & Staging",
    "aka": "exfiltration, staging, archive, rar/7zip, rclone, cloud upload, T1041, T1567, T1074",
    "cat": "prim",
    "body": "多くの侵入の最終目的である情報の外部持ち出し段階(MITRE TA0010)。典型は「ステージング(T1074)→圧縮/暗号化→送出」の流れで、まず対象データを1か所に集約しrar/7zip/zipで圧縮(しばしばパスワード付き)してから、C2チャネル経由(T1041)、正規クラウドストレージ/Web(T1567、mega・dropbox・rclone等)、DNS/ICMPトンネリング、メール等で送出する。二重恐喝ランサムの前段でもある。検知は、大容量の圧縮ファイル生成、rclone/megacmd等のツール、単一ホストからの異常な大量アウトバウンド、通常業務外の宛先/時間帯、DLPアラート、DNS/HTTPの異常量を相関する。持ち出し(送信)を検知できれば暗号化前に止められる可能性がある。",
    "points": [
      "流れ: ステージング(集約)→圧縮/暗号化(rar/7zip)→送出",
      "経路: C2(T1041)/クラウド・Web(T1567、rclone等)/トンネリング/メール",
      "二重恐喝ランサムの前段—ここで止めれば暗号化前に阻止できる",
      "検知: 大容量圧縮生成、異常アウトバウンド量、DLP、異常な宛先/時間"
    ],
    "related": [
      "ransomware",
      "c2",
      "networktelemetry",
      "dnslogging",
      "bits"
    ]
  },
  {
    "id": "adcsesc",
    "term": "AD CS ドメイン昇格(ESC)",
    "en": "AD CS Domain Escalation (ESC1–ESC16)",
    "aka": "ESC1, ESC8, ESC13, Certified Pre-Owned, SpecterOps, certificate abuse",
    "cat": "pki",
    "body": "SpecterOpsが体系化したAD CS(証明書サービス)のドメイン昇格手法群(ESC1〜ESC16)。テンプレートやCAの設定不備を突き、低権限ユーザーが高権限アカウントの証明書を取得してPKINITで認証し昇格する。代表例: ESC1(登録者がsubject任意指定可+クライアント認証EKU→任意ユーザーになりすまし証明書)、ESC2(Any Purpose EKU)、ESC3(登録代理)、ESC4(テンプレートACL弱設定)、ESC6(EDITF_ATTRIBUTESUBJECTALTNAME2でSANを任意付与)、ESC7(CA権限)、ESC8(Web登録エンドポイントへのNTLMリレー)、ESC9/ESC10(証明書マッピングの弱さ)、ESC11(ICPRリレー)、ESC13(発行ポリシーOIDによるグループ付与)。取得証明書は失効やパスワード変更に影響されず永続的な足がかりになる。監視はEvent 4886/4887(証明書要求/発行)、異常なSAN、Web登録へのNTLM認証。",
    "points": [
      "テンプレ/CAの設定不備で低権限→高権限証明書を取得しPKINIT認証",
      "代表: ESC1(SAN任意)/ESC6(CA側SAN)/ESC8(Web登録へNTLMリレー)/ESC13(OID→グループ)",
      "証明書は失効/パスワード変更に強く永続的な足がかり",
      "監視: 4886/4887(要求/発行)、異常SAN、Web登録へのNTLM"
    ],
    "related": [
      "adcs",
      "template",
      "san",
      "pkinit",
      "ntlmrelay"
    ]
  },
  {
    "id": "hybridauth",
    "term": "ハイブリッド認証方式(PHS/PTA/フェデレーション)",
    "en": "Hybrid Authentication (PHS / PTA / Federation)",
    "aka": "Password Hash Sync, Pass-through Authentication, Federation, ADFS, PTA agent",
    "cat": "cloud",
    "body": "オンプレADとEntra IDを連携する際のサインイン方式で、それぞれ攻撃対象領域が異なるため区別が重要。PHS(パスワードハッシュ同期)はADのパスワードハッシュのハッシュをEntraへ同期しクラウド側で認証—Entra Connect同期サーバとMSOL_同期アカウントが高価値標的。PTA(パススルー認証)はオンプレのPTAエージェントが認証を中継しクラウドにハッシュを置かない—が、悪性PTAエージェントを仕込むと平文資格情報を傍受できる。フェデレーション(ADFS等)はオンプレのIdPがSAML/トークンに署名—トークン署名証明書を盗めばGolden SAMLで任意ユーザーになりすませる。いずれもEntra Connectサーバの侵害はテナント全体の侵害に直結するTier0資産である。監視はサインインログの認証方式、同期アカウント、ADFS署名証明書アクセス。",
    "points": [
      "PHS=ハッシュ同期(クラウド認証)/PTA=エージェント中継/フェデレーション=IdP署名",
      "PHS: 同期サーバ・MSOLアカウントが標的、PTA: 悪性エージェントで資格情報傍受",
      "フェデレーション: トークン署名証明書窃取→Golden SAML",
      "Entra Connectサーバはテナント全体に直結するTier0資産"
    ],
    "related": [
      "entraconnect",
      "adfs",
      "goldensaml",
      "seamlesssso",
      "prt"
    ]
  },
  {
    "id": "intunemdm",
    "term": "Intune / MDM の悪用",
    "en": "Intune / MDM as Attack Surface",
    "aka": "Intune, MDM, device management, script push, cloud-to-device, remediation",
    "cat": "cloud",
    "body": "Intune等のMDM(モバイルデバイス管理)は、管理下の全エンドポイントへアプリ・構成・スクリプトを配布できる強力な管理面であり、侵害されると「クラウド→全端末」の一斉展開経路になる。Intune管理者(またはGlobal Admin/Intune Administratorロール)を奪取した攻撃者は、PowerShellスクリプトやWin32アプリ、修復(remediation)スクリプトを全デバイスまたは特定グループにSYSTEM権限でプッシュし、横展開・ランサム展開・資格情報窃取を面で実行できる。オンプレのGPO悪用のクラウド版に相当する。監視はIntuneのスクリプト/アプリ割当の変更(監査ログ)、新規デバイス構成プロファイル、権限ロールの付与、短時間での多数デバイスへの配布を相関する。",
    "points": [
      "MDMは全管理端末へアプリ/スクリプトをSYSTEMで配布=クラウド版GPO悪用",
      "Intune/Global Admin奪取→全端末へランサム/横展開を一斉実行",
      "監視: スクリプト/アプリ割当変更、構成プロファイル、ロール付与",
      "Tier0相当の管理面として厳格なアクセス制御・特権管理を"
    ],
    "related": [
      "entraroles",
      "gpoabuse",
      "condaccess",
      "devicejoin",
      "pim"
    ]
  },
  {
    "id": "unconstrained",
    "term": "制約なし委任",
    "en": "Unconstrained Delegation",
    "aka": "unconstrained delegation, TrustedForDelegation, TGT capture, printer bug",
    "cat": "auth",
    "body": "Kerberos委任の最も危険な形態。TrustedForDelegationフラグを持つホストへユーザーがKerberos認証すると、そのユーザーのTGTがホストのメモリ(LSA)に転送・保存される。攻撃者がこのホストを侵害すると、認証してきた任意ユーザー(管理者含む)のTGTを収集し、なりすませる。決定打はプリンタバグ(MS-RPRN)やPetitPotam(MS-EFSR)等の強制認証(coercion)で、DCのマシンアカウントを制約なし委任ホストへ認証させTGTを奪えば、DCSyncによりドメイン全体を掌握できる。制約付き委任/RBCDと異なり委任先の制限がないため被害が甚大。対策はDC/機微アカウントをProtected Users・「委任できない」設定にし、不要な制約なし委任を廃し、強制認証経路を塞ぐこと。監視はTrustedForDelegation属性の付与、coercionの兆候。",
    "points": [
      "TrustedForDelegationホストは認証者のTGTをメモリに保持→侵害で収集・なりすまし",
      "coercion(プリンタバグ/PetitPotam)でDCのTGTを奪取→DCSyncでドメイン掌握",
      "制約付き/RBCDと違い委任先無制限で被害甚大",
      "対策: Protected Users・委任不可設定・不要委任の廃止・強制認証遮断"
    ],
    "related": [
      "delegation",
      "s4u",
      "coercion",
      "tgt",
      "protectedusers"
    ]
  },
  {
    "id": "lockoutpolicy",
    "term": "アカウントロックアウト/パスワードポリシー",
    "en": "Account Lockout & Password Policy (incl. Fine-Grained PSO)",
    "aka": "lockout threshold, password policy, Fine-Grained Password Policy, PSO, 4740, 4625",
    "cat": "adstruct",
    "body": "パスワードの複雑性・長さ・有効期限やロックアウトの閾値を定める設定で、認証系アラートの正しい解釈に不可欠。既定ではドメインに単一のパスワードポリシー(Default Domain Policy)が適用されるが、Fine-Grained Password Policy(PSO=Password Settings Object)で特定グループ/ユーザーに個別ポリシーを割り当てられる(例:管理者に厳格な要件)。ロックアウト閾値は「N回失敗でM分ロック」を定め、超過でEvent 4740が発生する。攻撃者はこのロックアウトを避けるため、多数アカウントに少数回ずつ試すパスワードスプレー(ロックアウトを誘発しにくい)を選ぶ。逆に単一アカウントへの総当たりは4625多発+4740を生む。SOCはロックアウト嵐/失敗パターンからスプレーvs総当たりvs設定不整合を判別する。",
    "points": [
      "Default Domain Policyの単一適用+PSO(Fine-Grained)で個別割当",
      "ロックアウト閾値超過=Event 4740、失敗=4625",
      "スプレー=多アカウント少数試行(ロックアウト回避)、総当たり=単一に多数",
      "4625/4740のパターンからスプレー/総当たり/設定問題を判別"
    ],
    "related": [
      "passwordspray",
      "logonevents",
      "protectedusers",
      "gpo"
    ]
  },
  {
    "id": "u2u",
    "term": "User-to-User (U2U) 認証",
    "en": "User-to-User (U2U) Authentication",
    "aka": "ENC-TKT-IN-SKEY, KDCOptions bit 28, additional ticket / second ticket, S4U2Self+U2U",
    "cat": "auth",
    "body": "User-to-User (U2U) 認証は、相手(サーバー役)が長期鍵(通常はサービスアカウントのNTハッシュ由来の鍵)を持たない状況でもピア間認証を可能にするKerberosの拡張的な仕組み(RFC 4120 2.9.2, 3.7)。通常のTGS-REQではKDCがサービスチケットをサービスの長期鍵で暗号化するが、U2Uではクライアントがアプリケーション層の事前交換で入手した相手のTGTを「additional ticket(second ticket)」としてTGS-REQのadditional-ticketsフィールドに同梱し、KDC-REQ-BODYのkdc-options(KDCOptionsフラグ)にENC-TKT-IN-SKEYビット(bit 28)を立てて要求する。これはPA-DATAではなくKDCOptionsのフラグである点に注意。この要求によりKDCはサービスチケットをサービスの長期鍵ではなく、同梱されたTGTに含まれるセッション鍵で暗号化して返す。この仕組みはS4U2Self+U2Uの文脈で悪用され、ターゲットにSPNや攻撃者が知らない長期鍵(NTハッシュ)がなくても、攻撃者が自分自身の既知のTGTセッション鍵で暗号化させることでSPN登録を不要にしつつ、サービスチケットを既知の鍵でそのまま復号可能にする。この結果ターゲットの正規PACがそのまま得られる状態になり、Sapphire TicketやUnPAC-the-hash(getcredentials)がU2Uを踏み台にPACを正規に取得できる理由になっている。",
    "points": [
      "RFC 4120 2.9.2 / 3.7: ピア間(peer-to-peer)認証をKDC仲介で実現",
      "KDCOptionsフラグ ENC-TKT-IN-SKEY(bit 28、PA-DATAではない)をTGS-REQに設定し、相手のTGTを\"additional ticket\"としてadditional-ticketsフィールドに同梱",
      "サービスチケットはサービスの長期鍵ではなく同梱TGTのセッション鍵で暗号化",
      "S4U2Self+U2U: SPN不要かつターゲットの長期鍵(NTハッシュ)不要でチケット復号を実現(攻撃者は自分の既知TGTセッション鍵で復号)",
      "Sapphire Ticket / UnPAC-the-hash(getcredentials)がPAC取得に悪用"
    ],
    "related": [
      "kerberos",
      "krbmsgs",
      "s4u",
      "pac",
      "pkinit",
      "diamondticket"
    ]
  },
  {
    "id": "kdcerrcode",
    "term": "KDCエラーコード / 事前認証タイプ (KRB-ERROR / PreAuthType)",
    "en": "KDC Error Codes & Pre-Authentication Type (KRB-ERROR / PreAuthType Fields)",
    "aka": "KDC_ERR_PREAUTH_REQUIRED(25/0x19), KDC_ERR_C_PRINCIPAL_UNKNOWN(6/0x6), KDC_ERR_ETYPE_NOTSUPP(14/0xE), PA-ENC-TIMESTAMP(padata-type 2), PA-PK-AS-REQ(padata-type 16), 4768のResult Code・4771のFailure Code・両者のPre-Authentication Typeフィールド",
    "cat": "auth",
    "body": "KDCエラーコード(KRB-ERROR)は、KDCがAS-REQ/TGS-REQを処理できなかった際にRFC 4120準拠のerror-codeフィールドへ格納して返す数値で、代表的な値は事前認証が必要なことを示すKDC_ERR_PREAUTH_REQUIRED=25(0x19)、対象プリンシパルが存在しないKDC_ERR_C_PRINCIPAL_UNKNOWN=6(0x6)、要求された暗号化種別をKDCがサポートしないKDC_ERR_ETYPE_NOTSUPP=14(0xE)などである。これらはWindowsのセキュリティイベント4768(TGT要求)のResult Codeフィールド、および4771(Kerberos事前認証失敗)のFailure Codeフィールドに記録され、SOCはこの数値だけでアカウントの存在有無や暗号化ダウングレードの試行を判別できる。同じイベントのPre-Authentication Type(PreAuthType)フィールドはクライアントが用いたpadata(事前認証データ)方式を示し、PA-ENC-TIMESTAMP(padata-type 2)は通常のパスワードベース事前認証、PA-PK-AS-REQ(padata-type 16)は証明書ベースのPKINIT認証を意味し、値0は事前認証そのものが行われていないことを示す。マップ上の複数の技法──認証情報なしのユーザー列挙(エラーコードの違いで有効アカウントを判定)、AS-REP Roasting偵察(4768でPreAuthType=0を検出)、RC4ダウングレード拒否の検知(0xE)、Shadow CredentialsやPKINITベースの成りすまし検知(PreAuthType=16)──は、いずれもこのerror-codeとPreAuthTypeという2フィールドの意味を正確に読み取れることが前提になっており、断片的な数値の暗記ではなくフィールドの構造理解が検知ロジック構築の土台となる。",
    "points": [
      "KDC_ERR_PREAUTH_REQUIRED=25(0x19): 事前認証必須の応答、アカウント自体は存在",
      "KDC_ERR_C_PRINCIPAL_UNKNOWN=6(0x6): プリンシパル不在 → 無認証ユーザー列挙のシグナル",
      "KDC_ERR_ETYPE_NOTSUPP=14(0xE): 要求etype非対応、RC4ダウングレード拒否時などに出現",
      "PreAuthType: PA-ENC-TIMESTAMP=2(パスワード認証)、PA-PK-AS-REQ=16(PKINIT証明書認証)、0=事前認証なし(AS-REP Roast標的)",
      "4768のResult Code・4771のFailure Codeと、両イベントのPre-Authentication Typeフィールドがhunt/triageクエリの基本項目"
    ],
    "related": [
      "preauth",
      "kdc",
      "authevents",
      "asreproast",
      "pkinit",
      "etype"
    ]
  },
  {
    "id": "kerbsalt",
    "term": "Kerberos 鍵導出のソルトと反復回数 (string2key)",
    "en": "Kerberos Key Derivation: Salt & Iteration Count (string2key)",
    "aka": "string2key, S2K, RFC 3962, iteration count既定4096, salt=REALM+sAMAccountName(ユーザー) / REALM+host+FQDN(コンピュータ)",
    "cat": "auth",
    "body": "Kerberos の対称鍵導出は RFC 3961/3962 が定める string2key 関数(S2K)によって行われ、AES128/AES256 鍵はユーザーの平文パスワードと salt、既定 4096 回の iteration count を PBKDF2 類似の反復処理にかけることで導出される。salt の組み立てはアカウント種別で異なり、ユーザーアカウントは大文字化した REALM 名+大文字小文字を区別する sAMAccountName を連結したもの、コンピュータアカウントは大文字化した REALM 名+文字列 \"host\"+小文字化した FQDN ホスト名を連結したものとなる。これに対し RC4-HMAC(etype 23 / 0x17)は NT ハッシュ(MD4)をそのまま暗号鍵として使い salt も iteration count も介さないため、hashcat mode 13100(Kerberoasting)/18200(AS-REP Roasting)等によるオフライン解読が即座に成立する一方、AES 系は salt と 4096 回の反復コストが乗る分だけクラックが重く、辞書やレインボーテーブルの使い回しも困難になる(Kerberoasting=TGS-REP の AES ハッシュは hashcat mode 19600/19700 が対応するが、AS-REP Roasting で AES 専用アカウントに当たった場合は hashcat に専用モードがなく、John the Ripper の krb5asrep フォーマット等を使うのが実務上一般的)。この仕組みの帰結として、パスワード自体を変えなくても sAMAccountName や UPN、あるいはコンピュータ名(dNSHostName)を変更すれば salt が変わり、AES 鍵そのものと事前計算済みのクラック材料が無効化される。この点が Kerberoasting/AS-REP Roasting でのハッシュ形式・クラックツール選択や、Overpass-the-Hash/Pass-the-Key で「パスワードが変わらない限り同一鍵が有効」とされる根拠を正しく理解するうえで欠かせない。",
    "points": [
      "RFC 3961/3962のstring2key(S2K)関数: パスワード+salt+iteration countからAES128/256鍵を導出",
      "既定iteration count = 4096(AS-REPのPA-ETYPE-INFO2で通知)",
      "ユーザーアカウント: 大文字REALM+大文字小文字を区別するsAMAccountName",
      "コンピュータアカウント: 大文字REALM+\"host\"+小文字FQDNホスト名",
      "RC4-HMACはNTハッシュを無salt・無iterationでそのまま鍵に使用→即時オフライン解読が可能"
    ],
    "related": [
      "kerberos",
      "etype",
      "nthash",
      "kerberoast",
      "asreproast",
      "realm"
    ]
  },
  {
    "id": "sessionkey",
    "term": "Kerberos セッション鍵 / サブキー",
    "en": "Kerberos Session Key / Subkey",
    "aka": "AS-REP session key, TGS session key, authenticator subkey",
    "cat": "auth",
    "body": "セッション鍵(サブキー)は、AS-REP/TGS-REPでチケット本体と同梱してクライアントに渡される対称鍵で、クライアントの長期鍵(NTハッシュやAES鍵)そのものではなく、チケット発行対象(KDC・サービス、あるいはU2Uでは相手プリンシパル)とクライアントの間だけで共有される短命鍵である。TGTにはTGTセッション鍵、STにはSTセッション鍵が付属する。TGTセッション鍵は後続のTGS-REQでAuthenticatorを暗号化する鍵として機能し、対応するTGS-REPの応答部もこの鍵で保護される。STセッション鍵はAP-REQでAuthenticatorを暗号化する鍵であると同時に、AP-REPによる相互認証(mutual authentication)を成立させる鍵としても機能する。クライアントはAP-REQのAuthenticatorに独自の一時サブキーを含めることもでき、これは後続メッセージの保護(GSS-API confidentiality/integrity)に使われる。CVE-2022-33679は、事前認証が無効なアカウントに対しRC4-MD4という弱いetype(値-128)への暗号ダウングレードを強制したうえで、KDCへ大量のリクエストを送るオンラインのオラクル攻撃によってAS-REP中のこのセッション鍵をバイト単位で復元できてしまう脆弱性で、TGT自体は平文で同梱されているため、鍵さえ判明すればそのまま流用可能になりTGT窃取に直結する。U2U(User-to-User)認証では、サービス自身の長期鍵の代わりに提示されたTGTのセッション鍵でTGSチケットを暗号化するため、このセッション鍵の秘匿性がTGSの安全性そのものを支える。なお委任転送でチケットとセッション鍵を一緒に運ぶ搬送用メッセージ型はKRB-CREDと呼ばれ、セッション鍵自体の別名ではない点に注意が必要である。RubeusのtgtdelegはAP-REQのAuthenticatorチェックサムを悪用してこのKRB-CREDを取得し、ローカルキャッシュのSTセッション鍵でそれを復号してTGTと同梱のセッション鍵を抽出する。",
    "points": [
      "AS-REPにTGTセッション鍵、TGS-REPにSTセッション鍵が同梱される",
      "クライアントの長期鍵(NTハッシュ/AES鍵)とは別物の短命な対称鍵",
      "TGTセッション鍵はTGS-REQのAuthenticator暗号化(TGS-REP保護)に、STセッション鍵はAP-REQの相互認証に使われる",
      "AP-REQのAuthenticatorに追加のサブキーを含められる(GSS-API保護用)",
      "KRB-CREDはセッション鍵の別名ではなくチケット+鍵を運ぶ搬送用メッセージ型(tgtdelegが悪用)"
    ],
    "related": [
      "kerberos",
      "tgt",
      "st",
      "krbmsgs",
      "u2u",
      "etype"
    ]
  },
  {
    "id": "oxid",
    "term": "OXIDリゾルバ (DCOMオブジェクトエクスポータ解決)",
    "en": "OXID Resolver (Object Exporter ID Resolution)",
    "aka": "IObjectExporter, ResolveOxid2, RPCSS(実装元サービス), RogueOxidResolver, OXID",
    "cat": "os",
    "body": "OXID(Object EXporter ID)リゾルバは、分散COM(DCOM)オブジェクトが現在どのマシン・どのRPCエンドポイントで動作しているかを解決する仕組み。実体は各マシン上でRPCSSサービスが公開するIObjectExporterインタフェース(いわゆるOXIDリゾルバ)であり、DCOMオブジェクトエクスポータはOXIDという識別子で一意に管理される。クライアントやサーバーはこのインタフェースのResolveOxid2メソッドを呼び出し、対象オブジェクトの文字列バインディング(ホスト/IPとRPCプロトコルシーケンス)を取得したうえで実際のDCOM接続を確立する。この呼び出しは135/tcpにあるオブジェクトリゾルバの既知エンドポイント(well-known endpoint)へ直接到達し、失敗時のみエンドポイントマッパーによる動的解決にフォールバックする。この解決要求はDCOMサーバーからクライアントへのコールバックにも使われるため、攻撃者が細工した文字列バインディングを注入すれば、対象マシンに任意ホスト宛てのRPC接続や認証(NTLM/Kerberos)を強制できる。RemotePotato0はログオン中ユーザーのDCOMアクティベーションをRogueOxidResolverでリレーしNTLM認証を窃取し、RemoteKrbRelayは同様にOXID解決の仕組みを悪用しKerberos認証をリレーする。検知では135/tcpへのOXIDリゾルバ呼び出しとそれに続く動的ポートへの接続を監視対象とする。",
    "points": [
      "IObjectExporterインタフェース(OXIDリゾルバ)をRPCSSサービスが実装・公開",
      "OXID = DCOMオブジェクトエクスポータを一意に指す識別子(Object EXporter ID)",
      "ResolveOxid2でホスト/プロトコルシーケンスを含む文字列バインディングを取得",
      "135/tcpの既知エンドポイントへ直接到達(失敗時のみ動的解決にフォールバック)、実通信は動的ポート",
      "RemotePotato0(RogueOxidResolverでNTLM)やRemoteKrbRelay(Kerberos)は偽バインディングを注入し認証をリレー"
    ],
    "related": [
      "rpc",
      "com",
      "potato",
      "ntlmrelay",
      "epmreg"
    ]
  },
  {
    "id": "epmreg",
    "term": "RPCエンドポイントマッパー登録 (RpcEpRegister)",
    "en": "RPC Endpoint Mapper Registration (RpcEpRegister)",
    "aka": "RpcEpRegister, RpcEpRegisterNoReplace, ept_insert, EPMデータベース, first-registration-wins, first-come-first-served, EPM Server Spoofing",
    "cat": "os",
    "body": "RPCエンドポイントマッパー登録は、RPCサーバーがRpcServerUseProtseq系APIでRPCランタイムに動的ポート(プロトコルシーケンスとエンドポイント)をバインドし、RpcServerRegisterIfでインタフェースをRPCランタイムライブラリへ登録した後、自身のインタフェースUUID・バージョン・バインディング情報を、RPCSSサービス(TCP135で待ち受け)が保持するEPMデータベースへ RpcEpRegister / RpcEpRegisterNoReplace API(ワイヤ上はept_insert操作に相当)を呼び出して公開する工程である。この登録は同一インタフェースUUIDに対して最初に登録したプロセスが優先される「first-registration-wins」(実態はfirst-come-first-served)の信頼モデルで運用されており、登録元プロセスの正当性を検証する強い認可チェックは存在しない。なお、RpcServerRegisterIfはRPCランタイムライブラリへインタフェースを登録し呼び出しを受け付け可能にするAPIであり、EPMデータベースへの登録(RpcEpRegister)とは別工程である。実際のRPCサーバー起動シーケンスは通常 RpcServerUseProtseq系 → RpcServerRegisterIf → RpcEpRegister → RpcServerListen の順に呼ばれる。この認可なき先着順という弱点のため、攻撃者プロセスが正規サーバーより先に同一インタフェースUUIDを登録すれば、後続クライアントのept_map解決(id:rpc)を乗っ取り、偽エンドポイントへ誘導できる(EPM Server Spoofing, CVE-2025-49760)。攻撃マップ上ではクライアント側の動的ポート解決だけでなく、この登録側メカニズムを理解して初めて「EPMデータベースへの毒入れ」という攻撃面の核心が把握できる。",
    "points": [
      "RpcEpRegister / RpcEpRegisterNoReplace: インタフェースUUID・バージョン・バインディング情報をEPMデータベースへ登録(ワイヤ上はept_insert操作に相当。クライアント側解決のept_mapとは別opnum)",
      "RPCSSサービスがTCP135で待ち受け、EPMデータベース(インメモリ、プロセス終了で自動失効)を保持",
      "first-registration-wins(first-come-first-served): 同一インタフェースUUIDは最初の登録者が優先され、登録元の正当性を検証する強い認可チェックはない",
      "RpcServerRegisterIfは別工程(RPCランタイムライブラリへのインタフェース登録)。実際の起動順は通常 RpcServerUseProtseq系 → RpcServerRegisterIf → RpcEpRegister → RpcServerListen",
      "CVE-2025-49760 (EPM Server Spoofing, CVSS 3.5, 2025年7月修正): 先着登録により後続クライアントのept_map解決を乗っ取り、Windows Storage等の機微情報窃取・ドメイン権限昇格(ESC8連鎖)へ発展"
    ],
    "related": [
      "rpc",
      "com",
      "oxid",
      "namedpipe",
      "coercion"
    ]
  },
  {
    "id": "ntlmmic",
    "term": "NTLM MIC / NTLMSSP セッションセキュリティフラグ (SIGN/SEAL)",
    "en": "NTLM Message Integrity Code (MIC) & NTLMSSP Session Security Flags (SIGN/SEAL/LOCAL_CALL)",
    "aka": "MIC, Message Integrity Check, MsvAvFlags, NTLMSSP_NEGOTIATE_SIGN, NTLMSSP_NEGOTIATE_SEAL, NTLMSSP_NEGOTIATE_LOCAL_CALL, AUTHENTICATE_MESSAGE",
    "cat": "auth",
    "body": "NTLM Message Integrity Code (MIC) は、NTLMv2認証の第3メッセージ AUTHENTICATE_MESSAGE に付加されるHMAC-MD5ベースの16バイトフィールドで、NEGOTIATE_MESSAGE・CHALLENGE_MESSAGE・AUTHENTICATE_MESSAGE(MICフィールド自体は計算前に16バイトのゼロで埋められる)の3メッセージ全体を、SessionBaseKeyから導出されるExportedSessionKeyでHMAC-MD5署名し、中間者によるフィールド改竄(ネゴシエートフラグの書き換えなど)を検知する仕組みである。AUTHENTICATE_MESSAGEのTargetInfoにあるMsvAvFlags AV_PAIRのbit 0x2が1になっているとき、サーバはMICフィールドの検証を行う設計になっており、この「検証要否の合図」自体を無効化・回避することが後述の攻撃の核心となる。本項のMICは整合性レベル(id:integrity)のMandatory Integrity Controlとは無関係の、NTLM内部の完全性コードであり、両者は同じ略語を共有するだけの別概念なので混同しないこと。「Message Integrity Check」という呼称も実務では広く流通するが、MS-NLMP仕様書や公式CVEアドバイザリは一貫して「Message Integrity Code」と表記するため、こちらを正式名として扱う。MICとは別レイヤの仕組みとして、NTLMSSPのネゴシエートフラグにはNTLMSSP_NEGOTIATE_SIGN(0x00000010)・NTLMSSP_NEGOTIATE_SEAL(0x00000020)・NTLMSSP_NEGOTIATE_LOCAL_CALL(0x00004000)などメッセージレベルの署名/封印/ローカル呼び出しを要求するビットがあり、これはSMB/LDAPのプロトコル層署名(id:smbsigning)とは独立した層で、リレーしたAUTHENTICATE_MESSAGE内でこれらのフラグを書き換えれば署名要求そのものを黙らせられる。Drop the MIC (CVE-2019-1040)はMICフィールドの除去に加えてNTLMSSP_NEGOTIATE_SIGN/ALWAYS_SIGNなどの署名系フラグも併せて解除することで改竄検知と署名要求の両方を無力化し、CVE-2025-54918はLDAP側実装がMICを部分的にしか保護しない隙(Partial MIC Removal)を突いて、署名やチャネルバインディングを強制した環境でもリレーを成立させるというように、この2フィールド(MICとネゴシエートフラグ)の内部構造を理解して初めて、NTLMリレー対策がなぜ・どこまで破られ得るかが読み解ける。",
    "points": [
      "AUTHENTICATE_MESSAGE内のHMAC-MD5(鍵はSessionBaseKeyから導出されるExportedSessionKey)で、NEGOTIATE/CHALLENGE/AUTHENTICATEの3メッセージを束ねて署名",
      "正式名はMessage Integrity Code(MS-NLMP準拠)、\"Message Integrity Check\"は広く使われる別名として併記",
      "id:integrity(Mandatory Integrity Control)のMICとは無関係の別概念 — 略語衝突に注意",
      "MsvAvFlags AV_PAIRのbit 0x2がMIC検証要否をサーバに伝える合図であり、CVE-2019-1040はこの合図と紐づくNEGOTIATE_SIGN/ALWAYS_SIGNフラグも併せて無効化する",
      "NTLMSSP_NEGOTIATE_SIGN 0x00000010 / NTLMSSP_NEGOTIATE_SEAL 0x00000020 / NTLMSSP_NEGOTIATE_LOCAL_CALL 0x00004000 はメッセージレベルの署名・封印フラグでSMB/LDAP署名とは別レイヤ(0x00008000はNEGOTIATE_ALWAYS_SIGNでLOCAL_CALLではない)",
      "CVE-2019-1040(MICとSIGN系フラグの除去)→CVE-2025-54918(部分的MIC保護の迂回, Partial MIC Removal)という攻撃技法の進化系譜"
    ],
    "related": [
      "ntlm",
      "netntlm",
      "ntlmrelay",
      "epa",
      "smbsigning",
      "sspi"
    ]
  },
  {
    "id": "webclient",
    "term": "WebClient サービス / WebDAV リダイレクタ",
    "en": "WebClient Service / WebDAV Redirector",
    "aka": "WebClient service, WebDAV Redirector, webclnt.dll, DAV RPC SERVICE named pipe, HTTP-based NTLM coercion",
    "cat": "os",
    "body": "WebClient サービス(表示名 WebClient、実体は webclnt.dll)は、Windows の WebDAV Mini-Redirector が UNC 形式のパス(\\\\server@port\\path や \\\\server@SSL@port\\path)で WebDAV 共有にアクセスするためのクライアント側コンポーネントである。SMB(445/tcp)ではなく HTTP(既定80/tcp、SSL指定時443/tcp)で通信するため、SMB署名の強制設定が一切適用されない別経路の認証チャネルを作り出す。既定では Windows Workstation(クライアント)OS にのみプリインストールされ手動(トリガー開始、ETWイベントで起動)状態で待機し、Windows Server OS には既定でインストールされない(Server 2012/2012 R2は「Desktop Experience」機能、Server 2016以降は「WebDAV リダイレクタ」機能を個別に追加すれば利用可能になる)。サービスは要求時に遅延起動し、起動すると名前付きパイプ \\\\.\\pipe\\DAV RPC SERVICE を作成するため、この名前付きパイプ作成イベントの監視がWebClient稼働(≒WebDAVアクセス発生)の検知指標になる。PetitPotam等の強制認証技法の宛先をSMBのUNCパスではなくこの \\\\server@80\\ 形式に変えると、対象ホストのWebClientサービスが起動してHTTPベースのNTLM認証が発生し、SMB署名の対象外であるだけでなくAD CS Web登録(ESC8)のようなHTTPエンドポイントへそのまま中継できるクロスプロトコルNTLMリレーの起点となる。",
    "points": [
      "webclnt.dll / サービス表示名 \"WebClient\"、UNCパス \\\\server@port\\path でWebDAV(HTTP)アクセスを実現",
      "HTTP 80/tcp(SSL指定時443/tcp)で通信 → SMB(445/tcp)署名強制の対象外となる別経路",
      "既定でWorkstation(クライアント)OSにのみ存在し手動(トリガー開始)、Server OSは既定未インストール(Desktop Experienceまたは WebDAVリダイレクタ機能の追加時のみ利用可)",
      "起動検知は名前付きパイプ \\\\.\\pipe\\DAV RPC SERVICE の作成監視が有効",
      "coercionの宛先を\\\\server@80\\形式にするとHTTP NTLM認証を誘発 → ESC8等クロスプロトコルNTLMリレーの起点になる"
    ],
    "related": [
      "coercion",
      "ntlmrelay",
      "smbsigning",
      "namedpipe",
      "adcsesc",
      "enrollep"
    ]
  },
  {
    "id": "wpad",
    "term": "WPAD (Web Proxy Auto-Discovery Protocol)",
    "en": "Web Proxy Auto-Discovery Protocol (WPAD) / PAC File",
    "aka": "WPAD, PAC file, wpad.dat, DHCP Option 252, Proxy Auto-Config, 407 Proxy Authentication Required",
    "cat": "os",
    "body": "WPAD (Web Proxy Auto-Discovery Protocol) は、Kerberos の権限属性証明書 (PAC、認可データ) とは無関係の別概念で、ブラウザや Windows の WinHTTP/WinINET がプロキシ設定を自動発見する仕組みである。WinHTTP の自動検出はまず DHCP Option 252 で PAC ファイルの URL 取得を試み、失敗すると DNS で「wpad.<接尾辞>」ホスト名を解決して http://wpad.<suffix>/wpad.dat を取得する(DHCP優先・DNSは次点という順序はWPAD仕様どおりの公式挙動)。取得した wpad.dat (PAC ファイル) は FindProxyForURL() という JavaScript 関数を含み、アクセス先 URL ごとにどのプロキシへ転送するかを返す。この設計の弱点は「名前解決を制した者が HTTP プロキシ設定を制する」点にあり、LLMNR/NBT-NS や DNS の名前解決を偽装トラフィックで乗っ取れれば、被害者の全 HTTP トラフィックを不正プロキシへ誘導できる。さらに偽 WPAD サーバーが HTTP 407 Proxy-Authentication Required で応答すると、クライアントは既定で NTLM 認証を自動送信するため、ユーザー操作なしに Net-NTLM 資格情報(あるいはリレー可能な認証セッション)が漏洩する。Windows は既定で DNS Global Query Block List (GQBL) に「wpad」と「isatap」を登録し単純な名前衝突を緩和しているが、かつてはワイルドカードレコードや DNAME レコードで GQBL を回避でき(CVE-2018-8320、2018年10月修正)、パッチ後も NS レコードによる回避は現在も有効なため、ADIDNS への書き込み権限を持てば依然として wpad 解決を乗っ取れる。DHCP を悪用する経路も複数あり、mitm6 は DHCPv6 で偽の名前解決サーバーを配布し WPAD 等のホスト名解決を乗っ取って NTLM リレーへ接続する一方、Akamai の DDSpoof は DHCPv6 ではなく Microsoft DHCP サーバーの DNS 動的更新機能を無認証で悪用し wpad を含む ADIDNS レコードを直接スプーフィングする、mitm6 とは別系統の技法である。",
    "points": [
      "DHCP Option 252 → 失敗時に DNS 'wpad.<接尾辞>' の順で探索(WinHTTP公式仕様)",
      "wpad.dat = PAC ファイル、FindProxyForURL() 関数でプロキシを決定",
      "偽 WPAD の 407 Proxy-Authentication Required で NTLM 自動応答 → 資格情報漏洩",
      "既定でGQBLに'wpad'/'isatap'登録。ワイルドカード/DNAME回避はCVE-2018-8320で修正済みだがNSレコード回避は現在も有効",
      "mitm6(DHCPv6で名前解決を乗っ取り)とDDSpoof(DHCP DNS動的更新の無認証悪用でADIDNSにwpad等を注入)は別系統、いずれもntlmrelayx等と連携可能"
    ],
    "related": [
      "namepoison",
      "ntlmrelay",
      "netntlm",
      "adidns",
      "pac",
      "ntlm",
      "dnsupdateproxy"
    ]
  },
  {
    "id": "enrollagent",
    "term": "登録エージェント (Enrollment Agent)",
    "en": "Enrollment Agent (Certificate Request Agent)",
    "aka": "Certificate Request Agent EKU, 1.3.6.1.4.1.311.20.2.1, on-behalf-of enrollment, Enrollment Agent Restrictions",
    "cat": "pki",
    "body": "登録エージェント (Enrollment Agent) は、証明書要求エージェント EKU (Certificate Request Agent, OID 1.3.6.1.4.1.311.20.2.1) を持つ証明書の保有者に与えられる、AD CS 上で「他人になり代わって(on-behalf-of)証明書要求(CSR)に署名し、CA に発行させる」委任モデルである。本来はスマートカード発行担当者がエンドユーザーの秘密鍵を扱わずに代理でスマートカード証明書を発行できるようにする仕組みで、対象ユーザーの識別情報を含む内側の要求(PKCS#10/CMC)を、エージェント自身の秘密鍵で署名した CMS(PKCS#7)構造で包んで CA に送信する。CA はその外側の署名をエージェント証明書の EKU とともに検証したうえで、内側の要求に埋め込まれた対象ユーザーの身元(サブジェクト/SAN)で証明書を発行する。CA 側にはこの委任範囲を制限する「登録エージェント制限 (Enrollment Agent Restrictions)」があり、証明機関 MMC の [プロパティ]>[登録エージェント] タブで「登録エージェントを制限する」を有効にすると、特定のエージェント(またはグループ)が代理発行できるテンプレートと対象ユーザーの範囲を限定できるが、既定は「登録エージェントを制限しない」であり、任意のエージェントが任意のユーザーに代わって任意のテンプレートを要求できてしまう。攻撃マップ上では ESC3 がこのモデルの中核で、Certificate Request Agent EKU を発行するテンプレートへの登録権限を悪用してエージェント証明書を取得し、それを用いて Domain Admin 等の高権限ユーザーになり代わった認証用証明書を二段階目のテンプレートから発行させ PKINIT で身元を乗っ取る。ESC15 (EKUwu) は、証明書に Application Policies 拡張と EKU 拡張が両方存在する場合、CA/Windows 側の検証が EKU 拡張を無視して Application Policies 拡張を優先するという実装上の癖を突き、要求者が独自の拡張を注入できる V1 テンプレートに Certificate Request Agent の Application Policy を注入することで、本来この用途を許可していないテンプレートでも登録エージェント制限を経ずに同じ委任モデルを成立させてしまう。",
    "points": [
      "EKU OID = 1.3.6.1.4.1.311.20.2.1 (Certificate Request Agent)",
      "本来はスマートカード発行代行、対象ユーザーのCSR(PKCS#10/CMC)をエージェント秘密鍵で署名したCMS(PKCS#7)に包んで送るon-behalf-of発行モデル",
      "CA側の緩和策=登録エージェント制限(Enrollment Agent Restrictions)、証明機関MMCの[プロパティ]>[登録エージェント]タブの「登録エージェントを制限する」で設定",
      "既定は「登録エージェントを制限しない」(Not restricted) = 任意エージェントが任意ユーザー・任意テンプレートで代理発行可能",
      "ESC3=このEKUを持つテンプレートの登録権限悪用、ESC15(EKUwu)=Application PolicyがEKUより優先される実装上の癖を突きV1テンプレートにCertificate Request Agentを注入して制限を回避"
    ],
    "related": [
      "eku",
      "template",
      "adcs",
      "adcsesc",
      "caperm",
      "apppolicy"
    ]
  },
  {
    "id": "caperm",
    "term": "CAセキュリティ権限とポリシー設定 (ManageCA / ManageCertificates / EDITF)",
    "en": "CA Security Permissions & Policy Module Flags (CA Administrator / Certificate Manager / EDITF_ATTRIBUTESUBJECTALTNAME2)",
    "aka": "ManageCA, ManageCertificates, CA Administrator, Certificate Manager (Officer), Request Certificates, Issue and Manage Certificates, CA\\Security, EditFlags, certutil -setreg policy\\EditFlags",
    "cat": "pki",
    "body": "CAオブジェクトはAD内の通常のオブジェクトACL(GenericAll/WriteDACL等)とは別に、証明機関コンソールの「セキュリティ」タブに独立したアクセス制御体系を持つ。これは下位から順に3階層で、(1) Request Certificates(証明書の発行を要求できる権限。GUIで「Enroll」と呼ばれることもあるが、これはテンプレート側の拡張権限Certificate-Enrollmentの名称であり、CAセキュリティタブ上の正式名は「Request Certificates」)、(2) Issue and Manage Certificates(Certificate Manager/Officerロールとも呼ばれる。保留中または失敗した証明書要求を強制的に承認・発行できる)、(3) Manage CA(CA Administratorロール。ポリシーモジュール設定を含むCAの全構成を変更できる最上位権限)となる。Manage CAを保持する攻撃者はポリシーモジュールのEditFlagsを自由に書き換えられ、その一つEDITF_ATTRIBUTESUBJECTALTNAME2はcertutil -setreg policy\\EditFlags +EDITF_ATTRIBUTESUBJECTALTNAME2で設定しCertSvcサービス再起動で反映される、CA全体に効くグローバル設定である。これはテンプレート単位で任意SAN指定を許可するENROLLEE_SUPPLIES_SUBJECT(ESC1)とは別レイヤであり、有効化すると全テンプレートの全登録者がリクエスト時に任意のSANを指定可能になる(ESC6)。さらにManage CAは、自身をofficerとして追加登録することでIssue and Manage Certificates権限を自らに付与できる(例: certipy ca -add-officer)。したがってManage CAの奪取(ESC7)は、(a) officer自己登録によりManage Certificates権限を得て保留要求を強制承認する経路と、(b) EditFlags書き換えによるESC6化という、2方向の昇格経路を同時に開く。",
    "points": [
      "権限階層: Request Certificates(発行要求) < Issue and Manage Certificates(保留/失敗要求の強制承認、通称ManageCertificates) < Manage CA(CA全構成の変更、通称ManageCA)",
      "GUI上の「Enroll」はテンプレート側拡張権限Certificate-Enrollmentの名称。CAセキュリティタブでの正式名は「Request Certificates」",
      "EDITF_ATTRIBUTESUBJECTALTNAME2はCA全体に効くポリシーモジュールフラグで、テンプレート単位のENROLLEE_SUPPLIES_SUBJECT(ESC1)とは別レイヤ",
      "certutil -setreg policy\\EditFlags +EDITF_ATTRIBUTESUBJECTALTNAME2 → CertSvc再起動で有効化、全登録者が任意SANを指定可能に(ESC6)",
      "Manage CA保持者はofficer自己登録でManage Certificates権限を取得でき(ESC7の強制承認経路)、EditFlags書き換え(ESC6化)も自由に行える"
    ],
    "related": [
      "adcs",
      "ca",
      "template",
      "adcsesc",
      "accessmask",
      "secdesc"
    ]
  },
  {
    "id": "apppolicy",
    "term": "Application Policies 拡張 (EKUwu)",
    "en": "Application Policies Extension vs EKU (EKUwu)",
    "aka": "szOID_APPLICATION_CERT_POLICIES, OID 1.3.6.1.4.1.311.21.10, ESC15, CVE-2024-49019",
    "cat": "pki",
    "body": "Application Policies 拡張(OID 1.3.6.1.4.1.311.21.10, szOID_APPLICATION_CERT_POLICIES)は、標準のEKU拡張(2.5.29.37)とは別に存在するMicrosoft独自の証明書拡張で、証明書の用途をOIDのリストとして表現する。ポイントは「等価」ではなく「優先」である。レガシーなCAPI2証明書チェーン検証ロジックでは、証明書がApplication PoliciesとEKUの両方を保持する場合、Application Policiesが優先され、EKU側の値は事実上無視される——これはMicrosoftの公式ドキュメント(Windows Server「Using Application Policies」)に明記された挙動である。schemaVersion=1(V1)の証明書テンプレートでENROLLEE_SUPPLIES_SUBJECTフラグ(Subject Nameを「要求で指定」)が有効な場合、CA側が制限をかけない限りこの拡張はCSR属性(msPKI-Certificate-Application-Policy)として要求者が自由に注入でき、EKUフィールドを書き換えずに実効的な用途(クライアント認証など)を偽装できてしまう——これがEKUwu(ESC15、CVE-2024-49019、TrustedSec Justin Bollingerが2024年に発見)の技術的前提となる。LDAP Schannel認証のようにレガシーな証明書検証パスに依存するコンシューマは、このApplication Policiesを見て許可された用途を判定するため、攻撃者はV1テンプレートからApplication Policiesにクライアント認証用OIDなどを注入するだけで、EKU制限をすり抜けたなりすまし用証明書を発行させられる。",
    "points": [
      "OID 1.3.6.1.4.1.311.21.10 (szOID_APPLICATION_CERT_POLICIES) — EKU (2.5.29.37) とは別拡張",
      "レガシーCAPI2チェーン検証ではApplication PoliciesがEKUより「優先」され、EKUは事実上無視される(等価ではない)",
      "schemaVersion=1 (V1) テンプレート + ENROLLEE_SUPPLIES_SUBJECT有効時、CSR属性 msPKI-Certificate-Application-Policy への自由注入が可能 → ESC15/EKUwu (CVE-2024-49019) の土台",
      "LDAP Schannel認証などレガシー検証パス依存のコンシューマが実際の悪用対象",
      "V2以降のテンプレートはクローン時に自動昇格し、同様の自由注入は成立しにくい"
    ],
    "related": [
      "template",
      "eku",
      "adcsesc",
      "ca",
      "issuancepolicy",
      "caperm"
    ]
  },
  {
    "id": "issuancepolicy",
    "term": "発行ポリシー OID (Issuance Policy / Certificate Policies)",
    "en": "Issuance Policy OID (Certificate Policies Extension / OID Group Link)",
    "aka": "Certificate Policies extension 2.5.29.32, msPKI-Certificate-Policy, msDS-OIDToGroupLink, OID group link, Authentication Mechanism Assurance, ESC13",
    "cat": "pki",
    "body": "発行ポリシー OID (Issuance Policy) は、X.509証明書の標準拡張であるCertificate Policies拡張(OID 2.5.29.32, RFC 5280)に埋め込まれる、その証明書がどの審査・発行方針の下で発行されたかを示すポリシー識別子群である。AD CSでは証明書テンプレートのmsPKI-Certificate-Policy属性に列挙したポリシーOIDが発行証明書に転記され、各OID自体はAD上のPKI OIDコンテナ(CN=OID,CN=Public Key Services,CN=Services,CN=Configuration,DC=...)内のmsPKI-Enterprise-Oidオブジェクトとして表現される。このOIDオブジェクトはmsDS-OIDToGroupLink属性を持つことができ、これを設定すると当該発行ポリシーが埋め込まれた証明書での認証時に、証明書所有者が指定したADグループの実メンバーでなくても、そのグループSIDが暗黙的にPACへ付与される。これは本来、Windows Server 2008 R2で導入されたスマートカード証明書の発行方針に基づく動的なグループ付与を行う「Authentication Mechanism Assurance (AMA)」機能のための仕組みであり、msDS-OIDToGroupLinkを設定できるグループはユニバーサルスコープに限られ、設定後はADがそのグループへの通常のメンバー追加を拒否するため、リンク先グループは常に空のまま運用される。ESC13は、低権限ユーザーが登録可能な証明書テンプレートにクライアント認証EKUと、特権グループへリンクされた発行ポリシーOIDが設定されている場合、そのテンプレートから取得した証明書によるPKINIT認証だけで実際のグループメンバーシップなしに特権グループ相当の権限を獲得できる問題を指す。Certificate Policies拡張(発行ポリシー)はApplication Policies拡張(拡張キー使用法/EKUに相当する目的OID)とは別物であり混同に注意が必要。",
    "points": [
      "Certificate Policies拡張 = OID 2.5.29.32 (RFC 5280)、証明書にポリシー識別子(OID)を格納",
      "テンプレート側: msPKI-Certificate-Policy属性で発行ポリシーOIDを指定",
      "AD側: PKI OIDコンテナ内のmsPKI-Enterprise-OidオブジェクトがOIDを表現し、msDS-OIDToGroupLink属性でグループにリンク",
      "リンク先グループはユニバーサルスコープに限定され、リンク設定後はADがメンバー追加を拒否するため常に空(元はスマートカード認証向けAuthentication Mechanism Assurance機能)",
      "リンク先グループはPKINIT認証時に実メンバーシップ不要で暗黙的にPACへSID付与",
      "ESC13 = クライアント認証EKUと特権グループへリンクされた発行ポリシーOIDを持つテンプレートを悪用した権限昇格"
    ],
    "related": [
      "template",
      "eku",
      "adcsesc",
      "pac",
      "pkinit",
      "apppolicy"
    ]
  },
  {
    "id": "actortoken",
    "term": "アクタートークン (S2S / ACS)",
    "en": "Actor Token (Service-to-Service OAuth via Access Control Service)",
    "aka": "S2S actor token, Access Control Service (ACS), trustedfordelegation, netId, puid, nameid claim",
    "cat": "cloud",
    "body": "アクタートークンは、Microsoft内部のサービス間(S2S)通信のために「Access Control Service (ACS)」と呼ばれる古いサービスが発行する、通常のOAuthアクセストークン/リフレッシュトークン/IDトークンとは別系統の第3のトークン種別である。あるMicrosoft製サービス(Exchangeなど)が別のサービス(Azure AD Graph等)に対し、特定のユーザーとして振る舞う権限を主張するために使われる。アクタートークン自体はACSが署名し、trustedfordelegationというクレームを持つ(Microsoft製ファーストパーティアプリにはtrue、それ以外のアプリにはfalseで発行される)。実際に「誰として振る舞うか」の指定は、この署名済みアクタートークンをactortokenクレームとして格納した「未署名」のラッパーJWT(alg: none)を介して行われ、ラッパー側のnameidクレームに対象ユーザーのnetId(MSAコードベース由来の内部識別子で、通常のEntraアクセストークンではpuidクレームとして現れる)を格納する形式をとる。RFC 8693のような標準化されたOAuthトークン交換(token exchange)プロトコルではなく、Microsoft独自の内部機構である点に注意。ACSは一般提供サービスとしては2018年11月に正式に廃止されているが、この内部S2Sアクタートークン発行用途に限っては稼働が継続しているとみられる(研究者調査時点)。netIdはほぼ連番の値であるため短時間の総当たりが可能な上、要求元テナントと対象netIdの所属テナントが一致するかというテナント境界の検証が漏れていたため、任意テナントの任意ユーザー(Global Admin含む)へ成りすませる致命的な攻撃面となった(CVE-2025-55241, CVSS 10.0)。発行・利用が通常のサインインログや監査ログにほぼ痕跡を残さないため、Entra関連の最高深刻度技法を理解するうえで前提となる基盤概念。",
    "points": [
      "ACS(Access Control Service)が発行する第3のトークン種別。通常のアクセス/リフレッシュ/IDトークンとは別系統",
      "アクタートークン自体はACS署名済みでtrustedfordelegationクレームを持つ(Microsoft製ファーストパーティアプリはtrue、非Microsoftアプリはfalse)",
      "対象ユーザーの指定は未署名のラッパーJWT(actortokenクレームに署名済みアクタートークンを格納)のnameidクレーム=netId(通常のアクセストークンのpuidに相当)で行う",
      "RFC 8693のようなOAuthトークン交換(token exchange)標準に基づくものではない、Microsoft独自の内部機構",
      "ACSは一般提供サービスとしては2018年に廃止済みだが、この内部S2Sアクタートークン発行用途に限り稼働継続とみられる",
      "netIdの総当たり容易性とテナント境界検証の漏れにより、任意テナントの任意ユーザーになりすませた(CVE-2025-55241, CVSS 10.0)"
    ],
    "related": [
      "entra",
      "tokens",
      "tenant",
      "sp",
      "hybridauth",
      "oauth"
    ]
  },
  {
    "id": "workloadidfed",
    "term": "ワークロード ID フェデレーション (フェデレーション ID 資格情報 / FIC)",
    "en": "Workload Identity Federation (Federated Identity Credentials, FIC)",
    "aka": "FIC, federatedIdentityCredentials, BYOIDP, client_assertion (jwt-bearer), issuer/subject/audience",
    "cat": "cloud",
    "body": "ワークロード ID フェデレーション (Microsoft公式訳: ワークロード ID フェデレーション/フェデレーション ID 資格情報) は、アプリやユーザー割り当てマネージド ID (UAMI) がクライアントシークレットや証明書を一切保持せずに、外部の OIDC 発行者 (issuer) が署名した JWT を提示するだけで Entra ID からトークンを取得できる、秘密なし認証の第3の経路。設定単位はフェデレーション ID 資格情報 (Federated Identity Credential, FIC) というオブジェクトで、これはアプリ登録 (application object) と UAMI のどちらにも追加できる (システム割り当てマネージド ID には設定不可)。issuer・subject (sub クレーム)・audience の3値一致を検証条件として登録する。認証時は OAuth2 の client credentials grant (grant_type=client_credentials) はそのままに、クライアント認証方式だけを client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer + client_assertion (外部 IdP 発行の JWT) に置き換えて /token エンドポイントへ要求する。これは同じ RFC 7523 の中でも、JWT自体を grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer として認可グラントに使う「JWT Bearer Grant」(2.1節) とは別のセクション (2.2節、JWT によるクライアント認証) にあたり、混同してaka表記する際は注意が必要。GitHub Actions OIDC のようなパスワードレス CI/CD 認証として正規に広く使われる一方、UAMI では管理者が明示的に設定できる唯一の資格情報型 (Microsoft はマネージド ID 裏のサービスプリンシパルへのシークレット/証明書の直接設定を許可していない) でもあるため、攻撃者が外部発行者との信頼関係をひそかに追加(BYOIDP)し、シークレットなしでアプリ/UAMIに成り代わってトークンを取得する永続化技法の前提となる。",
    "points": [
      "FIC (Federated Identity Credential) はアプリ登録とUAMIの両方に設定可能(システム割り当てMIは不可)",
      "検証条件は issuer / subject (sub) / audience の3値一致",
      "grant_type=client_credentials + client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer + client_assertion で /token へリクエスト",
      "同じRFC 7523でも2.1節の\"JWT Bearer Grant\"(grant_type=jwt-bearer)ではなく2.2節のJWTクライアント認証(client_assertion_type=jwt-bearer)にあたる",
      "GitHub Actions OIDC等シークレットレスCI/CD認証の正規基盤であり、かつUAMIで管理者が明示設定できる唯一の資格情報型"
    ],
    "related": [
      "sp",
      "imds",
      "tokens",
      "oauth",
      "spcredadd",
      "apppolicy"
    ]
  },
  {
    "id": "foci",
    "term": "FOCI (ファミリー クライアントID)",
    "en": "Family of Client IDs (FOCI)",
    "aka": "foci=1, family refresh token (FRT), first-party app family",
    "cat": "cloud",
    "body": "FOCI (Family of Client IDs) は、Microsoft純正の第一者アプリ群(Azure CLI, Microsoft Teams, Microsoft Office, Intune Company Portal など)が同一の「ファミリー」に属し、リフレッシュトークンをファミリー内で共有できるMicrosoft独自の内部挙動である。あるファミリーアプリでサインインすると、トークンエンドポイントが返すJSONレスポンスに foci=1 というフィールドが付与され、これがそのリフレッシュトークンがファミリー内で共有可能な「ファミリーリフレッシュトークン(FRT)」であることを示す(このフィールドはリフレッシュトークン自体に埋め込まれたクレームではなく、レスポンス側の属性である点に注意)。このFRTを refresh_token grant で別の family client_id に対して送信すると、ユーザーの再認証なしに別アプリ向けのアクセストークンを取得できる。この交換は非対話的であり、リフレッシュトークン自体が既にMFA済みのセッションを体現しているため、実際に起きているのはMFAの突破ではなく「MFA再プロンプトの回避」に過ぎない。条件付きアクセスは client_id/app 単位で適用されるため、制限的なCAポリシーが元のアプリにのみ紐づいている場合、ファミリー内の別アプリ(制限が緩い、または既に同意済み)を経由してアプリ単位の条件付きアクセスを回避できる—CA全体の無効化ではない点に注意が必要である。既知の悪用パターンとして、Intune Company Portalに設定されているデバイス準拠チェックの除外とFOCIを連鎖させ、デバイス準拠を要求するCAポリシーごとバイパスする手口がある。",
    "points": [
      "foci=1 フィールド(トークンレスポンス側の属性、RT内部のクレームではない) = Microsoft第一者アプリの「ファミリー」所属を示す",
      "refresh_token grant + 別の family client_id → 再認証なしにトークン交換",
      "交換は非対話的 → MFA自体の突破ではなくMFA再プロンプトの回避",
      "条件付きアクセスは client_id/app 単位 → ファミリー内アプリ経由でアプリ単位のCAを回避(CA全体の無効化ではない)",
      "Intune Company Portalのデバイス準拠除外と連鎖 → デバイス準拠バイパスへ悪用される"
    ],
    "related": [
      "entra",
      "oauth",
      "tokens",
      "condaccess",
      "sp",
      "intunemdm"
    ]
  },
  {
    "id": "ssprwriteback",
    "term": "SSPR とパスワードライトバック",
    "en": "Self-Service Password Reset (SSPR) & Password Writeback",
    "aka": "SSPR, Password Writeback, AAD Connect writeback",
    "cat": "cloud",
    "body": "SSPR (Self-Service Password Reset) は Entra ID のクラウド側機能で、ユーザーが事前登録した複数のセキュリティ情報(電話、メール、Microsoft Authenticatorなど)で本人確認を行い、管理者を介さず自分でパスワードをリセット・変更できる仕組み。パスワードライトバック (Password Writeback) は Entra Connect (Entra Connect Sync) のオプション機能で、このクラウド側のパスワードリセット/変更結果をオンプレミス AD DS へ即時に書き戻す、攻撃マップ上でほぼ唯一のクラウド→オンプレ方向のハイブリッド同期経路である(通常のハイブリッド同期は PHS/PTA/フェデレーションのようにオンプレ→クラウドが基本方向)。実装面では、Entra Connect 導入時に作成される AD DS コネクタアカウント (MSOL_ に続くランダムな英数字文字列であり、GUID形式ではない) に対し、既定でドメインルート(または委任先OU)配下のユーザーオブジェクトへ User-Force-Change-Password 拡張権限(表示名は Reset Password の control access right)、および lockoutTime・pwdLastSet 属性への書き込み権限が委任されており、コネクタサーバーが暗号化チャネル経由でオンプレ DC にパスワード変更を書き込む。攻撃面としては、AiTM・MFA疲労・不正な同意付与・Global Admin奪取などでクラウド側アイデンティティが乗っ取られた場合、SSPR経由でオンプレ側の対象アカウント(スコープ設定次第では特権アカウントも含む)のパスワードを強制変更でき、クラウド侵害がそのままオンプレの特権奪取・ドメイン侵入に転化し得る。防御としては、Tier 0/特権アカウントをライトバック対象スコープから除外(OU/パスワードポリシーで制御)し、コネクタアカウントの活動監視、SSPR登録・利用への条件付きアクセス適用、Event 4724(パスワードリセット試行)などの監視が重要。",
    "points": [
      "SSPR = クラウド側セルフサービス/管理者パスワードリセット、複数の登録済みセキュリティ情報で本人確認",
      "Password Writeback = Entra Connect Sync によるクラウド→オンプレAD DSへの逆方向書き戻し(マップ上ほぼ唯一のcloud→on-prem同期経路)",
      "実装は AD DS コネクタアカウント (MSOL_<ランダムな英数字文字列、GUID形式ではない>) への User-Force-Change-Password 拡張権限(表示名 Reset Password)+ lockoutTime/pwdLastSet 書き込み権限の委任",
      "スコープ制御(Tier 0除外)なしだと、クラウド侵害→オンプレ特権アカウントのパスワード強制変更に悪用され得る",
      "監視: Event 4724(パスワードリセット試行、MSOL_アカウントが実行者として記録される)、コネクタアカウントの活動、SSPR登録/利用への条件付きアクセス適用"
    ],
    "related": [
      "entraconnect",
      "hybridauth",
      "entra",
      "extendedrights",
      "entralogs",
      "condaccess",
      "aitm",
      "mfafatigue"
    ]
  },
  {
    "id": "gdap",
    "term": "CSP委任管理者権限 (DAP / GDAP)",
    "en": "CSP Delegated Admin Privileges (DAP / GDAP)",
    "aka": "Delegated Admin Privileges, Granular Delegated Admin Privileges, Admin Agents, Partner Center, CrossTenantAccessType=serviceProvider",
    "cat": "cloud",
    "body": "CSP委任管理者権限は、Microsoftのクラウドソリューションプロバイダー(CSP)/パートナー(MSP)が顧客テナント内に資格情報やディレクトリオブジェクトを一切持たずに、テナント間の委任関係だけで管理者相当の操作を行える委任管理モデル。旧来のDAP(Delegated Admin Privileges)はパートナー導入時に自動付与され期限のないGlobal Administrator相当の権限で、パートナーテナント側の「AdminAgents」(Admin Agents)セキュリティグループへの所属がそのまま全顧客テナントへの支配力に直結する。後継のGDAP(Granular Delegated Admin Privileges)はEntraディレクトリロール単位で権限を絞り込み、最長2年(自動延長オプションで6か月単位に延長可)の時間制限付きで、パートナーテナント内のセキュリティグループを介して顧客側の各ロールにマッピングされる点がDAPと異なる。この関係はPartner Center経由で確立され、Microsoft Graphの`crossTenantAccessPolicyConfigurationPartner`リソース上では、パートナーをCSPとして扱うかどうかが`isServiceProvider`(Boolean)プロパティで表現される。一方、この関係に基づく実際のサインインは、Entraサインインログ(Graphの`signIn`リソース、Log Analyticsの`SigninLogs`テーブル)側で`crossTenantAccessType`フィールド(値`serviceProvider`)としてタグ付けされ、これが検知・ハンティングの主要な手がかりとなる — 本マップの技術エントリでは`SigninLogs`テーブルのフィールド名に合わせて`CrossTenantAccessType`(先頭大文字のPascalCase)と表記している。攻撃マップ上重要なのは、顧客側に痕跡を残す資格情報も足がかりも不要で、パートナーテナント側の1アカウント侵害だけで多数の顧客テナントへ横展開できるサプライチェーン型の増幅リスクである点。",
    "points": [
      "DAP = 自動付与・無期限、GA相当、AdminAgentsグループへの所属が支配力そのもの",
      "GDAP = ロール単位で権限を限定、最長2年(自動延長で6か月単位に延長可)の時間制限付き",
      "パートナー側のセキュリティグループを顧客テナントのEntraディレクトリロールにマッピング",
      "顧客テナント内に資格情報・オブジェクトが一切存在しないまま管理操作が可能",
      "設定はGraphの`isServiceProvider`(crossTenantAccessPolicyConfigurationPartner)、検知はサインインログの`crossTenantAccessType`=`serviceProvider`"
    ],
    "related": [
      "entra",
      "tenant",
      "entraroles",
      "graphapi",
      "pim",
      "b2bguest"
    ]
  },
  {
    "id": "dsheuristics",
    "term": "dSHeuristics",
    "en": "dSHeuristics (DS-Heuristics attribute)",
    "aka": "dwAdminSDExMask, フォレスト全体のディレクトリ動作フラグ, 匿名LDAPアクセス制御, List Object Mode",
    "cat": "adstruct",
    "body": "dSHeuristics は Configuration NC 内の CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=<フォレストルート> オブジェクトが保持する単一の Unicode 文字列属性で、1文字ごとに全く異なる意味を持つ位置指定フラグの集合として、フォレスト全体(全ドメイン・全 DC)のディレクトリ挙動を切り替える。既定値は空文字列(全機能オフ)で、いずれか1台の DC で書き換えればレプリケーションにより全社へ波及するため影響範囲が広い。代表的な文字位置として、3文字目は List Object Mode を制御し、1 に設定すると子オブジェクトの列挙に通常の List Contents 権限に加えて個別の List Object(LO)アクセス権が必要になり、機密 OU 配下のオブジェクト可視性を絞り込める。7文字目は匿名 LDAP バインド・匿名クエリの許可可否に関わり、既定で無効化されている匿名アクセスを緩める値へ変更すると事前認証なしのディレクトリ偵察が成立してしまう。16文字目は dwAdminSDExMask と呼ばれる16進値で(KB817433 で導入)、AdminSDHolder が SDProp によって定期的に ACL を再適用・保護する対象グループから、Account Operators・Print Operators・Backup Operators・Server Operators などの既定保護グループを個別に除外設定でき、攻撃者がここを悪用すると特定グループへの改ざん済み ACL が SDProp の巡回監査で復元されなくなる。書き込みには Enterprise Admins 相当の権限が必要だが変更履歴が目立ちにくいため、属性値そのものの定期監査が防御上の要点となる。",
    "points": [
      "CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration 配下の単一 Unicode 文字列属性、既定値は空文字列",
      "3文字目 = List Object Mode(0/1)。1で子オブジェクト列挙に List Object(LO)権限が追加要求される",
      "7文字目 = 匿名 LDAP バインド/クエリの許可可否を制御",
      "16文字目 = dwAdminSDExMask(16進、KB817433)。SDProp/AdminSDHolder のACL再適用対象から特定の保護グループを除外可能",
      "フォレスト全体にレプリケートされるため単一 DC への書き込みが全ドメインへ波及"
    ],
    "related": [
      "adminsdholder",
      "ldap",
      "forest",
      "dacl",
      "secdesc"
    ]
  },
  {
    "id": "primarygroupid",
    "term": "primaryGroupID",
    "en": "primaryGroupID Attribute",
    "aka": "プライマリグループ, RID 512/513/515/516/519, POSIX/RFC2307互換, memberOfに現れない所属",
    "cat": "objects",
    "body": "primaryGroupID は、ユーザー/コンピュータオブジェクトが持つ「既定グループ」を、対象グループの相対識別子(RID)の整数値で直接指す属性である。AD本来のグループ表現はmemberOf/member(逆リンク)による多対多だが、この属性はWindows NT設計時に求められたPOSIX互換(1ユーザーにつき1つの主グループという要求。のちのRFC 2307/NIS相互運用でも利用)を満たすために導入され、user クラス(computerはそのサブクラス)にのみ定義されており、group オブジェクトは持たない。既定値はユーザーが513(Domain Users、ゲストアカウントは514/Domain Guestsの場合あり)、コンピュータが515(Domain Computers)、ドメインコントローラが516(Domain Controllers)、RODCが521(Read-only Domain Controllers)。primaryGroupIDで指定されたグループのmember属性には対象オブジェクトのDNが列挙されないため、memberOfのバックリンクをたどるnet group /domainやLDAPのmemberOf列挙では所属が可視化されない仕組みになっている。これはWindows 2000時代、レプリケートされるmember属性が単一値あたり約5000メンバー程度で頭打ちになっていた制約を回避するため、Domain Usersのような巨大グループの所属をmember属性側に格納せずに済ませる設計に由来する。攻撃者はこの属性を512(Domain Admins)等の特権グループのRIDへ書き換えることで、通常のグループメンバーシップ列挙に現れないまま実効的な特権グループ所属を獲得できる。検知には4728/4732のようなmember属性変更を追うグループ管理イベントではなく、4738(ユーザーオブジェクト変更)/4742(コンピュータオブジェクト変更)の「Primary Group Id」フィールド、または既定で無効な「ディレクトリサービスの変更」監査を有効化した上での5136で、primaryGroupID自体の変更を直接確認する必要がある。ただしDCShadowはLSASSを経由する通常の書き込みパスを迂回し複製プロトコル経由で直接改ざんするため、これら4738/4742/5136のいずれのイベントも生成されない点に注意が必要である。",
    "points": [
      "既定値: user=513(Domain Users、ゲストは514/Domain Guestsの場合あり)/computer=515(Domain Computers)/DC=516(Domain Controllers)/RODC=521",
      "改ざん対象としてよく狙われるRID: 512(Domain Admins)ほか特権グループ",
      "指定先グループのmember属性に自身のDNが載らない→memberOf/net groupで不可視",
      "属性はuserクラス(computerはそのサブクラス)にのみ定義。groupオブジェクトは持たない",
      "背景: Windows 2000のmember属性 約5000件上限というレプリケーション制約の回避策",
      "検知は4728/4732ではなく4738(ユーザー)/4742(コンピュータ)のPrimary Group Idフィールド、または既定無効の5136で確認。DCShadow経由の改ざんはこれらのイベントを生成しない"
    ],
    "related": [
      "rid",
      "userobj",
      "computerobj",
      "group",
      "dcshadow"
    ]
  },
  {
    "id": "shadowprincipal",
    "term": "シャドウセキュリティプリンシパル / PAMトラスト",
    "en": "Shadow Security Principal & MIM PAM Trust",
    "aka": "msDS-ShadowPrincipal, msDS-ShadowPrincipalSid, Privileged Access Management (PAM), PIMトラスト (netdom /EnablePIMTrust), バスティオン/管理(PRIV)フォレスト",
    "cat": "adstruct",
    "body": "シャドウセキュリティプリンシパル(msDS-ShadowPrincipal)は、MIM(Microsoft Identity Manager)のPAM(Privileged Access Management)機能で使われる、バスティオン/管理(PRIV)フォレスト側に作成される「影」のセキュリティプリンシパルである。CN=Shadow Principal Configuration,CN=Services,CN=Configuration(PRIVフォレストのConfiguration NC配下)に生成され、必須属性 msDS-ShadowPrincipalSid に本番(生産/CORP)フォレストの特権グループ(Domain Admins等)のSIDを格納することで、本番フォレスト側のメンバーシップを一切変更せずに管理フォレスト側で一時的な特権割り当てを実現する。この仕組みを支えるのがPIMトラストで、常に本番(生産/CORP)フォレストから管理/バスティオン(PRIV)フォレストへ向かう一方向トラスト(本番側がバスティオン側を信頼し、逆方向には設定しない)として構成される。Windows Server 2016以降のネイティブなシャドウプリンシパル/TTLメンバーシップ機能を使うには、本番(CORP)フォレストではなく管理/バスティオン(PRIV)フォレスト側のフォレスト機能レベルをWindows Server 2016以上へ引き上げ、同じくPRIVフォレスト側で「Privileged Access Management Feature」というAD Optional Featureを有効化する必要があり、これはAD Optional Feature共通の性質として不可逆な操作である(本番フォレストに機能レベル要件は無い)。トラスト自体はnetdom trustコマンド(本番フォレスト側で実行)の /EnableSIDHistory:yes・/Quarantine:no・/EnablePIMTrust:yes オプションで確立される。通常のトラストにもSIDHistoryオプション自体は存在するが、/EnablePIMTrust:yes はSIDフィルタリング/クォランティンで通常ブロックされるDomain Admins/Enterprise Admins等の高特権SIDの伝播まで明示的に許可する点が本機構固有の危険性であり、攻撃者がPAM Trust/Shadow Security Principal Abuse技法で悪用の核心とする箇所である。なお、この文脈の「PIM」はnetdomのEnablePIMTrustオプションに由来するオンプレミス用語であり、クラウドのMicrosoft Entra ID Privileged Identity Management(PIM)とは名称が同じだけの別機能である点に注意。",
    "points": [
      "msDS-ShadowPrincipal: バスティオン/管理(PRIV)フォレスト側の「影」プリンシパル。必須属性 msDS-ShadowPrincipalSid(単一値)に本番フォレストの特権SIDを格納する(SidHistoryという名の属性は存在しない)",
      "PIMトラスト = 本番(生産/CORP)フォレストが管理/バスティオン(PRIV)フォレストを信頼する一方向トラスト(常に片方向、逆方向には設定しない)",
      "有効化条件: 本番(CORP)ではなく管理/バスティオン(PRIV)フォレストの機能レベルをWindows Server 2016以上に引き上げ、同フォレストで'Privileged Access Management Feature'(AD Optional Feature、不可逆)を有効化する",
      "netdom trust <CORP> /domain:<PRIV> /EnablePIMTrust:yes を /EnableSIDHistory:yes・/Quarantine:no と併用し、SIDフィルタリング/クォランティンを迂回してDomain/Enterprise Admins等の高特権SID伝播を明示的に許可する(New-ADTrustというcmdletは実在しない)",
      "構成情報は CN=Shadow Principal Configuration,CN=Services,CN=Configuration(PRIVフォレスト側)配下に保持される",
      "この'PIM'はクラウドのMicrosoft Entra ID Privileged Identity Management(PIM)とは無関係の別機能(同名衝突に注意)"
    ],
    "related": [
      "trust",
      "sidhistory",
      "sidfiltering",
      "tiermodel",
      "forest",
      "pim"
    ]
  },
  {
    "id": "reversiblepwd",
    "term": "可逆暗号化でのパスワード保存",
    "en": "Reversible Encryption Password Storage (ADS_UF_ENCRYPTED_TEXT_PASSWORD_ALLOWED, userAccountControl 0x80)",
    "aka": "Store password using reversible encryption, supplementalCredentials Primary:CLEARTEXT, RC4可逆暗号, ADS_UF_ENCRYPTED_TEXT_PASSWORD_ALLOWED",
    "cat": "auth",
    "body": "可逆暗号化でのパスワード保存は、ユーザーオブジェクトのuserAccountControlにADS_UF_ENCRYPTED_TEXT_PASSWORD_ALLOWED(0x80、通称ENCRYPTED_TEXT_PASSWORD_ALLOWED)フラグを立てる、またはドメインの既定パスワードポリシー/PSO(msDS-PasswordReversibleEncryptionEnabled)を有効化することで発動する設定で、パスワードを事実上平文と等価な形でDC側に保持させる。有効化後に新規のパスワード設定・変更が行われると、DCはNTハッシュを格納するunicodePwd属性とは別に、supplementalCredentials属性内のPrimary:CLEARTEXTパッケージとしてRC4で可逆暗号化(DCのブートキー/SYSKEYで復号可能)した平文コピーを保存する([MS-SAMR]仕様)。有効化前から存在する既存パスワードは遡って平文化されない点に注意。このフラグはMS-CHAP/CHAPを使うRADIUS認証、IIS Digest認証、旧Macintoshクライアントとの相互運用など、サーバー側でクライアントの平文パスワードを再現する必要があった古い要件のために設けられた歴史的機能で、既定は無効。攻撃側の視点では、DCSyncやNTDS.dit抽出でこのPrimary:CLEARTEXTパッケージを復号すればハッシュ解読を経ずに即座に平文パスワードそのものを得られるため、NTハッシュ窃取(pass-the-hashで足りる被害)より深刻度が一段高い。攻撃マップ上でこのフラグを扱う技法カードはフラグの検知・無効化手順が中心で、平文相当コピーの実体がsupplementalCredentials/Primary:CLEARTEXTという構造にある点を説明する概念エントリはこれまで存在しなかった。",
    "points": [
      "ADS_UF_ENCRYPTED_TEXT_PASSWORD_ALLOWED = userAccountControl 0x80(通称ENCRYPTED_TEXT_PASSWORD_ALLOWED、dsmodでは-reversiblepwd)",
      "平文相当コピーはsupplementalCredentials属性内のPrimary:CLEARTEXTパッケージに格納(unicodePwd=NTハッシュとは別領域)",
      "RC4による可逆暗号化でDC側が復号可能(NTDS.dit全体を保護するPEK/ブートキー機構の一部)",
      "由来はMS-CHAP/RADIUS、IIS Digest認証、旧Macintosh等の相互運用互換のための歴史的フラグ。既定は無効、有効化後の新規パスワードのみ平文化",
      "DCSync/NTDS.dit抽出で即時平文復元 → 通常のNTハッシュ窃取より深刻"
    ],
    "related": [
      "uacflags",
      "nthash",
      "wdigest",
      "dcsync",
      "ntds"
    ]
  },
  {
    "id": "dnsupdateproxy",
    "term": "DnsUpdateProxy / 所有者なし動的DNSレコード",
    "en": "DnsUpdateProxy / Unsecured Dynamic DNS Records",
    "aka": "DnsUpdateProxy, DHCP代理動的更新, レコード所有権(オブジェクトSID), OpenAclOnProxyUpdates, Name Protection/DHCID",
    "cat": "adstruct",
    "body": "DnsUpdateProxy は、DHCPサーバーがDHCPクライアントに代わってADIDNSへ動的更新(A/PTRレコードの登録)を行うために用意された組み込みのセキュリティグループである。ADIDNSのセキュア動的更新では、レコードを作成(secure dynamic update)した主体のオブジェクトSIDがDACLに書き込まれ、以後は所有者本人(または管理者)しか上書きできないのが原則だが、DHCPサーバーがこのグループのメンバーとして代理更新すると、Microsoft公式ドキュメントの表現ではそのレコードは「secured でない状態」になり、「そのレコードを最初に変更したユーザーがオーナーになる (the first user to modify... becomes its owner)」という所有権未確定のレース状態に置かれる――恒久的に誰でも上書きできるわけではなく、先着順で所有権が確定する点が要点である。Akamaiらの解析では、この状態のACLはAuthenticated Users相当の主体に書き込み権限を付与する形になっており、結果としてドメイン内の認証済み任意のプリンシパルが早い者勝ちでレコードを作成・乗っ取りできてしまう。この挙動はDNSサーバー側のプロパティ OpenAclOnProxyUpdates(既定値1)で制御されており、dnscmd /config /OpenAclOnProxyUpdates 0 とすることでDnsUpdateProxy起因の緩いACL付与自体を無効化できる。この仕組みは、Windows 2000時代からある「複数のDHCPサーバー(バックアップ機や引き継ぎ構成)が同一クライアントのレコードを更新しようとした際、先に登録した1台のみが所有者となり他のサーバーは更新に失敗する」という問題を回避するための代替策として導入された経緯を持つ。Windows Server 2008 R2以降のDHCPには「名前保護(Name Protection)」機能があり、DHCIDリソースレコード(RFC 4701/4703)でクライアントとレコードの紐付けを検証することでこの弱点を部分的に緩和できるが、既定では無効な環境が多い。攻撃マップ上ではADIDNS/DHCP動的更新なりすまし技法(DDSpoof系)の対策(DnsUpdateProxy運用の廃止、専用ダミーアカウントでの動的更新、OpenAclOnProxyUpdates無効化、Name Protection有効化)を理解する前提となる一般像である。",
    "points": [
      "DHCPサーバーがクライアント代理で動的更新する際に加入する組み込みグループ",
      "作成レコードは secured でない状態→最初に変更したユーザーが所有者になるレース状態(恒久的に誰でも上書き可ではない)",
      "Akamai解析: 該当ACLはAuthenticated Users相当に書込権限を付与",
      "複数DHCPサーバー(バックアップ機/引き継ぎ構成)間の所有者競合(更新エラー)回避が導入の動機",
      "OpenAclOnProxyUpdates(既定1)がこの緩いACL付与を制御。dnscmd /config /OpenAclOnProxyUpdates 0 で無効化可能",
      "緩和策: DnsUpdateProxy運用中止、専用ダミーアカウントでの動的更新、Name Protection(DHCIDレコード, Server 2008 R2以降)の有効化"
    ],
    "related": [
      "adidns",
      "dclocator",
      "secdesc",
      "accessmask",
      "dhcpdnsauditlog",
      "wellknownsid"
    ]
  },
  {
    "id": "dschanges",
    "term": "ディレクトリサービス変更監査 (5136/5137/5141)",
    "en": "Directory Service Changes Auditing (Event 5136/5137/5141)",
    "aka": "5136 Modify, 5137 Create, 5138 Undelete, 5139 Move, 5141 Delete, DS Changes subcategory, old/new value auditing, AttributeLDAPDisplayName",
    "cat": "logging",
    "body": "ディレクトリサービス変更監査は、高度な監査ポリシーの「ディレクトリサービスの変更」(DS Changes)サブカテゴリが生成するイベント群の総称で、中核は5136(オブジェクト変更)・5137(オブジェクト作成)・5141(オブジェクト削除)だが、同じサブカテゴリから5138(オブジェクト復元/Undelete)と5139(オブジェクト移動/Move)も記録される。4662が「どのアクセス権が行使されたか」という操作の発生のみを記すのに対し、5136はAttributeLDAPDisplayNameで変更された属性名を特定した上で、値の変更を『Operation\\Type = Value Deleted』(旧値)と『Operation\\Type = Value Added』(新値)という2件のイベントとして記録し、両者は同一のCorrelation IDで紐付くため、攻撃者が書き込んだ具体的な値そのものまで前後関係込みで追跡できる点が本質的に異なる。有効化には二段構えの設定が必須で、(1)グループポリシーで「DS Access > ディレクトリサービスの変更」監査サブカテゴリを成功/失敗で有効化すること、(2)監視対象オブジェクト(コンテナ・OU・個別オブジェクト)のSACLに監査ACE(通常はEveryoneに対するWrite Property等の成功監査)を明示的に設定することの両方が揃わない限りイベントは一切生成されない。攻撃マップのhuntフィールドで「5136で属性が変わった」という記述が成立する前提はこの二重要件であり、どちらか一方が欠けた環境ではShadow Credentials(msDS-KeyCredentialLink)、RBCD(msDS-AllowedToActOnBehalfOfOtherIdentity)、BadSuccessor(msDS-ManagedAccountPrecededByLink)などの属性書き換え検知クエリが根本的に機能しなくなる。GPOリンクの変更やACL改ざんの検知でも同様に5136/5139が利用されるため、Tier 0オブジェクトへのSACL設計は検知体制の生命線となる。",
    "points": [
      "5136=Modify, 5137=Create, 5138=Undelete, 5139=Move, 5141=Delete — 同一DS Changesサブカテゴリが生成",
      "4662(アクセス発生の記録のみ)と異なり、5136はAttributeLDAPDisplayNameに加え、Value Deleted(旧値)/Value Added(新値)という相関イベントペア(共通Correlation ID)として変更値まで記録",
      "有効化要件は二重: (1)高度な監査ポリシー『ディレクトリサービスの変更』を有効化 (2)対象オブジェクトのSACLに監査ACE設定",
      "サブカテゴリ無効・SACL未設定のいずれか片方でも欠けるとイベント自体が生成されない",
      "msDS-KeyCredentialLink/msDS-AllowedToActOnBehalfOfOtherIdentity/msDS-ManagedAccountPrecededByLink等の属性書換検知huntが本サブカテゴリに依存"
    ],
    "related": [
      "sacl",
      "auditpolicy",
      "eventlog",
      "keycredlink",
      "rbcdattr",
      "badsuccessor"
    ]
  },
  {
    "id": "wfpaudit",
    "term": "WFP (Windows Filtering Platform) 接続監査 (5156/5157)",
    "en": "Windows Filtering Platform Connection Auditing (Event 5156/5157)",
    "aka": "WFP, Filtering Platform Connection, フィルタリング プラットフォームの接続の監査",
    "cat": "logging",
    "body": "WFP (Windows Filtering Platform) 接続監査は、Windows Firewall や IPsec が経由するカーネルモードのフィルタリング基盤 (Base Filtering Engine) を通過する各コネクションの許可/拒否を、詳細監査ポリシーのオブジェクトアクセス配下のサブカテゴリ「フィルタリング プラットフォームの接続の監査」(auditpol /set /subcategory:\"Filtering Platform Connection\") で記録する仕組みで、既定では無効化されている。許可された接続は Event 5156、ブロックされた接続は Event 5157 として記録され、Application Name、Direction、Source/Destination Address・Port、Protocol、Filter Run-Time ID、Layer Name などのフィールドを含む。これは Sysmon Event ID 3 (ネットワーク接続) のようなサードパーティ製テレメトリや、Zeek/PCAP 等の外部 NSM とは別物で、エージェント導入やパケットキャプチャなしに OS 標準機能だけでホスト自身のカーネルレベル接続可視性(ループバックや localhost 接続も含む)を得られる点が特徴。実装上の落とし穴として、SourceAddress や DestPort などのフィールドは Event 4624 の IpAddress のように SecurityEvent テーブル(Microsoft Sentinel 等)で独立した列にパースされず、EventData/RenderedDescription 内のテキストとして埋め込まれるため、クエリ時に文字列抽出(正規表現等)が必要になる。攻撃マップ上では、LDAP Ping/cLDAP によるユーザー列挙時の TCP 389/636 への送信元接続や、SMB/RPC 系横展開における 445/135 への許可接続を補足する低コストな検知ソースとして機能するが、全許可接続を記録すると大量のログになるため実運用ではフィルタの絞り込みが必要になる。",
    "points": [
      "Event 5156 = 許可接続、5157 = ブロック接続(カーネルのBFEが記録)",
      "有効化には auditpol /set /subcategory:\"Filtering Platform Connection\" が必須(既定は無効)",
      "主要フィールド: Application Name, Direction, SourceAddress/Port, DestAddress/Port, Protocol, Filter/Layer Run-Time ID",
      "落とし穴: SourceAddress等はSecurityEvent(Sentinel)の独立列ではなくEventData内の文字列として格納",
      "Sysmon EID3や外部NSM(Zeek/PCAP)とは別物の、OS標準カーネルフィルタ(WFP)による接続監査"
    ],
    "related": [
      "eventlog",
      "auditpolicy",
      "sysmon",
      "networktelemetry",
      "rpc",
      "smb"
    ]
  },
  {
    "id": "dhcpdnsauditlog",
    "term": "DHCP/DNSサーバ監査ログ (DhcpSrvLog / DNS-Server Audit)",
    "en": "DHCP Server Audit Log (DhcpSrvLog) / DNS Server Audit Log",
    "aka": "DhcpSrvLog-*.log, Microsoft-Windows-Dhcp-Server/Operational, Microsoft-Windows-DNS-Server/Audit, DNS 515/516/519/520",
    "cat": "logging",
    "body": "DHCP/DNSサーバ監査ログは、Windows の DHCP サーバ役割・DNS サーバ役割がそれぞれ独自に生成する運用監査記録で、通常の Security イベントログ(4624 等)や AD DS 監査(5136)とは別系統のログ源である。DHCP サーバは既定で %SystemRoot%\\System32\\dhcp\\ 配下に曜日ごとの平文ログファイル DhcpSrvLog-Mon.log〜DhcpSrvLog-Sun.log を書き出す。各ファイルは該当曜日の1日分を保持し、翌週の同じ曜日に上書きされる形で7ファイルがローテーションする。ログはCSV形式で、イベントID 10/11(リース割当/更新)、12(リース解放)、30(DNS動的更新要求の送信)、31(DNS更新失敗)、32(DNS更新成功)などを記録する。これとは別に Microsoft-Windows-Dhcp-Server/Operational チャネル(イベントログ)も存在し、スコープの作成・変更・削除やDNS動的更新設定の変更といった構成操作寄りのイベントを扱う(サービス起動/停止ではない)。DNS サーバ側は Windows Server 2012 R2 以降で Microsoft-Windows-DNS-Server/Audit という専用チャネルが独立して用意され、Analytical/Debug ログとは別に既定で有効化されている。ゾーン操作カテゴリのイベントとしてリソースレコードの追加(515 Record create)・削除(516 Record delete)を記録するほか、RFC 2136 動的更新経由の作成・削除は専用の519(Record create - dynamic update)・520(Record delete - dynamic update)として区別され、更新元IPアドレスも記録される。攻撃者が WPAD レコードや DC 名(A/SRVレコード)を不正登録・上書きする、あるいは DHCP の DNS 動的更新代理登録機能を悪用してレコードを差し替える場合、Security ログや AD DS 監査には痕跡が残らないことが多く、この2系統のログを見ていないと検知できない。防御側は DhcpSrvLog の 30/32(DNS更新要求/成功)と DNS Server 監査の 515/516(動的更新由来を区別したい場合は519/520)を突き合わせ、想定外クライアントによるレコード登録や wpad・DC 名への上書きを相関分析することが検知の要となる。",
    "points": [
      "DhcpSrvLog-Mon〜Sun.log: %SystemRoot%\\System32\\dhcp\\ に平文CSV、曜日ごとに1ファイルを保持し翌週同曜日に上書きローテーション",
      "DHCP イベントID: 10/11=リース割当/更新、12=解放、30=DNS動的更新要求、31=更新失敗、32=更新成功",
      "Microsoft-Windows-Dhcp-Server/Operational はスコープ作成/変更/削除など構成操作を記録する別チャネル(サービス起動停止ではない)",
      "Microsoft-Windows-DNS-Server/Audit(Server 2012 R2+、既定有効): 515=レコード追加、516=レコード削除。動的更新由来の作成/削除は519/520で区別され更新元IPも記録",
      "Security(5136等)のAD DS監査だけでは捕捉できないwpad・DC名の不正登録検知に必須"
    ],
    "related": [
      "adidns",
      "dclocator",
      "eventlog",
      "namepoison",
      "wpad",
      "dnsupdateproxy"
    ]
  },
  {
    "id": "ioctl",
    "term": "IOCTL / DeviceIoControl (カーネルドライバ通信)",
    "en": "I/O Control Codes (IOCTL) via DeviceIoControl",
    "aka": "IOCTLハンドラ, DeviceIoControl API, IRP_MJ_DEVICE_CONTROL, IRP",
    "cat": "os",
    "body": "IOCTL(I/O Control Code)は、ユーザーモードのプロセスがカーネルモードのデバイスドライバへ制御コマンドやデータを送受信するための標準的な通信機構である。典型的な流れは、CreateFile でドライバのデバイスオブジェクト(例: \\Device\\Afd)へのハンドルを取得し、DeviceIoControl API に操作を識別する32ビットのIOCTLコードと入出力バッファを渡すと、I/Oマネージャがそのハンドルを基に IRP_MJ_DEVICE_CONTROL 型のIRP(I/O Request Packet)を組み立て、対応するドライバのディスパッチルーチンへ渡す、というものである。バッファの受け渡し方式は METHOD_BUFFERED(カーネルがコピーバッファを介する)や METHOD_NEITHER(ユーザーモードのポインタが未検証のまま渡る)などIOCTLコード自体にエンコードされており、後者は特に危険である。攻撃マップ上、afd.sys の IOCTL EoP(CVE-2023-21768)や CLFS ドライバのBLF操作EoPのような kernel-LPE 技法は、この「低権限プロセスからでも到達可能なIOCTLハンドラの入力検証不備がカーネルメモリ破壊に直結する」という前提の上に成り立っており、IOCTLの仕組みを理解しないとこれらの脆弱性の本質(=ユーザー制御可能なポインタ/サイズがカーネル側で検証されずに使われる)を把握できない。同様にBYOVDでは、署名済みだが脆弱な任意のドライバが公開するIOCTLハンドラを悪用し、カーネル権限での任意アドレス読み書きやプロセス終了保護解除を実現する。",
    "points": [
      "CreateFile→ハンドル取得→DeviceIoControl(IOCTLコード指定)→I/OマネージャがIRP_MJ_DEVICE_CONTROL型IRP生成→ドライバのディスパッチルーチンが処理",
      "IOCTLコード/IRP_MJ_DEVICE_CONTROL(IRPのメジャー機能コード)/DeviceIoControl(ユーザーモードAPI)は厳密には別レイヤだが実務上まとめて「IOCTLハンドラ」と呼ばれる",
      "バッファリング方式: METHOD_BUFFERED(カーネルコピー)、METHOD_NEITHER(ユーザーポインタ直渡し、要検証)",
      "afd.sys IOCTL EoP(CVE-2023-21768)、clfs.sys BLF操作EoPなどkernel-LPEの共通前提",
      "BYOVDは署名済み脆弱ドライバのIOCTLハンドラを悪用しカーネル権限の読み書き/プロセス保護解除を狙う"
    ],
    "related": [
      "userkernel",
      "syscall",
      "byovd",
      "handle"
    ]
  }
];
