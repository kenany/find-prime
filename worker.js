var BigInteger = require('bigi');
var randomBytes = require('secure-random-bytes');

var GCD_30_DELTA = [6, 4, 2, 4, 2, 4, 6, 2];

var BIG_TWO = new BigInteger(null);
BIG_TWO.fromInt(2);

module.exports = function(self) {
  self.addEventListener('message', function(ev) {
    var result = findPrime(ev.data);
    self.postMessage(result);
  });

  self.postMessage({ found: false });

  function findPrime(data) {
    var num = new BigInteger(data.hex, 16);

    var deltaIdx = 0;

    var workLoad = data.workLoad;
    for (var i = 0; i < workLoad; ++i) {
      if (isProbablePrime(num)) {
        return { found: true, prime: num.toString(16) };
      }

      num.dAddOffset(GCD_30_DELTA[deltaIdx++ % 8], 0);
    }

    return { found: false };
  }

  function isProbablePrime(n) {
    // Inlined github.com/KenanY/fermat
    var t = BigInteger.ONE;
    var bl = n.bitLength();
    bl--;
    var Bl = n.byteLength();
    for (var i = bl; i >= 0; --i) {
      t = t.square();
      if (t.byteLength() > Bl) {
        t = t.mod(n);
      }
      if (n.testBit(i)) {
        t = t.shiftLeft(1);
      }
      self.postMessage({ fermat: (bl - i) / bl });
    }
    if (t.compareTo(n) > 0) {
      t = t.mod(n);
    }
    if (!t.equals(BIG_TWO)) {
      return false;
    }

    return runMillerRabin(n);
  }

  function runMillerRabin(n) {
    var n1 = n.subtract(BigInteger.ONE);

    var s = n1.getLowestSetBit();
    if (s <= 0) {
      return false;
    }
    var d = n1.shiftRight(s);

    var k = getMillerRabinTests(n.bitLength());
    var prng = getPrng();
    var a;
    for (var i = 0; i < k; ++i) {
      do {
        a = new BigInteger(n.bitLength(), prng);
      } while (a.compareTo(BigInteger.ONE) <= 0 || a.compareTo(n1) >= 0);

      var x = a.modPow(d, n);

      if (x.equals(BigInteger.ONE) || x.equals(n1)) {
        self.postMessage({ mr: 1 });
        continue;
      }

      var j = s;
      while (--j) {
        x = x.modPowInt(2, n);

        if (x.equals(BigInteger.ONE)) {
          return false;
        }

        if (x.equals(n1)) {
          break;
        }
      }

      if (j === 0) {
        return false;
      }

      self.postMessage({ mr: i / k });
    }

    return true;
  }

  function getPrng() {
    return {
      nextBytes: function(x) {
        var b = randomBytes(x.length);
        for (var i = 0, length = x.length; i < length; ++i) {
          x[i] = b.charCodeAt(i);
        }
      }
    };
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
};
