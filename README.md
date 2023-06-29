# ZKP2P

### A trustless P2P fiat onramp powered by ZK proofs


<img width="1000" align="center" src="https://user-images.githubusercontent.com/6797244/229355494-3f9fd4aa-76a2-4219-b294-88e356e43345.jpeg"/>

ZKP2P is a trustless P2P fiat onramp that can be built on top of any web2 payment rails (e.g. Venmo, Paypal) without permission from the payment network itself. The network is powered by ZK proofs of DKIM signatures in payment confirmation emails, proving the SHA256, email regex, and RSA without revealing sensitive contents in the email. We are working with the [PSE](https://appliedzkp.org/) foundation to productionize a previous [submission](https://github.com/zkp2p/zk-p2p-v1) to the zkHack Lisbon and Berkeely ZKP MOOC hackathons.

If you're interested in collaborating, please reach out to us on our [Telegram](https://t.me/+XDj9FNnW-xs5ODNl).

### [WIP] Usage

#### Fetching Venmo ID Instructions
ZKP2P on-ramping requires submitting Venmo IDs on chain so the on-rampers knows where to send the payment. A Venmo ID is unique identifier (e.g. 1234567891011121314 up to 19 digits) for your Venmo account that is separate from your handle (@Venmo-User). They are encrypted with keys generated automatically for the on-ramper and stored locally. We cannot extract Venmo handles directly from the ID as it violates Venmo's Terms of Service. You can look up your Venmo ID using one of the following methods:
- Open any Venmo payment receipt email and click on 'Show original' and search for `user_id`. As of writing these instructions [4/30/2023], you should be able to locate your id in multiple places but may need to splice the `3D` encoding in front of the id.
- Paste `curl https://account.venmo.com/u/[YOUR_VENMO_HANDLE] | grep -o '"user":{"displayName":"[^"]*","id":"[0-9]*"' | sed 's/.*"id":"\([0-9]*\).*/\1/'` into the command line.

To verify your id, you can go to https://venmo.com/code?user_id=[YOUR_VENMO_ID] and the page should resolve to a profile for your account.
