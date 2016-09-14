var findPrime = require('../');

findPrime(100, function(error, data) {
  /* eslint no-console: 0 */
  console.log(data.toString());
});
