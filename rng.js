const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const Discord = require('discord.js');
const client = new Discord.Client();
const dotenv = require('dotenv');
const RandomBeaconImpl = require('@keep-network/keep-core/artifacts/KeepRandomBeaconServiceImplV1.json');
const RandomBeaconService = require('@keep-network/keep-core/artifacts/KeepRandomBeaconService.json');

const isLocal = false; // variable for local test environment

const discordChannelId = isLocal ? '559027960456413216' : '723194152925397062';

const explorer = 'https://ropsten.etherscan.io/tx/'

// load environment variable
dotenv.config();
const token = process.env.discord_token;

let infuraWS = `wss://ropsten.infura.io/ws/v3/${process.env.infura}`

const options = {
  // Enable auto reconnection
  reconnect: {
    auto: true,
    delay: 60000, // ms
    maxAttempts: 5,
    onTimeout: false,
  },
};

const web3 = new Web3(new Web3.providers.WebsocketProvider(infuraWS, options));

const eventQueue = [];
var channel;

const _fromBlock = 'latest';

const App = async () => {
  // setup discord client

  await client.login(token);
  channel = await client.channels.fetch(discordChannelId); //;

  let intervalID = setInterval(processQueue, 1000);

    // initiate contract
  const serviceContract = new web3.eth.Contract(
      RandomBeaconImpl.abi,
      RandomBeaconService.networks['3'].address
  );
  

  serviceContract.events.RelayEntryRequested(
    {
        fromBlock:_fromBlock
    })
  .on('data', async function (event) {
    eventQueue.push(event);
  })
  .on('connected', () => {
          console.log('connected to websocket');
  }).on('error', function (error) {
          console.log('Event Error', error);
  });

  serviceContract.events.RelayEntryGenerated(
    {
        fromBlock:_fromBlock
    })
  .on('data', async function (event) {
    eventQueue.push(event);
  })
  .on('connected', () => {
          console.log('connected to websocket');
  }).on('error', function (error) {
          console.log('Event Error', error);
  });
};

function processQueue() {
  if (!eventQueue.length) return;
  let event = eventQueue.shift();
  let formatedTX;
  let txURL = `${explorer}${event.transactionHash}`;
  let eventName = event.event;

  let requestId, number
  if(eventName == 'RelayEntryRequested'){
    requestId = event.returnValues.requestId;
    number = event.returnValues.entry;
    formatedTX = `A new request **${requestId}** has been submitted to random beacon chain ❓\n ${txURL}`
    //console.log(formatedTX)

  }else{ // RelayEntryGenerated
    requestId = event.returnValues.requestId;
    number = event.returnValues.entry;
    formatedTX = `Request **${requestId}** on random beacon chain generates ${number} 🔢\n ${txURL}`
    //console.log(formatedTX)
  }
  channel.send(formatedTX);
  return;
}

App();
