### Description

For circuit updates, please provide a brief description of the changes included in this PR.


### Checklist

For any circuit changes, complete the following steps to ensure faster integration with UI and Smart Contracts:

- [ ] Ran `yarn:compile:XXX` where `XXX` is the name of the circuit
- [ ] Ran `yarn test` to check all tests are passing
- [ ] Ran `yarn:genkey:chunked:unsafe:XXX` AND `yarn:genkey:non-chunked:unsafe:XXX` to generate new proving keys for each circuit that was updated
- [ ] Updated `UPLOAD_FOLDER` in `circuit.env` to a new path in S3. E.g. `UPLOAD_FOLDER="v2/v0.0.5"`
- [ ] Ran `yarn uploadkeys:XXX` to upload to S3. Ensure that BOTH chunk and nonchunk keys are uploaded
- [ ] Ran `yarn:genverifier:XXX` to generate solidity verifier
- [ ] Ran `yarn:gen-input:XXX` to generate inputs for witness generation
- [ ] Ran `yarn:genwitness:XXX` to generate witnesses for proof generation
- [ ] Ran `yarn:genproof:XXX` to generate proof for test solidity calldata
- [ ] Ran `yarn:gencalldata:XXX` to generate solidity calldata
- [ ] Ensured files are public through ACL in `zk-p2p` S3 bucket
- [ ] Updated `package.json` in circuits to correct version and ran `npm publish`
- [ ] Paste test calldata below