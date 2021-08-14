const test = require('tape');
const isFunction = require('lodash.isfunction');
const BigInteger = require('bigi');

const findPrime = require('../');

test('exports a function', (t) => {
  t.plan(1);
  t.ok(isFunction(findPrime));
});

test('returns a big integer', (t) => {
  t.plan(3);
  t.doesNotThrow(() => {
    findPrime(100, (error, prime) => {
      t.error(error);
      t.ok(prime instanceof BigInteger);
    });
  });
});
