const { ethers } = require('ethers');
const provider = new ethers.getDefaultProvider();
const fs = require('fs');
const Web3 = require('web3');
const RPC_URL = 'https://ropsten.infura.io/v3/0279e3bdf3ee49d0b547c643c2ef78ef';
const RandomBeaconImpl = require('@keep-network/keep-core/artifacts/KeepRandomBeaconServiceImplV1.json');
const RandomBeaconService = require('@keep-network/keep-core/artifacts/KeepRandomBeaconService.json');

const App = async () => {

  let infuraWS = isTestnet
  ? `wss://ropsten.infura.io/ws/v3/${process.env.infura}`
  : `wss://mainnet.infura.io/ws/v3/${process.env.infura}`;

  const options = {
    // Enable auto reconnection
    reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: 5,
      onTimeout: false,
    },
  };

const web3 = new Web3(new Web3.providers.WebsocketProvider(infuraWS, options));

  // initiate contract
  const serviceContract = new web3.eth.Contract(
    RandomBeaconImpl.abi,
    RandomBeaconService.networks['3'].address
  );

  serviceContract.events.RelayEntryGenerated({
      fromBlock:0
    }).on('data', async function (event) {
      console.log(event)
    })
    
};


App();
