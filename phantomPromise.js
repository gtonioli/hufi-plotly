const path = require('path');
const phantomjs = require('phantomjs-prebuilt');
const binPath = phantomjs.path;

const phantomPromise = function (plotlyData, layout = false, debug = false) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(plotlyData)) {
            reject("Data needs to be an Array");
            return;
        }

        const plotlyDataBase64 = new Buffer(JSON.stringify({payload: plotlyData})).toString('base64');
        const dataArg = `--data=${plotlyDataBase64}`;
        const generator = path.join(__dirname, 'plotlyPhantom.js');
        const rootPath = `--rootPath=${__dirname}`;
        const childArgs = [generator, dataArg, rootPath];
        console.log(binPath, childArgs);

        if (layout) {
            const plotlyLayoutBase64 = new Buffer(JSON.stringify({layout: layout})).toString('base64');

            const layoutArg = `--layout=${plotlyLayoutBase64}`;
            childArgs.push(layoutArg);
        }

        if (debug) {
            const debugArg = `--debug=true`;
            childArgs.push(debugArg);
        }

        const phantomjsProcess = require('child_process').execFile(binPath, childArgs, function (error, stdout, stderr) {
            resolve(stdout);
        });

        phantomjsProcess.stderr.on('data', function (data) {
            reject(data);
            phantomjsProcess.kill('SIGINT');
        });
    });
};

module.exports.render = phantomPromise;