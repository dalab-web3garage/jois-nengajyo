import { ethers } from 'hardhat';

const main = async () => {
  const Badge = await ethers.getContractFactory('JoisNengajyo');
  const badgeContract = await Badge.attach('0x67FfefC26A35b6F5282e7FbeDb015C8ca881b674');
  console.log('badge contract', badgeContract.address)

  await badgeContract.lockMinting(1);
  console.log('finish updating')
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
