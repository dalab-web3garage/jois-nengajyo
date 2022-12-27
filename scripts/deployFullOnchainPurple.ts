import { ethers } from 'hardhat'
import { readFileSync } from 'fs'

const main = async () => {
  const Badge = await ethers.getContractFactory('JoisNengajyo')
  const badgeContract = await Badge.deploy()
  await badgeContract.deployed()
  console.log('badge contract', badgeContract.address)

  const purple = {
    mintable: true,
    transferable: true,
    maxSupply: 700,
    maxMintPerWallet: 1,
    title: 'Happy New Year 2023',
    description: 'Happy New Year 2023 NFT from Joi Ito for special friends. Artwork by Kawaii SKULL.',
  };

  const image = await readFileSync("./images/3_purple.svg")
  const _contractUri = "https://bafkreifrwpzkxgezb7schrl5ql5ei2tdzindj4ozatugcaipw6cwribbym.ipfs.w3s.link/?filename=metadata-nengajyo-purple.json"
  await badgeContract.setContractURI(_contractUri)
  await badgeContract.createOnChainItem(
    purple.mintable,
    purple.transferable,
    purple.maxSupply,
    purple.maxMintPerWallet,
    purple.title,
    purple.description,
    image.toString()
  )
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
