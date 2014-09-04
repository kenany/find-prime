var findPrime = require('../');

findPrime(100, function(error, data) {
  console.log(data.toString());
});