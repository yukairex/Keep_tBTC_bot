const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const Discord = require('discord.js');
const client = new Discord.Client();
const dotenv = require('dotenv');

const isTestnet = false; // choose testnet or mainnet

// load environment variable
dotenv.config();
const token = process.env.discord_token;

const { tweet } = require('./tweetbot.js');
const systemABI = require('./abi/system.json');
const tbtcABI = require('./abi/tbtc.json');

const explorer = isTestnet
  ? 'https://ropsten.etherscan.io/tx/'
  : 'https://etherscan.io/tx/';

let infura = isTestnet
  ? `https://ropsten.infura.io/v3/${process.env.infura}`
  : `https://mainnet.infura.io/v3/${process.env.infura}`;

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

let systemAddress = isTestnet
  ? '0x2b70907b5c44897030ea1369591ddcd23c5d85d6'
  : '0x41a1b40c1280883ea14c6a71e23bb66b83b3fb59';

let tBTCAddress = isTestnet
  ? '0x0c323687f7c539dfcea3c1f4b2c2a8e050977a52' // does not seem right?
  : '0x1bbe271d15bb64df0bc6cd28df9ff322f2ebd847';

const App = async () => {
  // setup discord client
  await client.login(token);
  let channel = await client.channels.fetch('723194152925397062'); //;

  const instance = new web3.eth.Contract(tbtcABI, tBTCAddress);
  instance.events
    .Transfer(
      {
        fromBlock: 'latest',
      },
      function (err) {
        if (err != null) console.log(err);
      }
    )
    .on('data', async function (event) {
      //console.log(event);
      let rawvalue = new BigNumber(parseInt(event.returnValues.value));
      let value = rawvalue.div(10 ** 18).toNumber();

      if (value > 0.1) {
        let from = event.returnValues.from.toLowerCase();
        let to = event.returnValues.to.toLowerCase();

        let txId = event.transactionHash;

        if (from === '0x0000000000000000000000000000000000000000') {
          let message = `👀👀 ${value} tBTC has just been minted ${
            explorer + txId
          } #tBTC #KeepNetwork`;
          console.log(message);
          tweet(message);
          channel.send(message);
        }

        if (to === '0x0000000000000000000000000000000000000000') {
          let message = ` 🔥🔥🔥 ${value} tBTC has just been burned ${
            explorer + txId
          } #tBTC #KeepNetwork`;
          console.log(message);
          tweet(message);
          channel.send(message);
        }
      }
    })
    .on('connected', () => {
      console.log('connected to websocket');
    })
    .on('error', function (error) {
      console.log('Event Error', error);
    });
};

App();
