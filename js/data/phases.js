window.AD = window.AD || {};
AD.PHASES = [
    { id: "recon",     idx: "01", name: "偵察・列挙",           en: "Recon / Enum",           desc: "ドメインの構造・ユーザー・権限関係・攻撃経路を、正規プロトコル（LDAP/Kerberos/SMB）を使って合法的に近い形で収集する段階。ここでの静けさが後段の成否を分ける。" },
    { id: "credaccess",idx: "02", name: "資格情報アクセス",     en: "Credential Access",      desc: "Kerberos やホスト上のメモリ・ディスクから、パスワードハッシュ・チケット・平文・鍵を奪う。AD 侵害の心臓部。" },
    { id: "coercion",  idx: "03", name: "中間者・強制認証",     en: "Coercion / Relay",       desc: "名前解決のポイズニングや認証の強制（Coercion）で NTLM/Kerberos 認証を奪い、リレーして権限を得る。設定不備（署名なし等）を突く。" },
    { id: "privesc",   idx: "04", name: "権限昇格",             en: "Privilege Escalation",   desc: "委任設定・ACL・証明書サービス(ADCS)・既知CVE を悪用して、一般ユーザーから Domain Admin 級へ引き上げる。AD の設計上の弱点が集まる領域。" },
    { id: "lateral",   idx: "05", name: "横展開",               en: "Lateral Movement",       desc: "奪った資格情報・チケットを使い、ホストからホストへ移動して足場を広げる。PtH/PtT と各種リモート実行。" },
    { id: "dominance", idx: "06", name: "ドメイン支配・永続化", en: "Dominance / Persist",    desc: "KRBTGT やCA鍵などの“最上位の秘密”を奪い、任意チケット偽造・複製・永続的バックドアでドメインを恒久支配する。" },
    { id: "trust",     idx: "07", name: "トラスト/フォレスト間", en: "Trust / Forest",         desc: "ドメイン/フォレスト間の信頼関係、SID History、クラウド連携(Entra)を悪用し、境界を越えて支配を拡張する。" },
  ];
