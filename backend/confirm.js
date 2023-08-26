const Web3 = require('web3');

async function confirm(tx) {
  const web3 = await new Web3(new Web3.providers.HttpProvider('https://bsc-testnet.publicnode.com'));

  const contractAddress="0xeA054006DFb3a8067c7c843e8ca8e15a6928eC8c";
    const account = "Your Account address";
    const gasPrice = await web3.eth.getGasPrice();
    
    const encodedTx = tx.encodeABI();
    
    const nonce = await web3.eth.getTransactionCount(account);
    
    const transactionObject = {
      from: account,
      to: contractAddress,
      gasPrice: gasPrice,
      gas: web3.utils.toHex(1000000), // Set an appropriate gas value
      data: encodedTx,
      nonce: nonce
    };
  
    const signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, 'XX'); // Replace with your private key
    const ok=await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
    hash=signedTransaction.transactionHash;

    
  return hash;
}

module.exports = confirm;
