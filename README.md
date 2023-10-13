# ZKP2P

## A trustless P2P fiat onramp powered by ZK proofs

ZKP2P is a trustless and privacy-preserving fiat-to-crypto onramp powered by ZK proofs. This (V2) repo is currently under active development to launch a productionized version with audits. Once completed, this application will enable fiat to crypto on ramping through Venmo, a popular P2P payment network in the US.

<img width="1000" align="center" src="https://github.com/zkp2p/zk-p2p/assets/73331595/3dce3e57-2f83-46fb-ba3f-576df97d31d7"/>


## Overview
The network is powered by ZK proofs of DKIM signatures in payment confirmation emails, proving the SHA256, email regex, and RSA without revealing sensitive contents in the email. We are working with the Privacy and Scaling Exploration ([PSE](https://pse.dev/projects/zkp2p)) group to explore applications for zero-knowledge proving systems

V1 (PoC) is live on Optimism and Goerli, try it out at [zkp2p.xyz](https://zkp2p.xyz/). See the [repo](https://github.com/zkp2p/zk-p2p-v1) and [demo](https://drive.google.com/file/d/1CaPoVMrZUEuvsFhXLLI9D1wUXevqSwkT/view?usp=drive_link) for usage tips.
Follow us on our [Twitter](https://twitter.com/zkp2p) and our [Telegram](https://t.me/+XDj9FNnW-xs5ODNl) for announcements and updates!

After the launch of V2, we will continue experimenting with new infrastructure to improve the UX by bringing down proving times and integrating other payment rails such as Paypal and Transferwise.

If you're interested in collaborating, please reach out to us on our [Telegram](https://t.me/+XDj9FNnW-xs5ODNl).

## How To:

### Fetch Your Venmo ID
ZKP2P off-ramping requires submitting Venmo IDs on chain so the on-rampers knows where to send the payment. A Venmo ID is unique identifier (e.g. 1234567891011121314 up to 19 digits) for your Venmo account that is separate from your handle (@Venmo-User). You can look up your Venmo ID using one of the following methods:

- Open any Venmo payment receipt email and click on 'Show original' and search for `user_id`. As of writing these instructions [4/30/2023], you should be able to locate your id in multiple places but may need to splice the `3D` encoding in front of the id.
- Paste `curl https://account.venmo.com/u/[YOUR_VENMO_HANDLE] | grep -o '"user":{"displayName":"[^"]*","id":"[0-9]*"' | sed 's/.*"id":"\([0-9]*\).*/\1/'` into the command line, replacing YOUR_VENMO_HANDLE with your Venmo username without the `@` e.g. `Alex-Soong`.

To verify your id, you can go to https://venmo.com/code?user_id=[YOUR_VENMO_ID] and the page should resolve to a profile for your account.

## Acknowledgements
This project has been supported by a grant from EF and PSE. Find our [grant proposal here](https://hackmd.io/R0QW7X4UQCSsZ4X8pFergg). We thank them for their generous support.
