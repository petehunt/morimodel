function copyProperties(x, y) {
  for (var k in y) {
    if (!y.hasOwnProperty(k)) {
      continue;
    }
    x[k] = y[k];
  }
  return x;
}

function keyMirror(x) {
  var newObj = {};

  for (var k in x) {
    if (x.hasOwnProperty(k)) {
      newObj[k] = k;
    }
  }

  return newObj;
}

module.exports = {
  copyProperties: copyProperties,
  keyMirror: keyMirror
};