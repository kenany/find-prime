const BigInteger = require('bigi');
const randomBytes = require('secure-random-bytes');

const GCD_30_DELTA = [6, 4, 2, 4, 2, 4, 6, 2];

const BIG_TWO = new BigInteger(null);
BIG_TWO.fromInt(2);

module.exports = (self) => {
  self.addEventListener('message', (ev) => {
    const result = findPrime(ev.data);
    self.postMessage(result);
  });

  self.postMessage({ found: false });

  function findPrime(data) {
    const num = new BigInteger(data.hex, 16);

    let deltaIdx = 0;

    const workLoad = data.workLoad;
    for (let i = 0; i < workLoad; ++i) {
      if (isProbablePrime(num)) {
        return { found: true, prime: num.toString(16) };
      }

      num.dAddOffset(GCD_30_DELTA[deltaIdx++ % 8], 0);
    }

    return { found: false };
  }

  function isProbablePrime(n) {
    // Inlined github.com/KenanY/fermat
    let t = BigInteger.ONE;
    let bl = n.bitLength();
    bl--;
    const Bl = n.byteLength();
    for (let i = bl; i >= 0; --i) {
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
    const n1 = n.subtract(BigInteger.ONE);

    const s = n1.getLowestSetBit();
    if (s <= 0) {
      return false;
    }
    const d = n1.shiftRight(s);

    const k = getMillerRabinTests(n.bitLength());
    const prng = getPrng();
    let a;
    for (let i = 0; i < k; ++i) {
      do {
        a = new BigInteger(n.bitLength(), prng);
      } while (a.compareTo(BigInteger.ONE) <= 0 || a.compareTo(n1) >= 0);

      let x = a.modPow(d, n);

      if (x.equals(BigInteger.ONE) || x.equals(n1)) {
        self.postMessage({ mr: 1 });
        continue;
      }

      let j = s;
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
      nextBytes(x) {
        const b = randomBytes(x.length);
        for (let i = 0, length = x.length; i < length; ++i) {
          x[i] = b.charCodeAt(i);
        }
      },
    };
  }

  function getMillerRabinTests(bits) {
    // biome-ignore-start lint/style/useBlockStatements: cleaner
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
};
