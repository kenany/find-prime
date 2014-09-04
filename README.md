# find-prime

[![Build Status](https://img.shields.io/travis/KenanY/find-prime.svg)](https://travis-ci.org/KenanY/find-prime)
[![Dependency Status](https://img.shields.io/gemnasium/KenanY/find-prime.svg)](https://gemnasium.com/KenanY/find-prime)

Find a prime.

## Example

``` javascript
var findPrime = require('find-prime');

findPrime(100, function(error, prime) {
  console.log(prime.toString());
  // => '1191049104492544277555931735013'
});
```

## Installation

``` bash
$ npm install find-prime
```

## API

``` javascript
var findPrime = require('find-prime');
```

### `findPrime(bits, [options], callback)`

Searches for a possible prime number of size `bits`. Calls
`callback(error, bigint)` when a candidate has been found. `bigint` is an
instance of [bigi][].

Through the optional `options` _Object_, you can set the maximum amount of time
to block the main thread (`options.maxBlockTime`) and the number of
[Miller-Rabin tests][] to run (`options.millerRabinTests`).


   [bigi]: https://github.com/cryptocoinjs/bigi
   [Miller-Rabin tests]: https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test