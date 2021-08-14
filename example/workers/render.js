const mercury = require('mercury');

const h = mercury.h;

function render(state) {
  return h('div.Container', [
    h('p', state.progress0 + '%'),
    h('p', state.progress1 + '%'),
    h('p', state.progress2 + '%'),
    h('p', state.prime)
  ]);
}

module.exports = render;
