// import "module-alias/register";

// import { ethers } from "hardhat";
// import { BigNumber } from "ethers";

// import { Account } from "@utils/test/types";
// import { NullifierRegistry, VenmoSendProcessorV3 } from "@utils/contracts";
// import DeployHelper from "@utils/deploys";
// import { Address, GrothProof, ReclaimProof } from "@utils/types";
// import { getIdentifierFromClaimInfo, createSignDataForClaim } from "@utils/reclaimUtils";


// import {
//   getWaffleExpect,
//   getAccounts
// } from "@utils/test/index";
// import { usdc } from "@utils/common";
// import { ZERO_BYTES32 } from "@utils/constants";

// const expect = getWaffleExpect();

// const venmoSendProof = {
//   provider: "http",
//   parameters: "{\"body\":\"\",\"method\":\"GET\",\"paramValues\":{\"senderId\":\"1168869611798528966\"},\"responseMatches\":[{\"type\":\"regex\",\"value\":\"\\\"amount\\\":\\\"- \\\\$(?<amount>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\"date\\\":\\\"(?<date>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\"receiver\\\":\\\\{\\\"id\\\":\\\"(?<receiverId>[^\\\"]+)\\\"\"},{\"type\":\"regex\",\"value\":\"\\\"paymentId\\\":\\\"(?<paymentId>[^\\\"]+)\\\"\"}],\"responseRedactions\":[{\"jsonPath\":\"$.stories[4].amount\",\"xPath\":\"\"},{\"jsonPath\":\"$.stories[4].date\",\"xPath\":\"\"},{\"jsonPath\":\"$.stories[4].title.receiver\",\"xPath\":\"\"},{\"jsonPath\":\"$.stories[4].paymentId\",\"xPath\":\"\"}],\"url\":\"https://account.venmo.com/api/stories?feedType=me&externalId={{senderId}}\"}",
//   owner: "0xf9f25d1b846625674901ace47d6313d1ac795265",
//   timestampS: 1732610449,
//   context: "{\"extractedParameters\":{\"amount\":\"42.00\",\"date\":\"2024-10-27T18:16:11\",\"paymentId\":\"4188305907305244155\",\"receiverId\":\"1662743480369152806\",\"senderId\":\"1168869611798528966\"},\"providerHash\":\"0xbb95cb89b54cf99ced3ef15add83c0e8754cf4f28722be0a6721346b7c4f1d96\"}",
//   identifier: "0x7a2c9c3f4f3bce6339edbd277ccfd2f918fec3144e0f077be4516e7f3ded9798",
//   epoch: 1,
//   signature: { "0": 190, "1": 60, "2": 23, "3": 45, "4": 142, "5": 30, "6": 77, "7": 161, "8": 86, "9": 235, "10": 54, "11": 4, "12": 70, "13": 51, "14": 249, "15": 42, "16": 106, "17": 99, "18": 6, "19": 96, "20": 85, "21": 150, "22": 150, "23": 250, "24": 187, "25": 94, "26": 39, "27": 81, "28": 146, "29": 23, "30": 191, "31": 95, "32": 114, "33": 22, "34": 41, "35": 124, "36": 78, "37": 80, "38": 28, "39": 62, "40": 226, "41": 241, "42": 98, "43": 39, "44": 130, "45": 142, "46": 121, "47": 164, "48": 110, "49": 190, "50": 101, "51": 18, "52": 104, "53": 32, "54": 114, "55": 14, "56": 18, "57": 77, "58": 146, "59": 107, "60": 107, "61": 47, "62": 85, "63": 221, "64": 28 }, "resultSignature": { "0": 126, "1": 94, "2": 103, "3": 191, "4": 63, "5": 249, "6": 79, "7": 234, "8": 249, "9": 133, "10": 202, "11": 134, "12": 72, "13": 49, "14": 164, "15": 134, "16": 252, "17": 26, "18": 222, "19": 203, "20": 245, "21": 142, "22": 142, "23": 6, "24": 142, "25": 100, "26": 190, "27": 78, "28": 135, "29": 237, "30": 56, "31": 101, "32": 59, "33": 181, "34": 252, "35": 175, "36": 27, "37": 182, "38": 204, "39": 0, "40": 246, "41": 39, "42": 54, "43": 35, "44": 115, "45": 60, "46": 22, "47": 157, "48": 179, "49": 160, "50": 209, "51": 220, "52": 70, "53": 171, "54": 160, "55": 215, "56": 13, "57": 43, "58": 227, "59": 221, "60": 60, "61": 172, "62": 106, "63": 38, "64": 27 }
// }

// describe.only("VenmoSendProcessorV3", () => {
//   let owner: Account;
//   let attacker: Account;
//   let ramp: Account;
//   let providerHash: string;
//   let witnessAddress: Address;

//   let nullifierRegistry: NullifierRegistry;
//   let sendProcessor: VenmoSendProcessorV3;

//   let deployer: DeployHelper;

//   beforeEach(async () => {
//     [
//       owner,
//       attacker,
//       ramp
//     ] = await getAccounts();

//     deployer = new DeployHelper(owner.wallet);
//     witnessAddress = "0x0636c417755e3ae25c6c166d181c0607f4c572a3";
//     providerHash = "0xbb95cb89b54cf99ced3ef15add83c0e8754cf4f28722be0a6721346b7c4f1d96";

//     nullifierRegistry = await deployer.deployNullifierRegistry();
//     const claimVerifier = await deployer.deployClaimVerifier();
//     sendProcessor = await deployer.deployVenmoSendProcessorV3(
//       ramp.address,
//       nullifierRegistry.address,
//       [providerHash],
//       "contracts/lib/ClaimVerifier.sol:ClaimVerifier",
//       claimVerifier.address
//     );

//     await sendProcessor.addWitness(witnessAddress);
//     await nullifierRegistry.connect(owner.wallet).addWritePermission(sendProcessor.address);
//   });

//   describe("#constructor", async () => {
//     it("should set the correct state", async () => {
//       const rampAddress = await sendProcessor.ramp();

//       expect(rampAddress).to.eq(ramp.address);
//     });
//   });

//   function convertSignatureToHex(signature: { [key: string]: number }): string {
//     const byteArray = Object.values(signature);
//     return '0x' + Buffer.from(byteArray).toString('hex');
//   }

//   describe("#processProof", async () => {
//     let subjectProof: ReclaimProof;
//     let subjectCaller: Account;

//     beforeEach(async () => {
//       subjectProof = {
//         claimInfo: {
//           provider: venmoSendProof.provider,
//           parameters: venmoSendProof.parameters,
//           context: venmoSendProof.context
//         },
//         signedClaim: {
//           claim: {
//             identifier: venmoSendProof.identifier,
//             owner: venmoSendProof.owner,
//             timestampS: BigNumber.from(venmoSendProof.timestampS),
//             epoch: BigNumber.from(venmoSendProof.epoch)
//           },
//           signatures: [convertSignatureToHex(venmoSendProof.signature)]
//         }
//       };

//       subjectCaller = ramp;
//     });

//     async function subject(): Promise<any> {
//       return await sendProcessor.connect(subjectCaller.wallet).processProof(subjectProof);
//     }

//     async function subjectCallStatic(): Promise<any> {
//       return await sendProcessor.connect(subjectCaller.wallet).callStatic.processProof(subjectProof);
//     }

//     it("should process the proof", async () => {
//       const {
//         amount,
//         timestamp,
//         offRamperIdHash,
//         onRamperIdHash,
//         intentHash
//       } = await subjectCallStatic();

//       // convert to unix timestamp and add 30s buffer
//       const expectedTimestamp = Math.floor(new Date("2024-10-27T18:16:11Z").getTime() / 1000) + 30;
//       const expectedOffRamperIdHash = ethers.utils.keccak256(ethers.utils.solidityPack(['string'], ['1662743480369152806']));
//       const expectedOnRamperIdHash = ethers.utils.keccak256(ethers.utils.solidityPack(['string'], ['1168869611798528966']));

//       expect(amount).to.eq(usdc(42));
//       expect(timestamp).to.eq(BigNumber.from(expectedTimestamp));
//       expect(offRamperIdHash).to.eq(expectedOffRamperIdHash);
//       expect(onRamperIdHash).to.eq(expectedOnRamperIdHash);
//       expect(intentHash).to.eq(ZERO_BYTES32);
//     });

//     it("should nullify the payment id", async () => {
//       await subject();

//       const nullifier = ethers.utils.keccak256(ethers.utils.solidityPack(['string'], ['4188305907305244155']));
//       const isNullified = await nullifierRegistry.isNullified(nullifier);

//       expect(isNullified).to.be.true;
//     });

//     describe("when the proof is invalid", async () => {
//       beforeEach(async () => {
//         subjectProof.signedClaim.claim.identifier = ZERO_BYTES32;
//       });

//       it("should revert", async () => {
//         await expect(subject()).to.be.reverted;
//       });
//     });

//     describe("when the proof has already been verified", async () => {
//       beforeEach(async () => {
//         await subject();
//       });

//       it("should revert", async () => {
//         await expect(subject()).to.be.revertedWith("Nullifier has already been used");
//       });
//     });

//     describe("when the provider hash is invalid", async () => {
//       beforeEach(async () => {
//         subjectProof.claimInfo.context = "{\"extractedParameters\":{\"amount\":\"42.00\",\"date\":\"2024-10-27T18:16:11\",\"paymentId\":\"4188305907305244155\",\"receiverId\":\"1662743480369152806\",\"senderId\":\"1168869611798528966\"},\"providerHash\":\"0xbb95cb89b54cf99ced3ef15add83c0e8754cf4f28722be0a6721346b7c4f1d97\"}";// replace last 6 with 7
//         subjectProof.signedClaim.claim.identifier = getIdentifierFromClaimInfo(subjectProof.claimInfo);

//         const digest = createSignDataForClaim(subjectProof.signedClaim.claim);

//         const witness = ethers.Wallet.createRandom();
//         await sendProcessor.addWitness(witness.address);
//         await sendProcessor.removeWitness(witnessAddress);

//         subjectProof.signedClaim.signatures = [await witness.signMessage(digest)];
//       });

//       it("should revert", async () => {
//         await expect(subject()).to.be.revertedWith("No valid providerHash");
//       });
//     });

//     describe("when the caller is not the ramp", async () => {
//       beforeEach(async () => {
//         subjectCaller = owner;
//       });

//       it("should revert", async () => {
//         await expect(subject()).to.be.revertedWith("Only ramp can call");
//       });
//     });
//   });

//   describe("#setTimestampBuffer", async () => {
//     let subjectTimestampBuffer: BigNumber;
//     let subjectCaller: Account;

//     beforeEach(async () => {
//       subjectCaller = owner;

//       subjectTimestampBuffer = BigNumber.from(60);
//     });

//     async function subject(): Promise<any> {
//       return await sendProcessor.connect(subjectCaller.wallet).setTimestampBuffer(subjectTimestampBuffer);
//     }

//     it("should set the timestamp buffer", async () => {
//       await subject();

//       const timestampBuffer = await sendProcessor.timestampBuffer();

//       expect(subjectTimestampBuffer).to.deep.equal(timestampBuffer);
//     });

//     describe("when the caller is not the owner", async () => {
//       beforeEach(async () => {
//         subjectCaller = attacker;
//       });

//       it("should revert", async () => {
//         await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
//       });
//     });
//   });
// });
