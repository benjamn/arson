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
      var ctor = value.constructor;

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

      } else if (ctor &&
                 ctor.name !== "Object" &&
                 typeof global[ctor.name] === "function") {
        var cname = ctor.name;

        // If value is not a plain Object, but something exotic like a
        // Date or a RegExp, then we serialize it as an array with the
        // String value.constructor.name as its first element. These
        // arrays can be distinguished from normal arrays, because all
        // other non-empty arrays will be serialized with a numeric value
        // as their first element.
        result = [cname];

        // Any elements following the first element of the result array
        // represent arguments that should be passed to the constructor
        // when the serialized object is deserialized.
        if (cname === "Date") {
          // If result is ["Date", '2016-01-30T01:50:19.287Z'], then
          // arson.decode will deserialize the value by evaluating the
          // expression new global.Date('2016-01-30T01:50:19.287Z').
          result.push(value.toJSON());

        } else if (cname === "RegExp") {
          result.push(value.source);

          var flags = "";
          if (value.ignoreCase) flags += "i";
          if (value.multiline) flags += "m";
          if (value.global) flags += "g";
          if (flags) {
            result.push(flags);
          }

        } else if (cname === "Buffer") {
          result.push(value.toString("base64"), "base64");
        }

        return result;

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
  var objectEntries = [];

  // First pass: make sure all exotic object arrays are deserialized fist,
  // and keep track of all plain object entries for later.
  table.forEach(function (entry, index) {
    if (entry && typeof entry === "object") {
      if (Array.isArray(entry) &&
          typeof entry[0] === "string") {
        var ctor = global[entry[0]];
        entry[0] = null;
        table[index] = new (ctor.bind.apply(ctor, entry));
      } else {
        objectEntries.push(entry);
      }
    }
  });

  // Second pass: deserialize all the plain object entries found above.
  objectEntries.forEach(function (entry) {
    Object.keys(entry).forEach(function (key) {
      var index = entry[key];
      if (index === ARRAY_HOLE_INDEX) {
        delete entry[key];
      } else {
        entry[key] = table[index];
      }
    });
  });

  return table[0];
}

exports.encode = exports.stringify = encode;
exports.decode = exports.parse = decode;
