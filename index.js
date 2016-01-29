exports.encode = exports.stringify = function (value) {
  var values = [value];
  var table = [];

  for (var v = 0; v < values.length; ++v) {
    value = values[v];
    if (value && typeof value === "object") {
      var copy = table[v] = Array.isArray(value) ? [] : {};
      Object.keys(value).forEach(function (key) {
        var child = value[key];
        var index = values.indexOf(child);
        if (index < 0) {
          index = values.push(child) - 1;
        }
        copy[key] = index;
      });
    } else {
      table[v] = value;
    }
  }

  return JSON.stringify(table);
};

exports.decode = exports.parse = function (encoding) {
  var table = JSON.parse(encoding);

  table.forEach(function (entry) {
    if (entry && typeof entry === "object") {
      Object.keys(entry).forEach(function (key) {
        entry[key] = table[entry[key]];
      });
    }
  });

  return table[0];
};
