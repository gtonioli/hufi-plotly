const express = require('express');
const exp = require('./phantomPromise');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.post('/', async function (req, res) {
    const base64 = await exp.render(req.body.data, req.body.layout || false);
    res.json({
        base64: base64
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});