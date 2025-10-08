const findPrime = require('../');

findPrime(100, (error, data) => {
  if (error) {
    throw error;
  }

  // biome-ignore lint/suspicious/noConsole: example
  console.log(data.toString());
});
