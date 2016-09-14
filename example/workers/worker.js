var BigInteger = require('bigi');
var work = require('webworkify');
var randomBytes = require('secure-random-bytes');
var bitwiseOR = require('bitwise-or');
var estimateCores = require('estimate-cores');
var window = require('global/window');

var BITS = 1024;

var THIRTY = new BigInteger(null);
THIRTY.fromInt(30);

var rng = {
  nextBytes: function(x) {
    var b = randomBytes(x.length);
    for(var i = 0, length = x.length; i < length; ++i) {
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

var num = generateRandom(BITS, rng);

var workers = [];

estimateCores(function(error, coreCount) {
  if (error) {
    throw error;
  }

  for (var i = 0; i < coreCount - 1; i++) {
    workers.push(work(require('../../worker')));
    workers[i].addEventListener('message', onWorkerMessage);
    workers[i].postMessage({
      hex: num.toString(16),
      workLoad: 100
    });
  }
});

var found = false;

function onWorkerMessage(ev) {
  if (ev.data.fermat) {
    var progress = 'Finding a prime... ' + Math.floor(ev.data.fermat * 100);
    if (ev.currentTarget === workers[0]) {
      window.mercuryState.progress0.set(progress);
    }
    else if (ev.currentTarget === workers[1]) {
      window.mercuryState.progress1.set(progress);
    }
    else if (ev.currentTarget === workers[2]) {
      window.mercuryState.progress2.set(progress);
    }
    return;
  }

  if (ev.data.mr) {
    var progress = 'Verifying prime... ' + Math.floor(ev.data.mr * 100);
    if (ev.currentTarget === workers[0]) {
      window.mercuryState.progress0.set(progress);
    }
    else if (ev.currentTarget === workers[1]) {
      window.mercuryState.progress1.set(progress);
    }
    else if (ev.currentTarget === workers[2]) {
      window.mercuryState.progress2.set(progress);
    }
    return;
  }

  if (found) {
    return;
  }

  if (ev.data.found) {
    workers.forEach(function(w) {
      w.terminate();
    });
    found = true;
    window.mercuryState.prime.set(new BigInteger(ev.data.prime, 16).toString());
  }

  if (num.bitLength() > BITS) {
    num = generateRandom(BITS, rng);
  }

  workers.forEach(function(w) {
    w.postMessage({
      hex: num.toString(16),
      workLoad: 100
    });
  });

  num.dAddOffset(100 * 30 / 8, 0);
}
