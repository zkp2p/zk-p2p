# ZKP2P Contracts

[![Coverage Status](https://coveralls.io/repos/github/zkp2p/zk-p2p/badge.svg)](https://coveralls.io/github/zkp2p/zk-p2p)

### Local Node Configuration Steps:
- Run `yarn install` from the `contracts/` directory
- Run `npx hardhat node`
- Configure browser wallet with local hardhat network
    - Add correct settings, see [guide](https://medium.com/@kaishinaw/connecting-metamask-with-a-local-hardhat-network-7d8cea604dc6)
    - Import account private key for Account #0. This is the deployer by default
- Run `yarn deploy:localhost`
- Update client/src/helpers/deployed_addresses.ts with newly deployed `Ramp` and `USDCMock` addresses under `development`
