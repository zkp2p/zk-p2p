# ZKP2P

## A trustless P2P fiat onramp powered by ZK proofs

ZKP2P is a trustless and privacy-preserving fiat-to-crypto onramp powered by ZK proofs. This (V2) repo is currently under active development. ZKP2P is currently live in Alpha which is a productionized version with audits and supporting Venmo, a popular P2P payment network in the US. Try it out at [zkp2p.xyz](https://zkp2p.xyz/)

![X-blob-background-1500x500px](https://github.com/zkp2p/zk-p2p/assets/6797244/65e8ae36-eb8b-4b53-85e9-fa0801bafcf0)

## Overview

The network leverages zero-knowledge proofs to verify DKIM signatures in payment confirmation emails, enabling secure and private fiat-to-crypto transactions. Key features include:

- **Privacy-First**: Proves SHA256, email regex, and RSA without revealing sensitive email contents
- **Trustless**: No intermediaries or centralized authorities needed
- **Venmo Integration**: Currently supports Venmo for US-based transactions
- **Actively Developed**: Working on reducing proving times and adding more payment rails

We are collaborating with the Privacy and Scaling Exploration ([PSE](https://pse.dev/projects/zkp2p)) group to advance zero-knowledge proving systems.

## Quick Start

### Prerequisites
- Node.js v16+
- Yarn
- A Venmo account (for testing)

### Installation
```bash
git clone https://github.com/zkp2p/zkp2p-v1-monorepo.git
cd zkp2p-v1-monorepo
yarn install
```

### Development
```bash
yarn dev
```

## How To Use

### Fetch Your Venmo ID
ZKP2P off-ramping requires submitting Venmo IDs on chain so the on-rampers knows where to send the payment. A Venmo ID is unique identifier (e.g. 1234567891011121314 up to 19 digits) for your Venmo account that is separate from your handle (@Venmo-User).

Methods to find your Venmo ID:

1. **Email Method**:
   - Open any Venmo payment receipt email
   - Click on 'Show original'
   - Search for `user_id`
   - Note: You may need to remove the `3D` encoding prefix

2. **Command Line Method**:
   ```bash
   curl https://account.venmo.com/u/[YOUR_VENMO_HANDLE] | grep -o '"user":{"displayName":"[^"]*","id":"[0-9]*"' | sed 's/.*"id":"\([0-9]*\).*/\1/'
   ```
   Replace `[YOUR_VENMO_HANDLE]` with your Venmo username (without `@`)

To verify your ID, visit: `https://venmo.com/code?user_id=[YOUR_VENMO_ID]`

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you would like to change.

## Roadmap

- [x] Alpha release with Venmo support
- [ ] Reduce proving times
- [ ] Integration with PayPal
- [ ] Integration with Transferwise
- [ ] Additional payment rail integrations

## Community

- [Twitter](https://twitter.com/zkp2p)
- [Telegram](https://t.me/+XDj9FNnW-xs5ODNl)

## Acknowledgements

This project has been supported by a grant from EF and PSE. Find our [grant proposal here](https://hackmd.io/R0QW7X4UQCSsZ4X8pFergg). We thank them for their generous support.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
