// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
export const ZERO = BigInt(0);
export const SECONDS_IN_DAY = BigInt(86400);

export const VENMO_MAX_TRANSFER_SIZE = 2_000n;

export const DEPOSIT_REFETCH_INTERVAL = 30000; // 0.5 minutes
export const STATE_REFETCH_INTERVAL = 60000; // 1 minute

export const PRECISION = BigInt(1_000_000_000_000_000_000); // 18
export const USDC_UNITS = BigInt(1_000_000); // 6
export const PENNY_IN_USDC_UNITS = BigInt(10_000); // 6

// the numeric form of the payload1 passed into the primitive
// corresponds to the openssh signature produced by the following command:
// echo "E PLURIBUS UNUM; DO NOT SHARE" | ssh-keygen -Y sign -n double-blind.xyz -f ~/.ssh/id_rsa | pbcopy
export const MAGIC_DOUBLE_BLIND_BASE_MESSAGE =
  14447023197094784173331616578829287000074783130802912942914027114823662617007553911501158244718575362051758829289159984830457466395841150324770159971462582912755545324694933673046215187947905307019469n;
// Length in bits
export const MAGIC_DOUBLE_BLIND_BASE_MESSAGE_LEN = 672;

export const CIRCOM_FIELD_MODULUS = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
export const MAX_HEADER_PADDED_BYTES = 1024; // NOTE: this must be the same as the first arg in the email in main args circom
export const MAX_BODY_PADDED_BYTES = 6400; // NOTE: this must be the same as the arg to sha the remainder number of bytes in the email in main args circom


// circom constants from main.circom / https://zkrepl.dev/?gist=30d21c7a7285b1b14f608325f172417b
// template RSAGroupSigVerify(n, k, levels) {
// component main { public [ modulus ] } = RSAVerify(121, 17);
// component main { public [ root, payload1 ] } = RSAGroupSigVerify(121, 17, 30);
export const CIRCOM_BIGINT_N = 121;
export const CIRCOM_BIGINT_K = 17;
export const CIRCOM_LEVELS = 30;


// This is the string that comes right before the target string in the email. Ideally as close to the end of the email as possible.
export const STRING_PRESELECTOR = "<!-- recipient name -->";


// Misc smart contract values
export const UINT256_MAX = "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
export const ZERO_ADDRESS= "0x0000000000000000000000000000000000000000000000000000000000000000";
export const CALLER_ACCOUNT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
export const DEFAULT_NETWORK = "goerli";


// Proving key paths
export const HOSTED_FILES_PATH = "https://s3.amazonaws.com/zk-p2p/v2/v0.0.10/";
export const REGISTRATION_KEY_FILE_NAME = "venmo_registration/venmo_registration";
export const SEND_KEY_FILE_NAME = "venmo_send/venmo_send";

export const RemoteProofGenEmailTypes = {
    REGISTRATION: "registration",
    SEND: "send",
};

const ENABLE_STATE_LOGGING = false;
export const esl = ENABLE_STATE_LOGGING;

// Placeholder in proof gen text area for example
export const PLACEHOLDER_EMAIL_BODY = `Delivered-To: vitalik.buterin@gmail.com
Received: by 2002:a05:6022:216:b0:44:1edc:81b1 with SMTP id 12345678910111;
        Fri, 11 Aug 2023 10:25:07 -0700 (PDT)
X-Google-Smtp-Source: AGHT+IHU6bYBYrCGfzu3O7JGwBE62vEKhcTt0xCSLiQib0n3lAqEgZga4AOf9YuzVNeAXVNHxdof
X-Received: by 2002:ac8:5810:0:b0:403:b6d2:8dc4 with SMTP id g16-20020ac85810000000b00403b6d28dc4mr3292363qtg.34.1691774707601;
        Fri, 11 Aug 2023 10:25:07 -0700 (PDT)
ARC-Seal: i=1; a=rsa-sha256; t=1691774707; cv=none;
        d=google.com; s=arc-20160816;
        b=iEWRb+U9GM+KvxCa1LqDhC1N65i/ZDmSB1A9vcDF6AWkMT33DAyYGh5Hk/gsWPHS0K
         5XbPQ91lPHr8dVAknFGTfs/PTSAtFjO2yeTA7VnvLQB5fOTEJVz+6WOsqF2P+3wxAmno
         uKlWNN5eU0vIrRHXQbBV7xXDpFqdbUPcACQZnQSwle52rXRBXgPTUNUgYYeyco7gI2Lq
         iUpmcKoNbvzXraRsMQKhIZn3Z1hTCLtckshXJHqu4eVTGWBkaazF190+kaYJWuI0OtIj
         +Y1APRSfG+c9FlqbIcNtJE1y2uuyDdXNS5LW1DG/r4fgtI0YqoGIJ3++JtiwvSQalmbi
         KHOg==
ARC-Message-Signature: i=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20160816;
        h=feedback-id:date:message-id:mime-version:subject:to:reply-to:from
         :dkim-signature:dkim-signature;
        bh=hgc1kKeOZgX+VHTOQy0FTyl/Q4TxfqC9YggInKgO62o=;
        fh=F7aunlR3RVQ/hJTG8Jnp7C1WxWcrOKVS350ODhKBoSA=;
        b=I6sllcsb+L3n8b6U+tOW/v50CkPW4t0RvJ9efyxvV1e51skRxGm6NAL5Ub+kIafuhC
         KBQGjrNPd1PYK/Gqv0nphTRgbXl9WYZT52mSMbzfbxrHf4WS8LK6xg+wfn/EVyvQMJZ2
         uMdcO2SL8TZSM92PFkf11234567891011121bkjU2K8/3x3F5l+jrmqgugQidkueOjN6
         7hAbmQtNzzXC0+NdF8GfX1imz3J/ULtknWb1r/Z/lw/ddNYuSdD1mr3avYTuYgAo3pzm
         Ni2/lwJPpKqQMfOakkqOFNVIbTgfp0nbu7G4XmGBzqk+/eUVk4XZJRmWb0Ehv5YIMPP7
         2hJA==
ARC-Authentication-Results: i=1; mx.google.com;
       dkim=pass header.i=@venmo.com header.s=yzlavq3ml4jl4lt6dltbgmnoftxftkly header.b=fLRvbdAQ;
       dkim=pass header.i=@amazonses.com header.s=224i4yxa5dv7c2xz3womw6peuasteono header.b=OFYMleZd;
       spf=pass (google.com: domain of 01000189e5a16565-2f30b7f0-ba8f-4e85-afec-da06b267abd3-000000@amazonses.com designates 54.240.32.86 as permitted sender) smtp.mailfrom=01000189e5a16565-2f30b7f0-ba8f-4e85-afec-da06b267abd3-000000@amazonses.com;
       dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=venmo.com
Return-Path: <01000189e5a16565-2f30b7f0-ba8f-4e85-afec-da06b267abd3-000000@amazonses.com>
Received: from a32-86.smtp-out.amazonses.com (a32-86.smtp-out.amazonses.com. [54.240.32.86])
        by mx.google.com with ESMTPS id x19-20020ac85f13000000b004039e75c91csi2556259qta.345.2023.08.11.10.25.07
        for <vitalik.buterin@gmail.com>
        (version=TLS1_2 cipher=ECDHE-ECDSA-AES128-GCM-SHA256 bits=128/128);
        Fri, 11 Aug 2023 10:25:07 -0700 (PDT)
Received-SPF: pass (google.com: domain of 01000189e5a16565-2f30b7f0-ba8f-4e85-afec-da06b267abd3-000000@amazonses.com designates 54.240.32.86 as permitted sender) client-ip=54.240.32.86;
Authentication-Results: mx.google.com;
       dkim=pass header.i=@venmo.com header.s=yzlavq3ml4jl4lt6dltbgmnoftxftkly header.b=fLRvbdAQ;
       dkim=pass header.i=@amazonses.com header.s=224i4yxa5dv7c2xz3womw6peuasteono header.b=OFYMleZd;
       spf=pass (google.com: domain of 01000189e5a16565-2f30b7f0-ba8f-4e85-afec-da06b267abd3-000000@amazonses.com designates 54.240.32.86 as permitted sender) smtp.mailfrom=01000189e5a16565-2f30b7f0-ba8f-4e85-afec-da06b267abd3-000000@amazonses.com;
       dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=venmo.com
DKIM-Signature: v=1; a=rsa-sha256; q=dns/txt; c=relaxed/simple; s=yzlavq3ml4jl4lt6dltbgmnoftxftkly; d=venmo.com; t=1691774707; h=From:Reply-To:To:Subject:MIME-Version:Content-Type:Message-ID:Date; bh=xWWu/op9vZLDBR6PhWhXgTelbxlW7ZTZFoh2VDOta6Y=; b=fLRvbdAQQa2V7sLmTD6NxSIABNw9+J8F5EqsSzFwwWoUnWoCMbRXvlwxUcopfCi3 78ORH7F2dlc0NJcfjqZ7RzYrkb5RcyaUE2Id0pnbtQTelTBZolevybvKyp4bgdCERN/ lp8BMwyHKSzny0DnlY31TTLUROOm56Ne48oqHUSU=
DKIM-Signature: v=1; a=rsa-sha256; q=dns/txt; c=relaxed/simple; s=224i4yxa5dv7c2xz3womw6peuasteono; d=amazonses.com; t=1691774707; h=From:Reply-To:To:Subject:MIME-Version:Content-Type:Message-ID:Date:Feedback-ID; bh=xWWu/op9vZLDBR6PhWhXgTelbxlW7ZTZFoh2VDOta6Y=; b=OFYMleZdmckX5mUY9Pzp49TOjo3y3R8tML514d8tcSSlZm4Al6ysf/s25f2fftz9 SKHK3CGNB52gZDlL2ctKCditbgBs0qCdFecacxzXOxLlJrDNxH2vyYU4u8cuGnlf3Ei rWV8MLnJRoUNOVQEiTBBunaYyAeMTG0Z7K9xUbHY=
From: Venmo <venmo@venmo.com>
Reply-To: Venmo No-reply <no-reply@venmo.com>
To: vitalik.buterin@gmail.com
Subject: You paid Joe Lubin $1.00
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="----=_Part_2586266_171006879.1691774707049"
Message-ID: <01000189e5a16565-2f30b7f0-ba8f-4e85-afec-da06b267abd3-000000@email.amazonses.com>
Date: Fri, 11 Aug 2023 17:25:07 +0000
Feedback-ID: 1.us-east-1.fQ0yL0IwGSResIpU9lW9fHNtFl/iEQA4Znd52HkQv2U=:AmazonSES
X-SES-Outgoing: 2023.08.11-54.240.32.86

------=_Part_2586266_171006879.1691774707049
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 7bit


------=_Part_2586266_171006879.1691774707049
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: quoted-printable



<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
 "http://www.w3.org/TR/html4/strict.dtd">
<html class=3D""  id=3D"html_container" xmlns=3D"http://www.w3.org/1999/xht=
ml" dir=3D"ltr" lang=3D"en-US" xmlns:fb=3D"http://www.facebook.com/2008/fbm=
l">
    <head>
        <meta http-equiv=3D"Content-Type" content=3D"text/html; charset=3Du=
tf-8">
        <title> - Venmo</title>
    </head>

    <body style=3D"margin:0;color: #2F3033">
       =20
        <div style=3D"font-family:'helvetica neue';">
            <div style=3D"margin: 0 auto; max-width: 320px;">
                <div style=3D"font-size:14px;border: 2px solid #e8ebea;">
                    <div style=3D"padding: 10px 0; text-align: center; back=
ground-color: #0074DE;">
                        <img src=3D"https://s3.amazonaws.com/venmo/venmo-lo=
go-white.png" alt=3D"venmo" title=3D"venmo" style=3D"color: #fff;width:125p=
x;height:24px;" />
                    </div>
                   =20
                    <div style=3D"padding:20px;background-color:#fff;">
                       =20

<div width=3D"100%" >
   =20



   =20

<table id=3D"_story" width=3D"100%"> <tbody>
    <tr>
        <!-- img of actor -->
        <td valign=3D"top" width=3D"48px" style=3D"padding-right:10px;">
            <a href=3D"https://venmo.com/code?user_id=1234567891011121=
&actor_id=1234567891011121" aria-label=3D"">
                <img src=3D"https://pics.venmo.com/4a2862fb-0ddc-46ae-a8cc-=
faaf6917aaf8?width=3D100&amp;height=3D100&amp;photoVersion=3D2" alt=3D"" st=
yle=3D"border-radius:3px;width:48px;height:48px;"/>
            </a>
        </td>
        <td style=3D"font-size:14px;color:#2F3033;vertical-align:top;paddin=
g-left:2px;">
            <div >
                <!-- actor name -->
                <a style=3D"color:#0074DE; text-decoration:none" href=3D"ht=
tps://venmo.com/code?user_id=1234567891011121&actor_id=1234567891011121=
1234">
                    You
                </a>
                <!-- action -->
                <span>
                    paid
                </span>
              =20
                <!-- recipient name -->
                <a style=3D"color:#0074DE; text-decoration:none"
                   =20
                    href=3D"https://venmo.com/code?user_id=1234567891011121=
1234&actor_id=12345678910111211234">
                   =20
                    Joe Lubin
                </a>
               =20
            </div>
            <!-- note -->
            <div>
                <p>Zk</p>
            </div>
        </td>
    </tr>
    <tr>
        <td></td>
        <td style=3D"font-size:14px;padding-left:2px;color:#2F3033;">
            Transfer Date and Amount:
        </td>
    </tr>
    <tr>
        <td></td>
        <td style=3D"font-size:14px;padding-left:2px;color:#2F3033;">
        <!-- date, audience, and amount -->
            <span>Aug 11, 2023 PDT</span>
            <span> =C2=B7 </span>
            <img style=3D"vertical-align: -1px; width: 12px; height: 12px;"=
 src=3D"https://s3.amazonaws.com/venmo/audience/private_v2.png" alt=3D"priv=
ate"/>
           =20

            <!-- amount -->
           =20
            <span style=3D"float:right;">
               =20
                - $10.00
               =20
            </span>
           =20
        </td>
    </tr>
   =20
   =20
   =20
    <tr>
        <td></td>
        <td style=3D"padding-top:10px;">
            <table style=3D"width:170px; table-layout:fixed;font-size:14px;=
">
                <tbody>
                <tr>
                   =20
                    <td style=3D"padding:5px 0; text-align:center; border-r=
adius:50px; background-color:#0074DE;" >
                        <a href=3D"https://venmo.com/story/3867204547727618=
604?k=3D38e7ac52-17ea-4faa-81a0-25ab8e0d23c0" style=3D"text-decoration:none=
; color: #fff;display:block;width:100%;">
                                Like
                        </a>
                    </td>
                   =20
                   =20
                    <td style=3D"padding:5px 0; border-radius:50px; text-al=
ign:center;background-color:#0074DE;" >
                        <a href=3D"https://venmo.com/story/3867204547727618=
604?login=3D1" style=3D"text-decoration:none; color: #fff;display:block;wid=
th:100%;">
                            Comment
                        </a>
                    </td>
                   =20
                </tr>
                </tbody>
            </table>
        </td>
    </tr>
   =20
</tbody> </table>



<div style=3D"margin-top:10px;"></div>
   =20

    <div style=3D"color:#6B6E76;font-size:12px;margin-top:10px;padding-top:=
10px; border-top: 1px dotted #ccc">
       =20
       =20
           =20
                Completed via a bank transfer
               =20
                from your SVB account ending in 1234.
               =20
           =20
       =20
       =20
        <br /><br />
        Payment ID: 1234567891011121314
       =20
</div>

   =20
<div style=3D"color:#6B6E76;font-size:12px;margin-top:10px;padding-top:10px=
; border-top: 1px dotted #ccc">
    <div style=3D"width:50%; padding:5px; text-align:center; border-radius:=
50px; background-color:#0074DE;">
        <a href=3D"https://venmo.com/referral/invite?campaign_service=3Dema=
il&campaign_template=3Dpayment.sent" style=3D"text-decoration:none; color: =
#000; display:block; width:100%; font-size:12px;">
            <div style=3D"font-size:14px; color:#fff;">Invite Friends!</div=
>
        </a>
    </div>


    <div style=3D"margin-bottom:10px;"></div>

</div>

    <div id=3D"_receipt_disclosures" style=3D"font-size:11px;margin-top:10p=
x;padding-top:10px; border-top: 1px dotted #ccc">

    <div>
        For any issues, including the recipient not receiving funds, please=
 contact us at support@venmo.com or call 1-123-456-789.
    </div>


    <div style=3D"margin-top:10px;">
        See our <a style=3D"text-decoration:none;color:#0074DE" href=3D"htt=
ps://venmo.com/legal/regulatory-agency-california">disclosures</a> for more=
 information.<div style=3D"margin-top:10px;">Please do not reply directly t=
o this email. For more assistance, visit our Help Center at <a style=3D"tex=
t-decoration:none;color:#0074DE" href=3D"https://help.venmo.com">help.venmo=
.com</a>.</div><div style=3D"margin-top:10px;">This payment will be reviewe=
d for compliance with our User Agreement and if we determine that there is =
a violation by either party, it may be reversed or your ability to transfer=
 to your bank account may be restricted.</div>
    </div>

</div>

</div>


                       =20
                    </div>
                    <div style=3D"padding:10px 15px; color: #6B6E76; text-a=
lign: center;">
                       =20
                        <div style=3D"color: #6B6E76; margin-top: 5px;">
                            Venmo is a service of PayPal, Inc., a licensed =
provider of money transfer services. All money transmission is provided by =
PayPal, Inc. pursuant to <a href=3D"https://venmo.com/legal/us-licenses/" s=
tyle=3D"color:#0074DE; text-decoration:none">PayPal, Inc.=E2=80=99s license=
s</a>.
                        </div>
                      <p style=3D"color: #6B6E76; margin-top: 14px;">PayPal=
 is located at </p><p style=3D"color: #6B6E76;">Multiverse, Eth=
ereum, Alchemy 12345</p>
                        <div style=3D"margin-top: 5px;">
                           =20
                           =20
                                <div style=3D"font-size: smaller; margin-to=
p: 20px;">For security reasons, you cannot unsubscribe from payment emails.=
</div>
                           =20
                        </div>
                       =20
                    </div>
                </div>
               =20
               =20
            </div>
        </div>
    </body>
</html>

------=_Part_1234567_171006879.1691774707049--
`;
