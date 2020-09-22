const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const Discord = require('discord.js');
const client = new Discord.Client();
const dotenv = require('dotenv');

const isTestnet = false; // choose testnet or mainnet
const isLocal = false; // variable for local test environment

const discordChannelId = isLocal ? '559027960456413216' : '723194152925397062';

// load environment variable
dotenv.config();
const token = process.env.discord_token;

const { tweet } = require('./tweetbot.js');
const systemABI = require('./abi/system.json');
const tbtcABI = require('./abi/tbtc.json');

const address0 = '0x0000000000000000000000000000000000000000';

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

let tBTCAddress = isTestnet
  ? '0x7c07C42973047223F80C4A69Bb62D5195460Eb5F'
  : '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa';

const eventQueue = [];
var channel;
const App = async () => {
  // setup discord client

  await client.login(token);
  channel = await client.channels.fetch(discordChannelId); //;

  let intervalID = setInterval(processQueue, 10000);

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
      eventQueue.push(event);
    })
    .on('connected', () => {
      console.log('connected to websocket');
    })
    .on('error', function (error) {
      console.log('Event Error', error);
    });
};

function processQueue() {
  if (!eventQueue.length) return;
  let event = eventQueue.shift();
  let formatedTX;
  let txURL = `${explorer}${event.transactionHash}`;
  let from = event.returnValues.from.toLowerCase();
  let to = event.returnValues.to.toLowerCase();
  let rawvalue = new BigNumber(parseInt(event.returnValues.value));
  let value = rawvalue.div(10 ** 18).toNumber();

  if (value > 0.00099) {
    if (from === address0) {
      formatedTX = `🚨 **Mainnet** ${value} #tBTC has been minted !!! 💎\n ${txURL}`;
    } else if (to === address0) {
      formatedTX = `🚨 **Mainnet** ${value} #tBTC has been burned! 🔥\n ${txURL}`;
    } else {
      return;
    }

    if (!isLocal) {
      tweet(formatedTX);
      //channel.send(formatedTX);
    }

    console.log(formatedTX);
    return;
  }
  return;
}

App();
