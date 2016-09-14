var document = require('global/document');
var window = require('global/window');
var mercury = require('mercury');

var Render = require('./render');

var state = mercury.struct({
  progress0: mercury.value(0),
  progress1: mercury.value(0),
  progress2: mercury.value(0),
  prime: mercury.value(0)
});

window.mercuryState = state;

mercury.app(document.body, state, Render);

require('./worker');
