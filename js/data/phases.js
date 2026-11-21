window.AD = window.AD || {};
AD.I18N = AD.I18N || { ja: {} };
AD.I18N.ja.phases = [
    { id: "recon",     idx: "01", name: "偵察・列挙",           en: "Recon / Enum",           desc: "ドメインの構造、ユーザー、権限関係、攻撃経路を、LDAP・Kerberos・SMB といった正規のプロトコルで集める段階。通常の業務通信に紛れるので、単発のログでは気づきにくい。" },
    { id: "credaccess",idx: "02", name: "資格情報アクセス",     en: "Credential Access",      desc: "Kerberos やホストのメモリ・ディスクから、パスワードハッシュ、チケット、平文のパスワード、鍵を盗む。後続の手法のほとんどは、ここで得た資格情報を前提にしている。" },
    { id: "coercion",  idx: "03", name: "中間者・強制認証",     en: "Coercion / Relay",       desc: "名前解決のポイズニングや認証の強制（Coercion）で NTLM・Kerberos の認証を引き出し、別のサーバへリレーして権限を得る。SMB 署名や LDAP 署名が無効な環境で成立する。" },
    { id: "privesc",   idx: "04", name: "権限昇格",             en: "Privilege Escalation",   desc: "委任設定、ACL、証明書サービス（ADCS）、既知の CVE を悪用して、一般ユーザーから Domain Admin 相当まで権限を上げる。" },
    { id: "lateral",   idx: "05", name: "横展開",               en: "Lateral Movement",       desc: "奪った資格情報やチケットで、ホストからホストへ移って足場を広げる。Pass-the-Hash、Pass-the-Ticket と各種のリモート実行が中心。" },
    { id: "dominance", idx: "06", name: "ドメイン支配・永続化", en: "Dominance / Persist",    desc: "KRBTGT や CA の鍵のような最上位の秘密を奪い、チケットの偽造や複製、バックドアでドメインを長く支配し続ける。" },
    { id: "trust",     idx: "07", name: "トラスト/フォレスト間", en: "Trust / Forest",         desc: "ドメインやフォレストの間の信頼関係、SID History、クラウド連携（Entra）を悪用し、信頼の境界を越えて支配を広げる。" },
  ];
