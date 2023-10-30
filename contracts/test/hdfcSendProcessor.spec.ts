import "module-alias/register";

import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { Account } from "@utils/test/types";
import { HdfcSendProcessor, ManagedKeyHashAdapter, NullifierRegistry } from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import { Address, GrothProof } from "@utils/types";

import {
    getWaffleExpect,
    getAccounts
} from "@utils/test/index";
import { usdc } from "@utils/common";
import { ZERO_BYTES32 } from "@utils/constants";

const expect = getWaffleExpect();

const rawSignals = ["0x06b0ad846d386f60e777f1d11b82922c6bb694216eed9c23535796ac404a7dfa", "0x0000000000000000000000000000000000000000000000000040737472656c61", "0x000000000000000000000000000000000000000000000000006e616263666468", "0x00000000000000000000000000000000000000000000000000000074656e2e6b", "0x0000000000000000000000000000000000000000000000000000000030302e35", "0x0000000000000000000000000000000000000000000000000000000000000000", "0x000000000000000000000000000000000000000000000000003431202c746153", "0x0000000000000000000000000000000000000000000000000030322074634f20", "0x00000000000000000000000000000000000000000000000000303a3232203332", "0x00000000000000000000000000000000000000000000000000302b2032313a39", "0x0000000000000000000000000000000000000000000000000000000000303335", "0x289f0a06c13a6da467525afd78bfb1726b96c2023a4b898ba86c8f30484d7e57", "0x2b5519ec51a6b47e46530ab0a44bb7a034ad9a72083de9de43715132fb6fe573", "0x0000000000000000000000000000000000000000000000000000000000003039"];

describe("HdfcSendProcessor", () => {
    let owner: Account;
    let attacker: Account;
    let ramp: Account;

    let keyHashAdapter: ManagedKeyHashAdapter;
    let nullifierRegistry: NullifierRegistry;
    let sendProcessor: HdfcSendProcessor;

    let deployer: DeployHelper;

    beforeEach(async () => {
        [
            owner,
            attacker,
            ramp
        ] = await getAccounts();

        deployer = new DeployHelper(owner.wallet);

        keyHashAdapter = await deployer.deployManagedKeyHashAdapter(rawSignals[0]);
        nullifierRegistry = await deployer.deployNullifierRegistry();
        sendProcessor = await deployer.deployHdfcSendProcessor(
            ramp.address,
            keyHashAdapter.address,
            nullifierRegistry.address,
            "alerts@hdfcbank.net".padEnd(21, "\0")
        );

        await nullifierRegistry.connect(owner.wallet).addWritePermission(sendProcessor.address);
    });

    describe("#constructor", async () => {
        it("should set the correct state", async () => {
            const rampAddress = await sendProcessor.ramp();
            const hdfcKeyHashAdapter = await sendProcessor.mailserverKeyHashAdapter();
            const emailFromAddress = await sendProcessor.getEmailFromAddress();

            expect(rampAddress).to.eq(ramp.address);
            expect(hdfcKeyHashAdapter).to.deep.equal(keyHashAdapter.address);
            expect(ethers.utils.toUtf8Bytes("alerts@hdfcbank.net".padEnd(21, "\0"))).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
        });
    });

    describe("#processProof", async () => {
        let subjectProof: GrothProof;
        let subjectCaller: Account;

        beforeEach(async () => {
            const a: [BigNumber, BigNumber] = [BigNumber.from("0x1ab617e37b94873915b5e17009a0125ff0bf26913c2cb4458af96166b279825d"), BigNumber.from("0x0b6257d246ce56950e089fafc9a7ed9cc424fd4e6115eea15661810bc2d58a50")]
            const b: [[BigNumber, BigNumber], [BigNumber, BigNumber]] = [
                [BigNumber.from("0x1a8cb4d5f0d56ab5c23b3dc05e353f692279d88a2addf55e525e72624cbe7761"), BigNumber.from("0x2105882db5add946c9c605690299fbd08a8178fd1f498ab63dc9c84b97727d30")],
                [BigNumber.from("0x2aad5121a2339993207a006e9e1712950b0a398e0add423f38ce03005592e1d6"), BigNumber.from("0x00a716bf856ea7e203a1f56fa1008fd36f1fdf9397d0a53d2165ec2d0b31143d")]
            ];
            const c: [BigNumber, BigNumber] = [BigNumber.from("0x2ba91eec72967fecc112e5ddf588a692bfd81d9ee6d02c043069b46757de7150"), BigNumber.from("0x229c5bbf5d9b67ff41d419bbbd372a6971d5a778218bd74ebb7c61f432978d4f")];
            const signals: BigNumber[] = rawSignals.map((signal) => BigNumber.from(signal));

            subjectProof = {
                a,
                b,
                c,
                signals
            };

            subjectCaller = ramp;
        });

        async function subject(): Promise<any> {
            return await sendProcessor.connect(subjectCaller.wallet).processProof(subjectProof);
        }

        async function subjectCallStatic(): Promise<any> {
            return await sendProcessor.connect(subjectCaller.wallet).callStatic.processProof(subjectProof);
        }

        it("should process the proof", async () => {
            const {
                amount,
                date,
                offRamperIdHash,
                intentHash
            } = await subjectCallStatic();

            expect(amount).to.eq(usdc(5));
            // expect(date).to.eq(BigNumber.from(1683673439));  // skip checking date for now
            expect(offRamperIdHash).to.eq(rawSignals[11]);
            expect(intentHash).to.eq("0x0000000000000000000000000000000000000000000000000000000000003039");
        });

        it("should add the email to the nullifier mapping", async () => {
            await subject();

            const isNullified = await nullifierRegistry.isNullified(subjectProof.signals[12].toHexString());

            expect(isNullified).to.be.true;
        });

        describe("when the proof is invalid", async () => {
            beforeEach(async () => {
                subjectProof.signals[0] = BigNumber.from("0x0000000000000000000000000000000000000000000000000076406f6d6e6476");
            });

            it("should revert", async () => {
                await expect(subject()).to.be.revertedWith("Invalid Proof");
            });
        });

        describe("when the email is from an invalid venmo address", async () => {
            beforeEach(async () => {
                await sendProcessor.setEmailFromAddress("bad-hdfc@hdfcbank.net".padEnd(21, "\0"));
            });

            it("should revert", async () => {
                await expect(subject()).to.be.revertedWith("Invalid email from address");
            });
        });

        describe("when the rsa modulus doesn't match", async () => {
            beforeEach(async () => {
                await keyHashAdapter.setMailserverKeyHash(ZERO_BYTES32);
            });

            it("should revert", async () => {
                await expect(subject()).to.be.revertedWith("Invalid mailserver key hash");
            });
        });

        describe("when the e-mail was used previously", async () => {
            beforeEach(async () => {
                await subject();
            });

            it("should revert", async () => {
                await expect(subject()).to.be.revertedWith("Nullifier has already been used");
            });
        });

        describe("when the caller is not the Ramp", async () => {
            beforeEach(async () => {
                subjectCaller = owner;
            });

            it("should revert", async () => {
                await expect(subject()).to.be.revertedWith("Only Ramp can call this function");
            });
        });
    });

    describe("#setMailserverKeyHashAdapter", async () => {
        let subjectHdfcMailserverKeyHashAdapter: string;
        let subjectCaller: Account;

        beforeEach(async () => {
            subjectCaller = owner;

            subjectHdfcMailserverKeyHashAdapter = attacker.address;
        });

        async function subject(): Promise<any> {
            return await sendProcessor.connect(subjectCaller.wallet).setMailserverKeyHashAdapter(subjectHdfcMailserverKeyHashAdapter);
        }

        it("should set the correct venmo keys", async () => {
            await subject();

            const hdfcKeyHashAdapter = await sendProcessor.mailserverKeyHashAdapter();
            expect(hdfcKeyHashAdapter).to.equal(subjectHdfcMailserverKeyHashAdapter);
        });

        describe("when the caller is not the owner", async () => {
            beforeEach(async () => {
                subjectCaller = attacker;
            });

            it("should revert", async () => {
                await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
            });
        });
    });

    describe("#setEmailFromAddress", async () => {
        let subjectEmailFromAddress: string;
        let subjectCaller: Account;

        beforeEach(async () => {
            subjectCaller = owner;

            subjectEmailFromAddress = "new-hdfc@hdfcbank.net".padEnd(21, "\0");
        });

        async function subject(): Promise<any> {
            return await sendProcessor.connect(subjectCaller.wallet).setEmailFromAddress(subjectEmailFromAddress);
        }

        it("should set the correct venmo address", async () => {
            await subject();

            const emailFromAddress = await sendProcessor.getEmailFromAddress();

            expect(ethers.utils.toUtf8Bytes("new-hdfc@hdfcbank.net".padEnd(21, "\0"))).to.deep.equal(ethers.utils.arrayify(emailFromAddress));
        });

        describe("when the caller is not the owner", async () => {
            beforeEach(async () => {
                subjectCaller = attacker;
            });

            it("should revert", async () => {
                await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
            });
        });
    });
});
