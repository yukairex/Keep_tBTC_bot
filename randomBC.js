const Web3 = require('web3');
const RandomBeaconImpl = require('@keep-network/keep-core/artifacts/KeepRandomBeaconServiceImplV1.json');
const RandomBeaconService = require('@keep-network/keep-core/artifacts/KeepRandomBeaconService.json');
const KeepRandomBeaconOperator = require('@keep-network/keep-core/artifacts/KeepRandomBeaconOperator.json');
const KeepRandomBeaconOperatorStatistics = require('@keep-network/keep-core/artifacts/KeepRandomBeaconOperatorStatistics.json');
const dotenv = require('dotenv');
dotenv.config();

const explorer = 'https://ropsten.etherscan.io/tx/';
let infura = `https://ropsten.infura.io/v3/${process.env.infura}`;

//const web3 = new Web3(new Web3.providers.WebsocketProvider(infuraWS, options));
const web3 = new Web3(infura);

// ropsten contract address
const addresses = {
  KeepRandomBeaconOperator: '0xC8337a94a50d16191513dEF4D1e61A6886BF410f',
  KeepRandomBeaconOperatorStatistics:
    '0xe5984A30a5DBaF1FfF818A57dD5f30D74a8dfaBf',
};

const App = async () => {
  const keepRandomBeaconOperator = new web3.eth.Contract(
    KeepRandomBeaconOperator.abi,
    addresses.KeepRandomBeaconOperator
  );

  const keepRandomBeaconOperatorStatistics = new web3.eth.Contract(
    KeepRandomBeaconOperatorStatistics.abi,
    addresses.KeepRandomBeaconOperatorStatistics
  );

  const allGroups = await keepRandomBeaconOperator.methods
    .getNumberOfCreatedGroups()
    .call();

  for (let i = 0; i < allGroups; i++) {
    const groupPublicKey = await keepRandomBeaconOperator.methods
      .getGroupPublicKey(i)
      .call();
    const isStale = await keepRandomBeaconOperator.methods
      .isStaleGroup(groupPublicKey)
      .call();
    const groupMemberRewards = await keepRandomBeaconOperator.methods
      .getGroupMemberRewards(groupPublicKey)
      .call();

    const groupMembers = await keepRandomBeaconOperator.methods
      .getGroupMembers(groupPublicKey)
      .call();

    console.log(
      'group: ',
      groupPublicKey,
      'isStale: ',
      isStale,
      'group rewards',
      groupMemberRewards / 1e18,
      'group members number',
      groupMembers.length
    );
  }
};

App();
