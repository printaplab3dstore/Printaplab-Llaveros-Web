// Creates a local test fixture. The real application access gate is unchanged.
const fs=require('node:fs');
let html=fs.readFileSync('index.html','utf8').replace('<script type="module" src="./access.mjs"></script>','');
html=html.replace('href="./access.css"','href="../access.css"');
let scenario=fs.readFileSync('tests/browser-scenario.js','utf8');
html=html.replace('</body>','<style id="fixtureAccessStyle">#accessGate{display:none!important}#studio{display:block!important}</style><script>'+scenario+'</script></body>');
fs.writeFileSync('tests/browser-check.html',html);
