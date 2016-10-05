var findPrime = require('../');

findPrime(100, function(error, data) {
  if (error) {
    throw error;
  }

  /* eslint no-console: 0 */
  console.log(data.toString());
});
