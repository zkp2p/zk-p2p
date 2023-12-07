import "module-alias/register";

import { Account } from "@utils/test/types";
import { ManagedKeyHashAdapterV2 } from "@utils/contracts";
import DeployHelper from "@utils/deploys";

import {
    getWaffleExpect,
    getAccounts
} from "@utils/test/index";

const expect = getWaffleExpect();

const keyHash1 = "0x2cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f";
const keyHash2 = "0x1cf6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f";

describe.only("ManagedKeyHashAdapterV2", () => {
    let owner: Account;
    let attacker: Account;

    let keyHashAdapter: ManagedKeyHashAdapterV2;

    let deployer: DeployHelper;

    beforeEach(async () => {
        [
            owner,
            attacker,
        ] = await getAccounts();

        deployer = new DeployHelper(owner.wallet);

        keyHashAdapter = await deployer.deployManagedKeyHashAdapterV2([keyHash1, keyHash2]);
    });

    describe("#constructor", async () => {
        it("should have the correct key hash", async () => {
            const keyHashes = await keyHashAdapter.getMailserverKeyHashes();
            expect(keyHashes[0]).to.eq(keyHash1);
            expect(keyHashes[1]).to.eq(keyHash2);
        });

        it("should have the correct owner set", async () => {
            const _owner = await keyHashAdapter.owner();
            expect(_owner).to.eq(owner.address);
        });
    });

    // describe("#setMailserverKeyHash", async () => {
    //     let subjectVenmoMailserverKeyHash: string;
    //     let subjectCaller: Account;

    //     beforeEach(async () => {
    //         subjectCaller = owner;

    //         subjectVenmoMailserverKeyHash = "0x2db6a95f35c0d2b6160f07626e9737449a53d173d65d1683263892555b448d8f";
    //     });

    //     async function subject(): Promise<any> {
    //         return await keyHashAdapter.connect(subjectCaller.wallet).setMailserverKeyHash(subjectVenmoMailserverKeyHash);
    //     }

    //     it("should set the correct venmo keys", async () => {
    //         await subject();

    //         const keyHash1 = await keyHashAdapter.mailserverKeyHash();
    //         expect(keyHash1).to.equal(subjectVenmoMailserverKeyHash);
    //     });

    //     describe("when the caller is not the owner", async () => {
    //         beforeEach(async () => {
    //             subjectCaller = attacker;
    //         });

    //         it("should revert", async () => {
    //             await expect(subject()).to.be.revertedWith("Ownable: caller is not the owner");
    //         });
    //     });
    // });
});
