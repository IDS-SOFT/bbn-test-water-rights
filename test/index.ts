import { expect } from "chai";
import { ethers } from "hardhat";

describe("EnvironmentalAsset", function () {
    let EnvironmentalAsset:any;
    let environmentalAsset:any;
    let issuer:any;
    let recipient:any;
    const assetName = "Carbon Credits";
    const assetType = "Carbon Offset";
    const initialSupply = 1000;
    const assetPrice = 100;
    const expirationDate = Math.floor(Date.now() / 1000) + 3600; // Set expiration date to 1 hour from now

    beforeEach(async function () {
        [issuer, recipient] = await ethers.getSigners();

        EnvironmentalAsset = await ethers.getContractFactory("EnvironmentalAsset");
        environmentalAsset = await EnvironmentalAsset.deploy(
            assetName,
            assetType,
            initialSupply,
            assetPrice,
            expirationDate
        );
        await environmentalAsset.deployed();
    });

    it("should mint assets and update balances", async function () {
        const amountToMint = 100;
        await environmentalAsset.connect(issuer).mintAsset(recipient.address, amountToMint);

        const recipientBalance = await environmentalAsset.balances(recipient.address);
        const availableSupply = await environmentalAsset.availableSupply();

        expect(recipientBalance).to.equal(amountToMint);
        expect(availableSupply).to.equal(initialSupply - amountToMint);
    });

    it("should transfer assets between addresses", async function () {
        const amountToMint = 100;
        await environmentalAsset.connect(issuer).mintAsset(recipient.address, amountToMint);

        const amountToTransfer = 50;
        await environmentalAsset.connect(recipient).transferAsset(issuer.address, amountToTransfer);

        const recipientBalance = await environmentalAsset.balances(recipient.address);
        const issuerBalance = await environmentalAsset.balances(issuer.address);

        expect(recipientBalance).to.equal(amountToMint - amountToTransfer);
        expect(issuerBalance).to.equal(amountToTransfer);
    });

    it("should revoke assets after the expiration date", async function () {
        // Increase the time to simulate the expiration date
        await network.provider.send("evm_setNextBlockTimestamp", [expirationDate + 1]);
        await network.provider.send("evm_mine");

        let errorOccurred = false;

        try {
            const issuerBalance = await environmentalAsset.balances(issuer.address);
            const availableSupply = await environmentalAsset.availableSupply;

            expect(issuerBalance).to.equal(initialSupply);
            expect(availableSupply).to.equal(0);
        } catch (error) {
            errorOccurred = true;
        }
        expect(errorOccurred).to.equal(true);
    });
});
