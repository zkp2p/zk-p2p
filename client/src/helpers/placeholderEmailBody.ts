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
`;