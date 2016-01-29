var UNDEFINED_INDEX = -1;
var ARRAY_HOLE_INDEX = -2;

function encode(value) {
  return JSON.stringify(tabulate(value));
}

function tabulate(value) {
  var values = [];
  var table = [];
  var indexMap = typeof Map === "function" && new Map;

  function getIndex(value) {
    if (typeof value === "undefined") {
      // An out-of-bounds array access always returns undefined!
      return UNDEFINED_INDEX;
    }

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

  function copy(value) {
    var result = value;

    if (value && typeof value === "object") {
      var keys = Object.keys(value);

      if (Array.isArray(value)) {
        result = Array(value.length);
        var len = value.length;
        if (len > keys.length) {
          // The array has holes, so make sure we fill them with the
          // ARRAY_HOLE_INDEX constant.
          for (var i = 0; i < len; ++i) {
            result[i] = ARRAY_HOLE_INDEX;
          }
        }
      } else {
        result = {};
      }

      keys.forEach(function (key) {
        result[key] = getIndex(value[key]);
      });
    }

    return result;
  }

  // Note that this for loop cannot be a forEach loop, because
  // values.length is expected to change during iteration.
  for (var v = 0; v < values.length; ++v) {
    table[v] = copy(values[v]);
  }

  return table;
}

function decode(encoding) {
  var table = JSON.parse(encoding);

  table.forEach(function (entry) {
    if (entry && typeof entry === "object") {
      Object.keys(entry).forEach(function (key) {
        var index = entry[key];
        if (index === ARRAY_HOLE_INDEX) {
          delete entry[key];
        } else {
          entry[key] = table[index];
        }
      });
    }
  });

  return table[0];
}

exports.encode = exports.stringify = encode;
exports.decode = exports.parse = decode;
