import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { readFileSync } from 'fs'
import chai from 'chai';
import chaiString from 'chai-string'
chai.use(chaiString);

describe("JoisNengajyo", function () {
  let badgeContract: Contract,
    owner: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    const ItemContract = await ethers.getContractFactory("JoisNengajyo");
    badgeContract = await ItemContract.deploy();
    await badgeContract.deployed();
  });

  describe("ccreateOnChainItem", () => {
    it("creates items", async () => {
      const badgeArgs = {
        title: 'this is the title',
        description: 'foobar',
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };

      const image = await readFileSync("./images/3_purple.svg")
      await expect(
        badgeContract.createOnChainItem(
          badgeArgs.mintable,
          badgeArgs.transferable,
          badgeArgs.maxSupply,
          badgeArgs.maxMintPerWallet,
          badgeArgs.title,
          badgeArgs.description,
          image.toString()
        )).to.emit(badgeContract, "NewItem")
        .withArgs(1, badgeArgs.mintable);
      const item = await badgeContract.items(1);
      expect(item.mintable).to.eq(badgeArgs.mintable);
      expect(item.transferable).to.eq(badgeArgs.transferable);
      expect(item.tokenURI).to.startWith('data:application/json;base64,')
      expect(item.maxSupply).to.eq(badgeArgs.maxSupply);
    });

    it("reverts with none owner", async () => {
      const badgeArgs = {
        title: 'this is the title',
        description: 'foobar',
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };

      const image = await readFileSync("./images/3_purple.svg")
      await expect(
        badgeContract.connect(alice).createOnChainItem(
          badgeArgs.mintable,
          badgeArgs.transferable,
          badgeArgs.maxSupply,
          badgeArgs.maxMintPerWallet,
          badgeArgs.title,
          badgeArgs.description,
          image.toString()
        )
      ).to.be
        .reverted;
    });
  });

  describe("createItem", () => {
    it("creates items", async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };

      await expect(badgeContract.createItem(badgeArgs))
        .to.emit(badgeContract, "NewItem")
        .withArgs(1, badgeArgs.mintable);
      const item = await badgeContract.items(1);
      expect(item.mintable).to.eq(badgeArgs.mintable);
      expect(item.transferable).to.eq(badgeArgs.transferable);
      expect(item.tokenURI).to.eq(badgeArgs.tokenURI);
      expect(item.maxSupply).to.eq(badgeArgs.maxSupply);

      await expect(badgeContract.createItem(Object.values(badgeArgs)))
        .to.emit(badgeContract, "NewItem")
        .withArgs(2, badgeArgs.mintable);
      const anotherItem = await badgeContract.items(2);
      expect(anotherItem.mintable).to.eq(badgeArgs.mintable);
      expect(anotherItem.transferable).to.eq(badgeArgs.transferable);
      expect(anotherItem.tokenURI).to.eq(badgeArgs.tokenURI);
      expect(anotherItem.maxSupply).to.eq(badgeArgs.maxSupply);
    });

    it("reverts with none owner", async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        amount: ethers.utils.parseUnits("100", 18),
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };

      await expect(badgeContract.connect(alice).createItem(badgeArgs)).to.be
        .reverted;
    });
  });

  describe("updateItem", () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };
      await badgeContract.createItem(badgeArgs);
    });

    it("updates Item", async () => {
      await expect(
        badgeContract.updateItemAttr(1, false, "https//hoge.com")
      ).to.emit(badgeContract, "UpdateItem");
      const item = await badgeContract.items(1);
      expect(item.mintable).to.eq(false);
      expect(item.transferable).to.eq(false);
      expect(item.tokenURI).to.eq("https//hoge.com");
      expect(item.maxSupply).to.eq(10);
    });

    it("updates only mintable", async () => {
      await expect(
        badgeContract.updateItemAttr(1, false, "0")
      ).to.emit(badgeContract, "UpdateItem");
      const item = await badgeContract.items(1);
      expect(item.mintable).to.eq(false);
      expect(item.transferable).to.eq(false);
      expect(item.tokenURI).to.eq("https://example.com");
      expect(item.maxSupply).to.eq(10);
    });

    it("reverts with non existed item", async () => {
      await expect(
        badgeContract.updateItemAttr(0, false, "https//hoge.com")
      ).to.revertedWith("Item Not Exists");
      await expect(
        badgeContract.updateItemAttr(10, false, "https//hoge.com")
      ).to.revertedWith("Item Not Exists");
    });

    it("reverts with none owner", async () => {
      await expect(
        badgeContract.connect(bob).updateItemAttr(0, false, "https//hoge.com")
      ).to.be.reverted;
    });
  });

  describe("lockMinting", () => {
    it("reverts if item is locked", async () => {
      const badgeArgs = {
        mintable: true,
        transferable: true,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };
      await badgeContract.createItem(badgeArgs);
      expect((await badgeContract.getItems()).length).to.be.eq(1);
      await badgeContract.mint(1);
      await badgeContract.lockMinting(1);
      await expect(badgeContract.mint(1)).to.revertedWith(
        "Invalid: To mint"
      );
    });

    it("revert if user is not owner", async () => {
      const badgeArgs = {
        mintable: true,
        transferable: true,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };
      await badgeContract.createItem(badgeArgs);
      await expect(badgeContract.connect(bob).lockMinting(1)).to.revertedWith(
        "Ownable: caller is not the owner"
      );
    })
  })

  describe("mint", () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };
      await badgeContract.createItem(badgeArgs);
    });

    it("mint successfully", async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };
      await badgeContract.createItem(badgeArgs);
      expect(await badgeContract.totalSupply(2)).to.be.eq(0);
      await badgeContract.connect(alice).mint(2);
      expect(
        await badgeContract.connect(alice).balanceOf(alice.address, 2)
      ).to.be.eq(1);
      expect(await badgeContract.connect(alice).totalSupply(2)).to.be.eq(1);
    });

    it("reverts with non existed item", async () => {
      await expect(badgeContract.mint(0)).to.revertedWith("Item Not Exists");
      await expect(badgeContract.mint(10)).to.revertedWith("Item Not Exists");
    });

    it("reverts if mintable is false", async () => {
      const badgeArgs = {
        mintable: false,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };
      await badgeContract.createItem(badgeArgs);
      expect((await badgeContract.getItems()).length).to.be.eq(2);
      await expect(badgeContract.mint(2)).to.revertedWith(
        "Invalid: To mint"
      );
    });

    it("reverts exceed total Supply", async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        maxSupply: 1,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };
      await badgeContract.createItem(badgeArgs);
      expect((await badgeContract.getItems()).length).to.be.eq(2);
      await badgeContract.mint(2);
      await expect(badgeContract.mint(2)).to.revertedWith(
        "Invalid: Exceed Supply"
      );
    });

    it("reverts if user exceed maxMintPerWallet", async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 1,
      };

      await badgeContract.createItem(badgeArgs);
      expect((await badgeContract.getItems()).length).to.be.eq(2);
      await badgeContract.mint(2);
      await expect(badgeContract.mint(2)).to.revertedWith(
        "Invalid: EXCEED MAX MINT PER WALLET"
      );

      const badgeArgs10 = {
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 4,
      };
      await badgeContract.createItem(badgeArgs10);
      expect((await badgeContract.getItems()).length).to.be.eq(3);
      await badgeContract.mint(3);
      await badgeContract.mint(3);
      await badgeContract.mint(3);
      await badgeContract.mint(3);
      await expect(badgeContract.mint(3)).to.revertedWith(
        "Invalid: EXCEED MAX MINT PER WALLET"
      );
    });

    it("user can mint unitl maxSupply if maxMintPerWallet is 0", async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        maxSupply: 3,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };

      await badgeContract.createItem(badgeArgs);
      expect((await badgeContract.getItems()).length).to.be.eq(2);
      await badgeContract.mint(2);
      await badgeContract.mint(2);
      await badgeContract.mint(2);
      await expect(badgeContract.mint(2)).to.revertedWith(
        "Invalid: Exceed Supply"
      );
    });
  });

  it("reverts with non existed item", async () => {
    await expect(badgeContract.mint(0)).to.revertedWith("Item Not Exists");
    await expect(badgeContract.mint(10)).to.revertedWith("Item Not Exists");
  });

  describe("safeTransferFrom", () => {
    beforeEach(async () => {
      const transferableItemArgs = {
        mintable: true,
        transferable: true,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };
      await badgeContract.createItem(transferableItemArgs);

      const nonTransferableItemArgs = {
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };
      await badgeContract.createItem(nonTransferableItemArgs);
    });

    it("safeTransferFrom successfully", async () => {
      await badgeContract.mint(1);

      await badgeContract.safeTransferFrom(
        owner.address,
        alice.address,
        1,
        1,
        []
      );

      expect(await badgeContract.balanceOf(owner.address, 1)).to.be.eq(0);
      expect(await badgeContract.balanceOf(alice.address, 1)).to.be.eq(1);
    });

    it("reverts with non existed item", async () => {
      await expect(badgeContract.mint(0)).to.revertedWith("Item Not Exists");
      await expect(badgeContract.mint(10)).to.revertedWith("Item Not Exists");
    });

    it("reverts with non transferable budge", async () => {
      await badgeContract.mint(2);

      await expect(
        badgeContract.safeTransferFrom(owner.address, alice.address, 2, 1, [])
      ).to.revertedWith("TRANSFER FORBIDDEN");
    });
  });

  describe("mintTo", () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };
      await badgeContract.createItem(badgeArgs);
    });

    it("mint successfully", async () => {
      expect(await badgeContract.mintTo(alice.address, 1))
        .to.emit(badgeContract, "MintTo")
        .withArgs(owner.address, alice.address, 1);
      expect(await badgeContract.balanceOf(alice.address, 1)).to.be.eq(1);
    });

    it("revert if non-owner try to mint", async () => {
      await expect(badgeContract.connect(bob).mintTo(alice.address, 1)).to.reverted
      expect(await badgeContract.balanceOf(alice.address, 1)).to.be.eq(0);
    });

    it("reverts with non existed item", async () => {
      await expect(badgeContract.mintTo(alice.address, 0)).to.revertedWith(
        "Item Not Exists"
      );
      await expect(
        badgeContract.mintTo(alice.address, 10)
      ).to.revertedWith("Item Not Exists");
    });

    it("reverts if user exceed maxMintPerWallet", async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 1,
      };

      await badgeContract.createItem(badgeArgs);
      expect((await badgeContract.getItems()).length).to.be.eq(2);
      await badgeContract.mintTo(alice.address, 2);
      await expect(badgeContract.mintTo(alice.address, 2)).to.revertedWith(
        "Invalid: EXCEED MAX MINT PER WALLET"
      );
    });

    it("reverts if user mintable is false", async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 1,
      };

      await badgeContract.createItem(badgeArgs);
      expect((await badgeContract.getItems()).length).to.be.eq(2);
      await badgeContract.mintTo(alice.address, 2);
      await badgeContract.lockMinting(2);
      await expect(badgeContract.mintTo(bob.address, 2)).to.revertedWith(
        "Invalid: To mint"
      );
    });

    it("amdin can mint until maxSupply if maxMintPerWallet is 0", async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        maxSupply: 3,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };

      await badgeContract.createItem(badgeArgs);
      expect((await badgeContract.getItems()).length).to.be.eq(2);
      await badgeContract.mintTo(alice.address, 2);
      await badgeContract.mintTo(alice.address, 2);
      await badgeContract.mintTo(alice.address, 2);
      await expect(badgeContract.mintTo(alice.address, 2)).to.revertedWith(
        "Invalid: Exceed Supply"
      );
    });
  });

  describe("items", () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };
      await badgeContract.createItem(badgeArgs);
    });

    it("returns items mapping", async () => {
      expect(await badgeContract.items(1)).to.be.eql([
        true,
        false,
        ethers.BigNumber.from(10),
        "https://example.com",
        ethers.BigNumber.from(0),
      ]);

      expect(await badgeContract.totalSupply(1)).to.be.eq(0);
    });
  });

  describe("getItems", () => {
    beforeEach(async () => {
      const badgeArgs1 = {
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example1.com",
        maxMintPerWallet: 0,
      };
      await badgeContract.createItem(badgeArgs1);
      const badgeArgs2 = {
        mintable: true,
        transferable: true,
        maxSupply: 10,
        tokenURI: "https://example2.com",
        maxMintPerWallet: 0,
      };
      await badgeContract.createItem(badgeArgs2);
    });

    it("returns items array", async () => {
      expect(await badgeContract.getItems()).to.be.eql([
        [
          true,
          false,
          ethers.BigNumber.from(10),
          "https://example1.com",
          ethers.BigNumber.from(0),
        ],
        [
          true,
          true,
          ethers.BigNumber.from(10),
          "https://example2.com",
          ethers.BigNumber.from(0),
        ],
      ]);
    });
  });

  describe.skip("burn", () => {
    beforeEach(async () => {
      const badgeArgs = {
        mintable: true,
        transferable: false,
        maxSupply: 10,
        tokenURI: "https://example.com",
        maxMintPerWallet: 0,
      };
      await badgeContract.createItem(badgeArgs);
    });

    it("owner burns own token successfully", async () => {
      await badgeContract.mint(1);
      expect(await badgeContract.balanceOf(owner.address, 1)).to.be.eq(1);
      expect(await badgeContract.burn(1, owner.address))
        .to.emit(badgeContract, "BurnItem")
        .to.emit(1, owner.address);
      expect(await badgeContract.balanceOf(owner.address, 1)).to.be.eq(0);
      expect(await badgeContract.totalSupply(1)).to.be.eq(0);
    });

    it("owner burns alice's token successfully", async () => {
      await badgeContract.connect(alice).mint(1);
      expect(await badgeContract.balanceOf(alice.address, 1)).to.be.eq(1);
      await badgeContract.burn(1, alice.address);
      expect(await badgeContract.balanceOf(alice.address, 1)).to.be.eq(0);
      expect(await badgeContract.totalSupply(1)).to.be.eq(0);
    });

    it("alice burns own token successfully", async () => {
      await badgeContract.connect(alice).mint(1);
      expect(await badgeContract.balanceOf(alice.address, 1)).to.be.eq(1);
      await badgeContract.connect(alice).burn(1, alice.address);
      expect(await badgeContract.balanceOf(alice.address, 1)).to.be.eq(0);
      expect(await badgeContract.totalSupply(1)).to.be.eq(0);
    });

    it("reverts with Item Not Exists", async () => {
      await expect(badgeContract.burn(0, owner.address)).to.revertedWith(
        "Item Not Exists"
      );
      await expect(badgeContract.burn(10, owner.address)).to.revertedWith(
        "Item Not Exists"
      );
    });

    it("reverts with Invalid: NOT HOLDER", async () => {
      await expect(badgeContract.burn(1, owner.address)).to.revertedWith(
        "Invalid: NOT HOLDER"
      );
    });

    it("reverts with NOT HAVE AUTHORITY", async () => {
      await badgeContract.mint(1);
      await expect(
        badgeContract.connect(alice).burn(1, owner.address)
      ).to.revertedWith("NOT HAVE AUTHORITY");
    });
  });
});
