var BigInteger = require('bigi');
var randomBytes = require('secure-random-bytes');
var isFunction = require('lodash.isfunction');
var bitwiseOR = require('bitwise-or');
var once = require('once');

var GCD_30_DELTA = [6, 4, 2, 4, 2, 4, 6, 2];
var THIRTY = new BigInteger(null);
THIRTY.fromInt(30);

// bigi expects a generator that has a `nextBytes` method for filling an
// _Array_ with random values.
var rng = {
  nextBytes: function(x) {
    var b = randomBytes(x.length);
    for (var i = 0, length = x.length; i < length; ++i) {
      x[i] = b.charCodeAt(i);
    }
  }
};

function generateRandom(bits) {
  var num = new BigInteger(bits, rng);

  var bits1 = bits - 1;
  if (!num.testBit(bits1)) {
    num.bitwiseTo(BigInteger.ONE.shiftLeft(bits1), bitwiseOR, num);
  }

  num.dAddOffset(31 - num.mod(THIRTY).byteValue(), 0);
  return num;
}

function getMillerRabinTests(bits) {
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
}

function findPrime(bits, options, callback) {
  if (isFunction(options)) {
    callback = options;
    options = {};
  }

  callback = once(callback);

  var num = generateRandom(bits);

  var deltaIdx = 0;

  var mrTests = options.millerRabinTests || getMillerRabinTests(num.bitLength());

  var maxBlockTime = options.maxBlockTime || 10;

  var start = +new Date();
  do {
    if (num.bitLength() > bits) {
      num = generateRandom(bits);
    }

    if (num.isProbablePrime(mrTests)) {
      return callback(null, num);
    }

    num.dAddOffset(GCD_30_DELTA[deltaIdx++ % 8], 0);
  } while (maxBlockTime < 0 || (+new Date() - start < maxBlockTime));

  findPrime(bits, options, callback);
}

module.exports = findPrime;
