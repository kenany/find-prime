const BigInteger = require('bigi');
const work = require('webworkify');
const randomBytes = require('secure-random-bytes');
const bitwiseOR = require('bitwise-or');
const estimateCores = require('estimate-cores');
const window = require('global/window');

const BITS = 1024;

const THIRTY = new BigInteger(null);
THIRTY.fromInt(30);

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

let num = generateRandom(BITS, rng);

const workers = [];

estimateCores((error, coreCount) => {
  if (error) {
    throw error;
  }

  for (let i = 0; i < coreCount - 1; i++) {
    workers.push(work(require('../../worker')));
    workers[i].addEventListener('message', onWorkerMessage);
    workers[i].postMessage({
      hex: num.toString(16),
      workLoad: 100,
    });
  }
});

let found = false;

function onWorkerMessage(ev) {
  let progress;
  if (ev.data.fermat) {
    progress = `Finding a prime... ${Math.floor(ev.data.fermat * 100)}`;
    if (ev.currentTarget === workers[0]) {
      window.mercuryState.progress0.set(progress);
    } else if (ev.currentTarget === workers[1]) {
      window.mercuryState.progress1.set(progress);
    } else if (ev.currentTarget === workers[2]) {
      window.mercuryState.progress2.set(progress);
    }
    return;
  }

  if (ev.data.mr) {
    progress = `Verifying prime... ${Math.floor(ev.data.mr * 100)}`;
    if (ev.currentTarget === workers[0]) {
      window.mercuryState.progress0.set(progress);
    } else if (ev.currentTarget === workers[1]) {
      window.mercuryState.progress1.set(progress);
    } else if (ev.currentTarget === workers[2]) {
      window.mercuryState.progress2.set(progress);
    }
    return;
  }

  if (found) {
    return;
  }

  if (ev.data.found) {
    for (const w of workers) {
      w.terminate();
    }
    found = true;
    window.mercuryState.prime.set(new BigInteger(ev.data.prime, 16).toString());
  }

  if (num.bitLength() > BITS) {
    num = generateRandom(BITS, rng);
  }

  for (const w of workers) {
    w.postMessage({
      hex: num.toString(16),
      workLoad: 100,
    });
  }

  num.dAddOffset((100 * 30) / 8, 0);
}
