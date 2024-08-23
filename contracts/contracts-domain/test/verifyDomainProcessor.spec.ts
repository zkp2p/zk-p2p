import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { Account } from "@utils/test/types";

import {
  getWaffleExpect,
  getAccounts
} from "@utils/test/index";

import DeployHelper from "@utils/deploys";
import { ReclaimProof } from "@utils/types";
import { createSignDataForClaim, getIdentifierFromClaimInfo } from "@utils/reclaimUtils";
import { IVerifyDomainProcessor, NullifierRegistry, VerifyDomainProcessor } from "@utils/contracts";
import { ZERO_BYTES32 } from "@utils/constants";
import { convertToUnixTimestamp } from "@utils/protocolUtils";

const expect = getWaffleExpect();

const abiCoder = new ethers.utils.AbiCoder();

// Proof for groth16.xyz
const GROTH16_XYZ_PROOF = {
  provider: "http",
  parameters: "{\"body\":\"{\\\"gridPageRequestViewModel\\\":{PageSize: 2000,Page: 1}}\",\"headers\":{\"User-Agent\":\"reclaim/0.0.1\",\"X-Ncpl-Rcsrf\":\"1a57e31ce38d4e0fac382664ba4f22f7\"},\"method\":\"POST\",\"responseMatches\":[{\"type\":\"regex\",\"value\":\"\\\"DomainName\\\":\\\"(?<domainName>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\"ExpireDateTime\\\":\\\"(?<expireDateTime>[^\\\"]+)\\\"\"}],\"responseRedactions\":[{\"jsonPath\":\"$.Data[5].DomainName\",\"xPath\":\"\"},{\"jsonPath\":\"$.Data[5].ExpireDateTime\",\"xPath\":\"\"}],\"url\":\"https://ap.www.namecheap.com/api/v1/ncpl/gatewaydomainlist/getdomainsonly\"}",
  owner: "0xf9f25d1b846625674901ace47d6313d1ac795265",
  timestampS: 1722414784,
  context: "{\"extractedParameters\":{\"domainName\":\"groth16.xyz\",\"expireDateTime\":\"2025-07-08T18:22:42.0000000\"},\"providerHash\":\"0x4a266fd63f550db6b79172325f33419df6d5d87bf924b175d8b1817f010a21cf\"}",
  identifier: "0x84e953b8936bfa684065e4c3086d77557ff67923ee2373bff8e56244c47a6f77",
  epoch: 1,
  signature: { "0": 105, "1": 246, "2": 126, "3": 210, "4": 179, "5": 196, "6": 251, "7": 37, "8": 226, "9": 2, "10": 106, "11": 131, "12": 60, "13": 150, "14": 163, "15": 252, "16": 114, "17": 16, "18": 41, "19": 46, "20": 138, "21": 218, "22": 12, "23": 64, "24": 7, "25": 175, "26": 198, "27": 215, "28": 192, "29": 78, "30": 238, "31": 89, "32": 6, "33": 190, "34": 36, "35": 86, "36": 164, "37": 137, "38": 213, "39": 132, "40": 137, "41": 82, "42": 47, "43": 178, "44": 62, "45": 248, "46": 25, "47": 192, "48": 179, "49": 248, "50": 149, "51": 134, "52": 189, "53": 29, "54": 254, "55": 40, "56": 146, "57": 254, "58": 144, "59": 35, "60": 81, "61": 10, "62": 53, "63": 187, "64": 28 }
}

// Proof for 0xsachink.xyz
const SACHINK_XYZ_PROOF = {
  provider: "http",
  parameters: "{\"body\":\"{\\\"gridPageRequestViewModel\\\":{PageSize: 2000,Page: 1}}\",\"headers\":{\"User-Agent\":\"reclaim/0.0.1\",\"X-Ncpl-Rcsrf\":\"1a57e31ce38d4e0fac382664ba4f22f7\"},\"method\":\"POST\",\"responseMatches\":[{\"type\":\"regex\",\"value\":\"\\\"DomainName\\\":\\\"(?<domainName>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\"ExpireDateTime\\\":\\\"(?<expireDateTime>[^\\\"]+)\\\"\"}],\"responseRedactions\":[{\"jsonPath\":\"$.Data[0].DomainName\",\"xPath\":\"\"},{\"jsonPath\":\"$.Data[0].ExpireDateTime\",\"xPath\":\"\"}],\"url\":\"https://ap.www.namecheap.com/api/v1/ncpl/gatewaydomainlist/getdomainsonly\"}",
  owner: "0xf9f25d1b846625674901ace47d6313d1ac795265",
  timestampS: 1722414783,
  context: "{\"extractedParameters\":{\"domainName\":\"0xsachink.xyz\",\"expireDateTime\":\"2025-07-08T07:01:53.0000000\"},\"providerHash\":\"0xfd4622039be3e4286dd3285d36d772a71d580a9afa0a1718a7e643539c952cf9\"}",
  identifier: "0x78249baa65445ef6b8c184afb8b065669b4a9207d6c5990cae337490491e3e3f",
  epoch: 1,
  signature: { "0": 169, "1": 191, "2": 32, "3": 3, "4": 165, "5": 249, "6": 59, "7": 183, "8": 234, "9": 61, "10": 17, "11": 9, "12": 79, "13": 166, "14": 219, "15": 58, "16": 202, "17": 166, "18": 83, "19": 45, "20": 53, "21": 108, "22": 28, "23": 132, "24": 53, "25": 236, "26": 170, "27": 9, "28": 123, "29": 26, "30": 44, "31": 228, "32": 120, "33": 253, "34": 7, "35": 86, "36": 83, "37": 56, "38": 90, "39": 213, "40": 75, "41": 55, "42": 126, "43": 239, "44": 129, "45": 6, "46": 252, "47": 251, "48": 180, "49": 91, "50": 154, "51": 152, "52": 77, "53": 154, "54": 139, "55": 144, "56": 20, "57": 63, "58": 17, "59": 56, "60": 220, "61": 201, "62": 142, "63": 194, "64": 27 }
}

describe("VerifyDomainProcessor", () => {
  let owner: Account;
  let witness: Account;
  let registry: Account;
  let providerHash: string;

  let deployer: DeployHelper;

  let verifyDomainProcessor: VerifyDomainProcessor;
  let nullifierRegistry: NullifierRegistry;

  beforeEach(async () => {
    [
      witness,    // hardhat 0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      owner,
      registry
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);
    providerHash = '0x4a266fd63f550db6b79172325f33419df6d5d87bf924b175d8b1817f010a21cf';

    nullifierRegistry = await deployer.deployNullifierRegistry();
    const claimVerifier = await deployer.deployClaimVerifier();
    verifyDomainProcessor = await deployer.deployVerifyDomainProcessor(
      registry.address,
      nullifierRegistry.address,
      [providerHash],
      "contracts/external/ClaimVerifier.sol:ClaimVerifier",
      claimVerifier.address
    );

    await verifyDomainProcessor.transferOwnership(owner.address);
    await verifyDomainProcessor.addWitness(witness.address);
    await nullifierRegistry.addWritePermission(verifyDomainProcessor.address);
  });

  function convertSignatureToHex(signature: { [key: string]: number }): string {
    const byteArray = Object.values(signature);
    return '0x' + Buffer.from(byteArray).toString('hex');
  }

  describe("#verifyProofs", async () => {
    let subjectProof: ReclaimProof[];
    let subjectCaller: Account;

    beforeEach(async () => {
      subjectProof = [
        {
          claimInfo: {
            provider: GROTH16_XYZ_PROOF.provider,
            parameters: GROTH16_XYZ_PROOF.parameters,
            context: GROTH16_XYZ_PROOF.context
          },
          signedClaim: {
            claim: {
              identifier: GROTH16_XYZ_PROOF.identifier,
              owner: GROTH16_XYZ_PROOF.owner,
              timestampS: BigNumber.from(GROTH16_XYZ_PROOF.timestampS),
              epoch: BigNumber.from(GROTH16_XYZ_PROOF.epoch)
            },
            signatures: [convertSignatureToHex(GROTH16_XYZ_PROOF.signature)]
          }
        }
      ];
      subjectCaller = registry;
    });

    async function subject(): Promise<any> {
      return await verifyDomainProcessor.connect(subjectCaller.wallet).verifyProofs(subjectProof);
    };

    async function subjectCall(): Promise<IVerifyDomainProcessor.DomainRawStructOutput[]> {
      return await verifyDomainProcessor.connect(subjectCaller.wallet).callStatic.verifyProofs(subjectProof);
    };

    it("should properly nullify the proof", async () => {
      await subject();

      const nullifier = ethers.utils.keccak256(abiCoder.encode(["bytes[]"], [subjectProof[0].signedClaim.signatures]));
      const isNullified = await nullifierRegistry.isNullified(nullifier);

      expect(isNullified).to.be.true;
    });

    it("should return correct domain value", async () => {
      const domains = await subjectCall();

      expect(domains[0].name).to.equal('groth16.xyz');

      const expectedExpiryTimestamp = convertToUnixTimestamp("2025-07-08T18:22:00.0000000");    // seconds zeroed out 
      expect(domains[0].expiryTime).to.equal(expectedExpiryTimestamp);
    });

    describe("when multiple domains are correctly verified", async () => {
      beforeEach(async () => {
        await verifyDomainProcessor.addProviderHash("0xfd4622039be3e4286dd3285d36d772a71d580a9afa0a1718a7e643539c952cf9");

        subjectProof.push(
          {
            claimInfo: {
              provider: SACHINK_XYZ_PROOF.provider,
              parameters: SACHINK_XYZ_PROOF.parameters,
              context: SACHINK_XYZ_PROOF.context
            },
            signedClaim: {
              claim: {
                identifier: SACHINK_XYZ_PROOF.identifier,
                owner: SACHINK_XYZ_PROOF.owner,
                timestampS: BigNumber.from(SACHINK_XYZ_PROOF.timestampS),
                epoch: BigNumber.from(SACHINK_XYZ_PROOF.epoch)
              },
              signatures: [convertSignatureToHex(SACHINK_XYZ_PROOF.signature)]
            }
          }
        );
      });

      it("should return the correct info", async () => {
        const domains = await subjectCall();

        const expectedExpiryTimestamp = convertToUnixTimestamp("2025-07-08T07:01:00.0000000");    // seconds zeroed out

        expect(domains[1].name).to.equal('0xsachink.xyz');
        expect(domains[1].expiryTime).to.equal(expectedExpiryTimestamp);
      });
    });

    describe("when the proof has already been verified", async () => {
      beforeEach(async () => {
        await subject();
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Nullifier has already been used");
      });
    });

    describe("when the provider hash is invalid", async () => {
      beforeEach(async () => {
        subjectProof[0].claimInfo.context = '{"extractedParameters":{"domainName":"groth16.xyz","expireDateTime":"2025-07-08T18:22:42.0000000","isOwner":"true","statusTypeString":"Active"},"providerHash":"0x6978e71086556e704f997883fb1b64ea5e72328a74de837e4d1c7e2261c62e6j"}';   // replace last e with j 
        subjectProof[0].signedClaim.claim.identifier = getIdentifierFromClaimInfo(subjectProof[0].claimInfo);

        const digest = createSignDataForClaim(subjectProof[0].signedClaim.claim);
        subjectProof[0].signedClaim.signatures = [await witness.wallet.signMessage(digest)];
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("No valid providerHash");
      });
    });

    describe("when the proof is invalid", async () => {
      beforeEach(async () => {
        subjectProof[0].signedClaim.claim.identifier = ZERO_BYTES32;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.reverted;
      });
    });

    describe("when the caller is not the registry", async () => {
      beforeEach(async () => {
        subjectCaller = owner;
      });

      it("should revert", async () => {
        await expect(subject()).to.be.revertedWith("Only registry can call");
      });
    });
  });
});
