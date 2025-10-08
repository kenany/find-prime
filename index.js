const BigInteger = require('bigi');
const randomBytes = require('secure-random-bytes');
const isFunction = require('lodash.isfunction');
const bitwiseOR = require('bitwise-or');
const once = require('once');

const GCD_30_DELTA = [6, 4, 2, 4, 2, 4, 6, 2];
const THIRTY = new BigInteger(null);
THIRTY.fromInt(30);

// bigi expects a generator that has a `nextBytes` method for filling an
// _Array_ with random values.
const rng = {
  nextBytes(x) {
    const b = randomBytes(x.length);
    for (let i = 0, length = x.length; i < length; ++i) {
      x[i] = b.charCodeAt(i);
    }
  },
};

function generateRandom(bits) {
  const num = new BigInteger(bits, rng);

  const bits1 = bits - 1;
  if (!num.testBit(bits1)) {
    num.bitwiseTo(BigInteger.ONE.shiftLeft(bits1), bitwiseOR, num);
  }

  num.dAddOffset(31 - num.mod(THIRTY).byteValue(), 0);
  return num;
}

function getMillerRabinTests(bits) {
  // biome-ignore-start lint/style/useBlockStatements: cleaner
  if (bits <= 100) return 27;
  if (bits <= 150) return 18;
  if (bits <= 200) return 15;
  if (bits <= 250) return 12;
  if (bits <= 300) return 9;
  if (bits <= 350) return 8;
  if (bits <= 400) return 7;
  if (bits <= 500) return 6;
  if (bits <= 600) return 5;
  if (bits <= 800) return 4;
  if (bits <= 1250) return 3;
  return 2;
  // biome-ignore-end lint/style/useBlockStatements: cleaner
}

function findPrime(bits, options, callback) {
  if (isFunction(options)) {
    callback = options;
    options = {};
  }

  callback = once(callback);

  let num = generateRandom(bits);

  let deltaIdx = 0;

  const mrTests =
    options.millerRabinTests || getMillerRabinTests(num.bitLength());

  const maxBlockTime = options.maxBlockTime || 10;

  const start = Date.now();
  do {
    if (num.bitLength() > bits) {
      num = generateRandom(bits);
    }

    if (num.isProbablePrime(mrTests)) {
      callback(null, num);
      return;
    }

    num.dAddOffset(GCD_30_DELTA[deltaIdx++ % 8], 0);
  } while (maxBlockTime < 0 || Date.now() - start < maxBlockTime);

  findPrime(bits, options, callback);
}

module.exports = findPrime;
