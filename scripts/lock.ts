import { ethers } from 'hardhat';
import 'dotenv/config'

const main = async () => {
  const Badge = await ethers.getContractFactory('JoisNengajyo');
  const badgeContract = await Badge.attach(process.env.CONTRACT || '');
  console.log('badge contract', badgeContract.address)

  await badgeContract.lockMinting(1);
  console.log('finish updating')
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
