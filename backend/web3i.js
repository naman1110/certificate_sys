const Web3 = require('web3');
const abi = require('./abi.json');

const contractAddress = '0xeA054006DFb3a8067c7c843e8ca8e15a6928eC8c';

async function web3i() {
  const web3 = await new Web3(new Web3.providers.HttpProvider('https://bsc-testnet.publicnode.com'));

  // Contract ABI and address
  const contractABI = abi;

  // Instantiate the smart contract
  const contract = await new web3.eth.Contract(contractABI, contractAddress);

  return contract;
}

module.exports = web3i;
