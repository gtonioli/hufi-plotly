var page = new WebPage();
var system = require('system');
var args = system.args;

var props = {};
args.forEach(function (arg, i) {
  var splits = arg.split('=');
  var name = splits[0].replace('--', '');
  var value = splits[1];
  props[name] = value;
});

var assetsPath = props['assetsPath'];

var layout = props['layout'];
if (layout) {
  layout = atob(layout);
}

var data = props['data'];
if (data) {
  data = atob(data);
} else {
  system.stderr.write("Missing plotly plotting data");
  phantom.exit(1);
}

page.onError = function (error) {
  system.stderr.write(error);
  phantom.exit(1);
};

page.open("file:///" + assetsPath + "/html/index.html", function (status) {
  if (status !== "success") {
    system.stderr.write("Failed to open index.html");
    phantom.exit(1);
    return;
  }

  const jquery = page.injectJs(assetsPath + "/js/jquery.min.js");
  const plotly = page.injectJs(assetsPath + "/js/plotly.min.js");

  if (!jquery || !plotly) {
    system.stderr.write("Failed to load dependencies");
    phantom.exit(1);
  }

  page.viewportSize = {width: 1400, height: 900};

  var clipRect = page.evaluate(function (data, layout) {
    try {
      data = JSON.parse(data);
    } catch (e) {
      system.stderr.write(e);
      phantom.exit(1);
    }

    var plotObject = {
      data: data.payload
    };

    if (layout) {
      try {
        var wrapper = JSON.parse(layout);
        plotObject.layout = wrapper.layout;
      } catch (e) {
        system.stderr.write(e);
        phantom.exit(1);
      }
    }

    Plotly.newPlot('chart', plotObject);

    return document.querySelector('#chart .svg-container').getBoundingClientRect();
  }, data, layout);

  page.clipRect = {
    top: clipRect.top,
    left: clipRect.left,
    width: clipRect.width,
    height: clipRect.height
  };

  var base64 = page.renderBase64('PNG');
  system.stdout.write(base64);
  phantom.exit();
});
