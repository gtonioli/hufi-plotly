const express = require('express');
const bodyParser = require('body-parser');
const phantom = require('./serverSidePhantom');
const app = express();

app.use(bodyParser.json());

app.post('/', async function (req, res) {
  const base64 = await phantom.plotly(req.body.data, req.body.layout || false);
  res.json({
    base64: base64
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
});
