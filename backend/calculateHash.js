const sha256 = require('sha256');

function calculateHash(data) {
  return sha256(data);
}

module.exports = calculateHash;
