import "module-alias/register";

import { BigNumber } from "ethers";
import { ethers } from "ethers";

import { Account } from "@utils/test/types";
import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";

import DeployHelper from "@utils/deploys";
import { Address } from "@utils/types";
import { ClaimVerifier } from "@utils/contracts";

const expect = getWaffleExpect();

describe("ClaimVerifier", () => {
  let owner: Account;
  let witnessAddress: Address;
  let otherWitness: Account;

  let deployer: DeployHelper;

  let claimVerifier: ClaimVerifier;

  beforeEach(async () => {
    [
      owner,
      otherWitness
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);
    witnessAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'    // hardhat 0

    claimVerifier = await deployer.deployClaimVerifier();
    claimVerifier.transferOwnership(owner.address);
  });

  describe("#addWitness", async () => {
    let subjectWitness: Address;

    beforeEach(async () => {
      subjectWitness = witnessAddress;
    });

    async function subject(): Promise<any> {
      return claimVerifier.addWitness(subjectWitness);
    }

    it("should add the witness", async () => {
      await subject();

      const witnesses = await claimVerifier.getWitnesses();
      expect(witnesses.length).to.equal(1);
      expect(witnesses[0]).to.equal(subjectWitness);
    });

    it("should emit a WitnessAdded event", async () => {
      await expect(subject())
        .to.emit(claimVerifier, "WitnessAdded")
        .withArgs(subjectWitness);
    });

    it("should update the isWitness mapping", async () => {
      await subject();

      const isWitness = await claimVerifier.isWitness(subjectWitness);
      expect(isWitness).to.be.true;
    });

    it("should revert if the witness already exists", async () => {
      await subject(); // Add the witness first

      await expect(subject()).to.be.revertedWith("Address is already a witness");
    });

    describe("when called by a non-owner", async () => {
      beforeEach(async () => {
        claimVerifier = claimVerifier.connect(otherWitness.wallet);
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("#removeWitness", async () => {
    let subjectWitness: Address;

    beforeEach(async () => {
      subjectWitness = witnessAddress;

      await claimVerifier.addWitness(subjectWitness);
    });

    async function subject(): Promise<any> {
      return claimVerifier.removeWitness(subjectWitness);
    }

    it("should remove the witness", async () => {
      await subject();

      const witnesses = await claimVerifier.getWitnesses();
      expect(witnesses.length).to.equal(0);
    });

    it("should emit a WitnessRemoved event", async () => {
      await expect(subject())
        .to.emit(claimVerifier, "WitnessRemoved")
        .withArgs(subjectWitness);
    });

    it("should update the isWitness mapping", async () => {
      await subject();

      const isWitness = await claimVerifier.isWitness(subjectWitness);
      expect(isWitness).to.be.false;
    });

    it("should revert if the witness does not exist", async () => {
      await subject(); // Remove the witness first

      await expect(subject()).to.be.revertedWith("Address is not a witness");
    });

    describe("when called by a non-owner", async () => {
      beforeEach(async () => {
        claimVerifier = claimVerifier.connect(otherWitness.wallet);
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("#addProviderHash", async () => {

    let subjectProviderHash: string;

    beforeEach(async () => {
      subjectProviderHash = '0x94303faca9758e19301320d1cdfa5f0a180fc2fd15e4adcc31fee67ec6d4d8f3';
    });

    async function subject(): Promise<any> {
      return claimVerifier.addProviderHash(subjectProviderHash);
    }

    it("should add provider hash", async () => {
      await subject();

      const providerHashes = await claimVerifier.getProviderHashes();

      expect(providerHashes.length).to.equal(1);
      expect(providerHashes[0]).to.equal(subjectProviderHash);
    });

    it("should update the isProviderHash mapping", async () => {
      await subject();

      const isProviderHash = await claimVerifier.isProviderHash(subjectProviderHash);
      expect(isProviderHash).to.be.true;
    });

    it("should emit a ProviderHashAdded event", async () => {
      await expect(subject())
        .to.emit(claimVerifier, "ProviderHashAdded")
        .withArgs(subjectProviderHash);
    });

    it("should revert if the provider hash already exists", async () => {
      await subject(); // Add the hash first

      await expect(subject()).to.be.revertedWith("Provider hash already added");
    });
    describe("when called by a non-owner", async () => {
      beforeEach(async () => {
        claimVerifier = claimVerifier.connect(otherWitness.wallet);
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("#removeProviderHash", async () => {
    let subjectProviderHash: string;

    beforeEach(async () => {
      // Add non-subject provider hash first to make sure we get coverage
      await claimVerifier.addProviderHash('0x94303faca9758e19301320d1cdfa5f0a180fc2fd15e4adcc31fee67ec6d4d8f2');
      
      subjectProviderHash = '0x94303faca9758e19301320d1cdfa5f0a180fc2fd15e4adcc31fee67ec6d4d8f3';
      await claimVerifier.addProviderHash(subjectProviderHash);
    });

    async function subject(): Promise<any> {
      return claimVerifier.removeProviderHash(subjectProviderHash);
    }

    it("should remove the provider hash", async () => {
      await subject();

      const providerHashes = await claimVerifier.getProviderHashes();
      const isProviderHash = await claimVerifier.isProviderHash(subjectProviderHash);

      expect(providerHashes.length).to.equal(1);
      expect(isProviderHash).to.be.false;
    });

    it("should emit a ProviderHashRemoved event", async () => {
      await expect(subject())
        .to.emit(claimVerifier, "ProviderHashRemoved")
        .withArgs(subjectProviderHash);
    });

    describe("when the provider hash is already removed", async () => {
      beforeEach(async () => {
        await subject(); // Remove the hash first
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Address is not a witness");
      });
    });

    describe("when called by a non-owner", async () => {
      beforeEach(async () => {
        claimVerifier = claimVerifier.connect(otherWitness.wallet);
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("#verifyProof", async () => {

    let subjectProof: any;
    let subjectValidateProviderHash: any;

    beforeEach(async () => {

      await claimVerifier.addWitness(witnessAddress);
      await claimVerifier.addProviderHash('0x94303faca9758e19301320d1cdfa5f0a180fc2fd15e4adcc31fee67ec6d4d8f3');

      subjectProof = {
        claimInfo: {
          provider: 'http',
          parameters: '{"method":"GET","responseMatches":[{"type":"regex","value":"(?<name>\\"firstName\\":\\"[^\\"]+\\")"}],"responseRedactions":[{"jsonPath":"$.firstName","xPath":""}],"url":"https://identity.ticketmaster.com/json/user?hard=false&doNotTrack=false"}',
          context: '{"extractedParameters":{"name":"\\"firstName\\":\\"Richard\\""},"providerHash":"0x94303faca9758e19301320d1cdfa5f0a180fc2fd15e4adcc31fee67ec6d4d8f3"}',
        },
        signedClaim: {
          claim: {
            identifier: '0xba88860afae18798a6af58b239628f9c4d9d61066533bebcbb29e8f5550e6f63',
            owner: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
            timestampS: '1719339653',
            epoch: '1'
          },
          signatures: ['0x95cdd30e518fc138c1f762b8ec4d33f9cc3048e315837774221ce14b98ccf3a54c0d489b64cef21d971d20eb84bf1f93c644eebc32cc22a2b5b2a6216dc2f6081c']
        }
      };
      subjectValidateProviderHash = true;
    });

    async function subject(): Promise<any> {
      await claimVerifier.verifyClaim(subjectProof, subjectValidateProviderHash);
    };

    it("should verify proof", async () => {
      await subject();
    });

    describe("when there are no signatures", () => {
      beforeEach(async () => {
        subjectProof.signedClaim.signatures = [];
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("No signatures");
      });
    });

    describe("when the ClaimInfo hash doesn't match", () => {
      beforeEach(async () => {
        subjectProof.signedClaim.claim.identifier = '0xba88860afae18798a6af58b239628f9c4d9d61066533bebcbb29e8f5550e6f64';   // last 3 replaced with 4
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("ClaimInfo hash doesn't match");
      });
    });

    describe("when the number of signatures is not equal to the number of witnesses", () => {
      beforeEach(async () => {
        await claimVerifier.addWitness(otherWitness.address);
        // Now we have two witnesses but only one signature
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Number of signatures not equal to number of witnesses");
      });
    });

    describe("when a signature is not from a witness", () => {
      beforeEach(async () => {
        const nonWitnessWallet = ethers.Wallet.createRandom();
        const message = "Hello Tickets";
        subjectProof.signedClaim.signatures[0] = await nonWitnessWallet.signMessage(message);
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Signature not appropriate");
      });
    });

    describe("when the provider hash is not valid", () => {
      beforeEach(async () => {
        // Add coingecko proof; Proof and signatures are valid but providerHash isn't added to ClaimVerifier contract
        subjectProof = {
          claimInfo: {
            provider: 'http',
            parameters: '{"method":"GET","responseMatches":[{"type":"regex","value":"\\\\{\\"ethereum\\":\\\\{\\"usd\\":(?<price>[\\\\d\\\\.]+)\\\\}\\\\}"}],"responseRedactions":[],"url":"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"}',
            context: '{"extractedParameters":{"price":"3430.47"},"providerHash":"0xf44817617d1dfa5219f6aaa0d4901f9b9b7a6845bbf7b639d9bffeacc934ff9a"}',
          },
          signedClaim: {
            claim: {
              identifier: '0xec2cec4bbe9d7d0d4d57e3e14cc7d271f2e67caca2d4df57f95d1817ea065770',
              owner: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
              timestampS: '1719563774',
              epoch: '1'
            },
            signatures: ['0x70f1f2f1d8ef125d443f373c497da71f81bfcd630d2bac27d11ce7ee6aa433f61bae575cc333bebf9af896da08543ecf9f3ea3b0c7855145161322c615fbf5bf1b']
          }
        };
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("No valid providerHash");
      });

      describe("when validate provider hash is false", async () => {
        beforeEach(async () => {
          subjectValidateProviderHash = false;
        });

        it("should verify without reverting", async () => {
          await subject();
        });
      });
    });
  });

  describe("#findSubstringIndex", async () => {
    let subjectData: string;
    let subjectTarget: string;

    beforeEach(async () => {
      subjectData = "{\"extractedParameters\":{\"id\":\"host-ticket/NCA/3-42317/1717663432000/ECM0703E/0x0E040001\",\"isTransferable\":\"true\",\"name\":\"Untitled Andrew Callaghan Film Screening and Moderated Q&A\",\"row\":\"G5\",\"seat\":\"15\",\"section\":\"GENADM\",\"source\":\"https://concerts.livenation.com/untitled-andrew-callaghan-film-screening-and-san-francisco-california-07-03-2024/event/1C006098CD584859\",\"startDate\":\"2024-07-04T02:00:00Z\",\"token\":\"f77b32c21ab393c7deeb7972738e9b07b8abbe21df166853ab2e427ca48f4e175c302a2fb32689c70702c802b298d6c85f17f84e893f513e5b0aa23ad8e0d10196bffe01ab41e7e47a242867c83b0da0dbbb2d9d22f01765a997a0fe5f5aa7ae\",\"venueName\":\"Cobb's Comedy Club\"},\"providerHash\":\"0x74c3e8282ddb6480afbb0c9d707e705fb280943952fb7245f9285fa72eb77c5e\"}";
      subjectTarget = 'event/'
    });

    async function subject(): Promise<any> {
      return await claimVerifier.findSubstringIndex(subjectData, subjectTarget);
    };

    it("should return the index the substring terminates at", async () => {
      const actualIndex = await subject();

      expect(actualIndex).to.equal(BigNumber.from(352));
    });

    describe("when no match is found", async () => {
      beforeEach(async () => {
        subjectTarget = "events/"
      });

      it("should return the last index in the data", async () => {
        const actualIndex = await subject();

        expect(actualIndex).to.equal(BigNumber.from(subjectData.length));
      });
    });

    describe("when the data is shorter than the target", async () => {
      beforeEach(async () => {
        subjectData = "hi";
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("target is longer than data");
      });
    });
  });

  describe("#extractFieldFromContext", async () => {
    let subjectData: string;
    let subjectTarget: string;

    beforeEach(async () => {
      const PROOF = {
        "provider": "http",
        "parameters": "{\"method\":\"GET\",\"paramValues\":{\"token\":\"f77b32c21ab393c7deeb7972738e9b07b8abbe21df166853ab2e427ca48f4e175c302a2fb32689c70702c802b298d6c85f17f84e893f513e5b0aa23ad8e0d10196bffe01ab41e7e47a242867c83b0da0dbbb2d9d22f01765a997a0fe5f5aa7ae\"},\"responseMatches\":[{\"type\":\"regex\",\"value\":\"\\\"id\\\":\\\"(?<id>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\"location\\\":\\\\{\\\"seat\\\":\\\"(?<seat>[^\\\"]+)\\\",\\\"row\\\":\\\"(?<row>[^\\\"]+)\\\",\\\"section\\\":\\\"(?<section>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\\{\\\"eligible\\\":(?<isTransferable>true),\\\"type\\\":\\\"TRANSFER\\\"\\\\}\"},{\"type\":\"regex\",\"value\":\"\\\"name\\\":\\\"(?<name>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\"startDate\\\":\\\"(?<startDate>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\"venue\\\":\\\\{\\\"id\\\":\\\"[^\\\"]+\\\",\\\"name\\\":\\\"(?<venueName>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\"viewEventDetails\\\":\\\\{\\\"source\\\":\\\"(?<source>[^\\\"]+)\\\"\"}],\"responseRedactions\":[{\"jsonPath\":\"$.items[0].tickets[0].id\",\"xPath\":\"\"},{\"jsonPath\":\"$.items[0].tickets[0].location\",\"xPath\":\"\"},{\"jsonPath\":\"$.items[0].tickets[0].eligibilities\",\"xPath\":\"\"},{\"jsonPath\":\"$.items[0].name\",\"xPath\":\"\"},{\"jsonPath\":\"$.items[0].dateRange.startDate\",\"xPath\":\"\"},{\"jsonPath\":\"$.items[0].venue\",\"xPath\":\"\"},{\"jsonPath\":\"$.items[0]._links.viewEventDetails\",\"xPath\":\"\"}],\"url\":\"https://my.ticketmaster.com/view-order/async/json/order/token/{{token}}\"}",
        "owner": "0xf9f25d1b846625674901ace47d6313d1ac795265",
        "timestampS": 1719940371,
        "context": "{\"extractedParameters\":{\"id\":\"host-ticket/NCA/3-42317/1717663432000/ECM0703E/0x0E040001\",\"isTransferable\":\"true\",\"name\":\"Untitled Andrew Callaghan Film Screening and Moderated Q&A\",\"row\":\"G5\",\"seat\":\"15\",\"section\":\"GENADM\",\"source\":\"https://concerts.livenation.com/untitled-andrew-callaghan-film-screening-and-san-francisco-california-07-03-2024/event/1C006098CD584859\",\"startDate\":\"2024-07-04T02:00:00Z\",\"token\":\"f77b32c21ab393c7deeb7972738e9b07b8abbe21df166853ab2e427ca48f4e175c302a2fb32689c70702c802b298d6c85f17f84e893f513e5b0aa23ad8e0d10196bffe01ab41e7e47a242867c83b0da0dbbb2d9d22f01765a997a0fe5f5aa7ae\",\"venueName\":\"Cobb's Comedy Club\"},\"providerHash\":\"0x74c3e8282ddb6480afbb0c9d707e705fb280943952fb7245f9285fa72eb77c5e\"}",
        "identifier": "0x762319e008a2f764181cda91ec7db06a5ef7fbb41f90f4327d5e9817ab6d6d18",
        "epoch": 1
      };
      const SIGNATURE = '0xa8a320e5459d62f34d17c5594b2bce0e679e7589916fdc1cc4e6085367b275e209f6d2ad4e1f3e2e5aebd94a3b9f8dc4046aa826e6a27536967203bff1f5986a1c'

      const proof = {
        claimInfo: {
          provider: PROOF.provider,
          parameters: PROOF.parameters,
          context: PROOF.context,
        },
        signedClaim: {
          claim: {
            identifier: PROOF.identifier,
            owner: PROOF.owner,
            timestampS: PROOF.timestampS,
            epoch: PROOF.epoch
          },
          signatures: [SIGNATURE]
        }
      };
      subjectData = proof.claimInfo.context;
      subjectTarget = '"venueName\":\"'
    });

    async function subject(): Promise<any> {
      return await claimVerifier.extractFieldFromContext(subjectData, subjectTarget);
    };

    it("should extract firstName from context", async () => {
      const extractedValue = await subject();

      expect(extractedValue).to.equal("Cobb's Comedy Club");
    });

    describe("when the resulting string is empty", async () => {
      beforeEach(async () => {
        subjectData = "{\"extractedParameters\":{\"id\":\"host-ticket/NCA/3-42317/1717663432000/ECM0703E/0x0E040001\",\"isTransferable\":\"true\",\"name\":\"Untitled Andrew Callaghan Film Screening and Moderated Q&A\",\"row\":\"G5\",\"seat\":\"15\",\"section\":\"GENADM\",\"source\":\"https://concerts.livenation.com/untitled-andrew-callaghan-film-screening-and-san-francisco-california-07-03-2024/event/1C006098CD584859\",\"startDate\":\"2024-07-04T02:00:00Z\",\"token\":\"f77b32c21ab393c7deeb7972738e9b07b8abbe21df166853ab2e427ca48f4e175c302a2fb32689c70702c802b298d6c85f17f84e893f513e5b0aa23ad8e0d10196bffe01ab41e7e47a242867c83b0da0dbbb2d9d22f01765a997a0fe5f5aa7ae\",\"venueName\":\"\"},\"providerHash\":\"0x74c3e8282ddb6480afbb0c9d707e705fb280943952fb7245f9285fa72eb77c5e\"}";
        subjectTarget = '"venueName\":\"';
      });

      it("should return an empty string", async () => {
        const extractedValue = await subject();

        expect(extractedValue).to.equal('');
      });
    });

    describe("when the target is not found in the context", async () => {
      beforeEach(async () => {
        subjectData = '{"someOtherField":"someValue"}';
        subjectTarget = '"firstName\\":\\"';
      });

      it("should return an empty string", async () => {
        const extractedValue = await subject();

        expect(extractedValue).to.equal('');
      });
    });
  });

  describe('#extractAllFromContext', async () => {
    let subjectData: string;
    let subjectMaxValues: BigNumber;
    let subjectExtractProviderHash: boolean;

    const PROOF = {
      "provider": "http",
      "parameters": "{\"method\":\"GET\",\"paramValues\":{\"token\":\"f77b32c21ab393c7deeb7972738e9b07b8abbe21df166853ab2e427ca48f4e175c302a2fb32689c70702c802b298d6c85f17f84e893f513e5b0aa23ad8e0d10196bffe01ab41e7e47a242867c83b0da0dbbb2d9d22f01765a997a0fe5f5aa7ae\"},\"responseMatches\":[{\"type\":\"regex\",\"value\":\"\\\"id\\\":\\\"(?<id>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\"location\\\":\\\\{\\\"seat\\\":\\\"(?<seat>[^\\\"]+)\\\",\\\"row\\\":\\\"(?<row>[^\\\"]+)\\\",\\\"section\\\":\\\"(?<section>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\\{\\\"eligible\\\":(?<isTransferable>true),\\\"type\\\":\\\"TRANSFER\\\"\\\\}\"},{\"type\":\"regex\",\"value\":\"\\\"name\\\":\\\"(?<name>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\"startDate\\\":\\\"(?<startDate>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\"venue\\\":\\\\{\\\"id\\\":\\\"[^\\\"]+\\\",\\\"name\\\":\\\"(?<venueName>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\"viewEventDetails\\\":\\\\{\\\"source\\\":\\\"(?<source>[^\\\"]+)\\\"\"}],\"responseRedactions\":[{\"jsonPath\":\"$.items[0].tickets[0].id\",\"xPath\":\"\"},{\"jsonPath\":\"$.items[0].tickets[0].location\",\"xPath\":\"\"},{\"jsonPath\":\"$.items[0].tickets[0].eligibilities\",\"xPath\":\"\"},{\"jsonPath\":\"$.items[0].name\",\"xPath\":\"\"},{\"jsonPath\":\"$.items[0].dateRange.startDate\",\"xPath\":\"\"},{\"jsonPath\":\"$.items[0].venue\",\"xPath\":\"\"},{\"jsonPath\":\"$.items[0]._links.viewEventDetails\",\"xPath\":\"\"}],\"url\":\"https://my.ticketmaster.com/view-order/async/json/order/token/{{token}}\"}",
      "owner": "0xf9f25d1b846625674901ace47d6313d1ac795265",
      "timestampS": 1719940371,
      "context": "{\"extractedParameters\":{\"id\":\"host-ticket/NCA/3-42317/1717663432000/ECM0703E/0x0E040001\",\"isTransferable\":\"true\",\"name\":\"Untitled Andrew Callaghan Film Screening and Moderated Q&A\",\"row\":\"G5\",\"seat\":\"15\",\"section\":\"GENADM\",\"source\":\"https://concerts.livenation.com/untitled-andrew-callaghan-film-screening-and-san-francisco-california-07-03-2024/event/1C006098CD584859\",\"startDate\":\"2024-07-04T02:00:00Z\",\"token\":\"f77b32c21ab393c7deeb7972738e9b07b8abbe21df166853ab2e427ca48f4e175c302a2fb32689c70702c802b298d6c85f17f84e893f513e5b0aa23ad8e0d10196bffe01ab41e7e47a242867c83b0da0dbbb2d9d22f01765a997a0fe5f5aa7ae\",\"venueName\":\"Cobb's Comedy Club\"},\"providerHash\":\"0x74c3e8282ddb6480afbb0c9d707e705fb280943952fb7245f9285fa72eb77c5e\"}",
      "identifier": "0x762319e008a2f764181cda91ec7db06a5ef7fbb41f90f4327d5e9817ab6d6d18",
      "epoch": 1
    };
    const SIGNATURE = '0xa8a320e5459d62f34d17c5594b2bce0e679e7589916fdc1cc4e6085367b275e209f6d2ad4e1f3e2e5aebd94a3b9f8dc4046aa826e6a27536967203bff1f5986a1c'

    beforeEach(async () => {
      const proof = {
        claimInfo: {
          provider: PROOF.provider,
          parameters: PROOF.parameters,
          context: PROOF.context,
        },
        signedClaim: {
          claim: {
            identifier: PROOF.identifier,
            owner: PROOF.owner,
            timestampS: PROOF.timestampS,
            epoch: PROOF.epoch
          },
          signatures: [SIGNATURE]
        }
      };
      subjectData = proof.claimInfo.context;
      subjectMaxValues = BigNumber.from(10);
      subjectExtractProviderHash = false;
    });

    async function subject(): Promise<any> {
      return await claimVerifier.extractAllFromContext(subjectData, subjectMaxValues, subjectExtractProviderHash);
    }

    it("should extract all values from context", async () => {
      const values = await subject();

      const expectedValues = [
        "host-ticket/NCA/3-42317/1717663432000/ECM0703E/0x0E040001",
        "true",
        "Untitled Andrew Callaghan Film Screening and Moderated Q&A",
        "G5",
        "15",
        "GENADM",
        "https://concerts.livenation.com/untitled-andrew-callaghan-film-screening-and-san-francisco-california-07-03-2024/event/1C006098CD584859",
        "2024-07-04T02:00:00Z",
        "f77b32c21ab393c7deeb7972738e9b07b8abbe21df166853ab2e427ca48f4e175c302a2fb32689c70702c802b298d6c85f17f84e893f513e5b0aa23ad8e0d10196bffe01ab41e7e47a242867c83b0da0dbbb2d9d22f01765a997a0fe5f5aa7ae",
        "Cobb's Comedy Club"
      ];

      expect(values.length).to.equal(expectedValues.length);

      for (let i = 0; i < values.length; i++) {
        expect(values[i]).to.equal(expectedValues[i]);
      }
    });

    describe("when extract provider hash is true", async () => {
      beforeEach(async () => {
        subjectExtractProviderHash = true;
      });

      it("should return provider Hash", async () => {
        const values = await subject();

        const expectedProviderHash = "0x74c3e8282ddb6480afbb0c9d707e705fb280943952fb7245f9285fa72eb77c5e";
        expect(values[values.length - 1]).to.equal(expectedProviderHash);
      });

      describe("provider hash is missing", async () => {
        beforeEach(async () => {
          subjectData = '{"extractedParameters":{"key1":"value1","key2":"value2"},\"otherHash\":\"0x1234\"}';
        });

        it("should revert with 'Extraction failed. Malformed data'", async () => {
          await expect(subject()).to.be.revertedWith("Extraction failed. Malformed providerHash");
        });
      });
    });

    describe("when maxValues is less than the actual number of values", async () => {
      beforeEach(async () => {
        subjectMaxValues = BigNumber.from(5);
      });

      it("should revert with 'Extraction failed; exceeded max values'", async () => {
        await expect(subject()).to.be.revertedWith("Extraction failed. Exceeded max values");
      });
    });

    describe("when the context data is malformed", async () => {
      beforeEach(async () => {
        subjectData = '{"extractedParameters":{"key1":value1","key2":"value2"},\"providerHash\":\"0x1234\"}';
      });

      it("should revert with 'Extraction failed'", async () => {
        await expect(subject()).to.be.revertedWith("Extraction failed. Malformed data");
      });
    });

    describe("when the context data is malformed", async () => {
      beforeEach(async () => {
        subjectData = '{"extractedParameters":{"key1":"value1""key2":"value2"},\"providerHash\":\"0x1234\"}';
      });

      it("should revert with 'Extraction failed'", async () => {
        await expect(subject()).to.be.revertedWith("Extraction failed. Malformed data");
      });
    });

    describe("when the context data doesn't start with '{\"extractedParameters\":{\"'", async () => {
      beforeEach(async () => {
        subjectData = '{"wrongStart":{"key1":"value1","key2":"value2"},\"providerHash\":\"0x1234\"}';
      });

      it("should revert with 'Extraction failed. Malformed data", async () => {
        await expect(subject()).to.be.revertedWith("Extraction failed. Malformed extractedParameters");
      });
    });

    describe("when a value contains escaped quotes", async () => {
      beforeEach(async () => {
        subjectData = '{"extractedParameters":{"key1":"value with \\"quotes\\"","key2":"normal value"},\"providerHash\":\"0x1234\"}';
      });

      it("should correctly extract the value with escaped quotes", async () => {
        const values = await subject();
        expect(values[0]).to.equal('value with \\"quotes\\"');
      });
    });
  });
});
