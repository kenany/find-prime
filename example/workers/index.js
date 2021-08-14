const document = require('global/document');
const window = require('global/window');
const mercury = require('mercury');

const Render = require('./render');

const state = mercury.struct({
  progress0: mercury.value(0),
  progress1: mercury.value(0),
  progress2: mercury.value(0),
  prime: mercury.value(0)
});

window.mercuryState = state;

mercury.app(document.body, state, Render);

require('./worker');
