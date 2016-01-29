function encode(value) {
  return JSON.stringify(tabulate(value));
}

function tabulate(value) {
  var values = [];
  var table = [];
  var indexMap = typeof Map === "function" && new Map;

  function getIndex(value) {
    var index;

    if (indexMap) {
      // If we have Map, use it instead of values.indexOf to accelerate
      // object lookups.
      index = indexMap.get(value);
      if (typeof index === "undefined") {
        index = values.push(value) - 1;
        indexMap.set(value, index);
      }
    } else {
      index = values.indexOf(value);
      if (index < 0) {
        index = values.push(value) - 1;
      }
    }

    return index;
  }

  // Assign the root value to values[0].
  getIndex(value);

  for (var v = 0; v < values.length; ++v) {
    value = values[v];

    if (value && typeof value === "object") {
      var copy = table[v] = Array.isArray(value) ? [] : {};
      Object.keys(value).forEach(function (key) {
        copy[key] = getIndex(value[key]);
      });
    } else {
      table[v] = value;
    }
  }

  return table;
}

function decode(encoding) {
  var table = JSON.parse(encoding);

  table.forEach(function (entry) {
    if (entry && typeof entry === "object") {
      Object.keys(entry).forEach(function (key) {
        entry[key] = table[entry[key]];
      });
    }
  });

  return table[0];
}

exports.encode = exports.stringify = encode;
exports.decode = exports.parse = decode;
