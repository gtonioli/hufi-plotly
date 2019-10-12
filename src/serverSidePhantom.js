const path = require('path');
const phantomjs = require('phantomjs-prebuilt');
const binPath = phantomjs.path;

const plotly = function (data, layout = false, debug = false) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(data)) {
      reject("Data needs to be an Array");
      return;
    }

    const currentPath = path.join(__dirname, 'phantom/plotly/');
    const generator = path.join(currentPath, 'plotly.js');
    const assetsPath = "--assetsPath=" + path.join(currentPath, 'assets');
    const dataBase64 = new Buffer(JSON.stringify({payload: data})).toString('base64');
    const dataArg = `--data=${dataBase64}`;
    const childArgs = [generator, dataArg, assetsPath];

    if (layout) {
      const layoutBase64 = new Buffer(JSON.stringify({layout: layout})).toString('base64');

      const layoutArg = `--layout=${layoutBase64}`;
      childArgs.push(layoutArg);
    }

    if (debug) {
      const debugArg = `--debug=true`;
      childArgs.push(debugArg);
    }

    const phantomjsProcess = require('child_process').execFile(binPath, childArgs, function (error, stdout) {
      resolve(stdout);
    });

    phantomjsProcess.stderr.on('data', function (data) {
      reject(data);
      phantomjsProcess.kill('SIGINT');
    });
  });
};

module.exports.plotly = plotly;
