const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const Discord = require('discord.js');
const client = new Discord.Client();
const dotenv = require('dotenv');

const isTestnet = true; // choose testnet or mainnet
const isLocal = false; // variable for local test environment

const discordChannelId = isLocal ? '559027960456413216' : '723194152925397062';

// load environment variable
dotenv.config();
const token = process.env.discord_token;

const { tweet } = require('./tweetbot.js');
const systemABI = require('./abi/system.json');
const tbtcSystemABI = require('./abi/system.json');

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

//const web3 = new Web3(new Web3.providers.WebsocketProvider(infuraWS, options));
const web3 = new Web3(infura);

let tBTCSystemAddress = isTestnet
  ? '0x14dC06F762E7f4a756825c1A1dA569b3180153cB'
  : '0x1bbe271d15bb64df0bc6cd28df9ff322f2ebd847';

var channel;
const App = async () => {
  // setup discord client

  await client.login(token);
  channel = await client.channels.fetch(discordChannelId); //;

  const instance = new web3.eth.Contract(tbtcSystemABI, tBTCSystemAddress);

  client.on('message', async (message) => {
    if (message.author.bot) return;

    if (message.content == 'deposit') {
      try {
        let isNewDepositAllowed = await instance.methods
          .getAllowNewDeposits()
          .call();
        console.log('is new deposit allowed', isNewDepositAllowed);
        if (isNewDepositAllowed) message.reply('deposit allowed');
        else message.reply('deposit is NOT allowed');
      } catch (err) {
        console.log(err);
      }
    }
  });
};

App();
