const { ethers } = require('ethers');
const provider = new ethers.getDefaultProvider();
const fs = require('fs');
const Web3 = require('web3');
const RPC_URL = 'https://ropsten.infura.io/v3/0279e3bdf3ee49d0b547c643c2ef78ef';
const PRIVATE_KEY =
  '6f6647294f37b415e3eaf392328b1b84dcf4cbf67c5640de2bc2c862e30079b1';
const RandomBeaconImpl = require('@keep-network/keep-core/artifacts/KeepRandomBeaconServiceImplV1.json');
const RandomBeaconService = require('@keep-network/keep-core/artifacts/KeepRandomBeaconService.json');

const App = async () => {
  // initiate account
  web3 = new Web3(
    new Web3.providers.HttpProvider(RPC_URL, { timeout: 5 * 60 * 1000 }),
    null,
    { transactionConfirmationBlocks: 1 }
  );
  const account = web3.eth.accounts.privateKeyToAccount('0x' + PRIVATE_KEY);
  web3.eth.accounts.wallet.add('0x' + PRIVATE_KEY);
  web3.eth.defaultAccount = account.address;
  console.log(account.address);

  // initiate contract
  const serviceContract = new web3.eth.Contract(
    RandomBeaconImpl.abi,
    RandomBeaconService.networks['3'].address
  );

  // get entry fee
  try {
    entryFee = await serviceContract.methods.entryFeeEstimate(0).call();
  } catch (err) {
    console.log(`could not get estimate ${err}`);
  }
  console.log(ethers.utils.formatEther(entryFee));

  // try to get a random number
  await serviceContract.methods
    .requestRelayEntry()
    .send({ from: web3.eth.defaultAccount, value: entryFee, gas: 2e6 });
};

App();
