const deps = '~/.bin/.mercurywm/clock';
const html = deps + '/index.html';
const css = deps + '/flipclock.css';
const js = deps + '/flipclock.min.js';
const jquery = deps + '/jquery.js';
const initjs = deps + '/initializeClock.js';

/* Render JS first so when HTML loads, the library is loaded in */
script.exec('render ' + html + ' ' + jquery + ' ' + js + ' ' + initjs + ' ' + css);

/* Return true to mark it as async */
return true;
