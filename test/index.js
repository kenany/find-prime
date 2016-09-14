var findPrime = require('../');
var test = require('tape');
var isFunction = require('lodash.isfunction');
var BigInteger = require('bigi');

test('exports a function', function(t) {
  t.plan(1);
  t.ok(isFunction(findPrime));
});

test('returns a big integer', function(t) {
  t.plan(3);
  t.doesNotThrow(function() {
    findPrime(100, function(error, prime) {
      t.error(error);
      t.ok(prime instanceof BigInteger);
    });
  });
});
