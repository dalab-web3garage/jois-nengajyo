import { ethers } from 'hardhat';

const main = async () => {
  const Badge = await ethers.getContractFactory('JoisNengajyo');
  const badgeContract = await Badge.attach('0x67FfefC26A35b6F5282e7FbeDb015C8ca881b674');
  console.log('badge contract', badgeContract.address)

  const purple = {
    mintable: true,
    transferable: true,
    maxSupply: 700,
    tokenURI: 'https://bafkreicqyolobgtoifvuh3jyrbdbsgeqqezviw6ld5hhhfm6i64fwdhzki.ipfs.w3s.link/?filename=metadata-nengajyo-purple.json',
    maxMintPerWallet: 1,
  };

  await badgeContract.createItem(purple);
  console.log('finish updating')
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
