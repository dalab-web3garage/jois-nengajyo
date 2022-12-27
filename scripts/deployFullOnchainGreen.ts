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
    maxSupply: 1000,
    maxMintPerWallet: 1,
    title: 'Happy New Year 2023',
    description: 'Happy New Year 2023 NFT from Joi Ito. Artwork by Kawaii SKULL.',
  };

  const image = await readFileSync("./images/2_green.svg")
  await badgeContract.createOnChainItem(
    purple.mintable,
    purple.transferable,
    purple.maxSupply,
    purple.maxMintPerWallet,
    purple.title,
    purple.description,
    image.toString()
  )

  const _contractUri = "https://bafkreibwu2z4xzkxbbyl6sz66c62u3audjax7w3aqjqbeatqz6rwtg6gpq.ipfs.w3s.link/?filename=metadata-nengajyo-green.json"
  await badgeContract.setContractURI(_contractUri)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
