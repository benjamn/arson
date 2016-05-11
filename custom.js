var toString = Object.prototype.toString;
var dateTag = "[object Date]";
var regExpTag = "[object RegExp]";
var setTag = "[object Set]";
var mapTag = "[object Map]";

var arson = require("./index.js");

typeof Buffer === "function" &&
typeof Buffer.isBuffer === "function" &&
arson.registerType("Buffer", {
  deconstruct: function (buf) {
    return Buffer.isBuffer(buf) && [buf.toString("base64"), "base64"];
  },

  // The reconstruct function will be called twice: once with no
  // arguments, which allows it to return a placeholder object reference;
  // and once with one argument, a copy of the array returned by the
  // deconstruct function. For immutable types like Buffer, Date, and
  // RegExp, the reconstruct function should return a falsy value when it
  // receives no arguments, since there is no way to create an empty
  // Buffer or Date and later fill in its contents.  For container types
  // like Map and Set, the reconstruct function must return an empty
  // instance of the container when it receives no arguments, so that we
  // can fill in that empty container later. This two-phased strategy is
  // essential for decoding containers that contain themselves.
  reconstruct: function (args) {
    return args && new Buffer(args[0], args[1]);
  }
});

arson.registerType("Date", {
  deconstruct: function (date) {
    return toString.call(date) === dateTag && [date.toJSON()];
  },

  reconstruct: function (args) {
    return args && new Date(args[0]);
  }
});

arson.registerType("RegExp", {
  deconstruct: function (exp) {
    if (toString.call(exp) === regExpTag) {
      var args = [exp.source];
      var flags = "";

      if (exp.ignoreCase) flags += "i";
      if (exp.multiline) flags += "m";
      if (exp.global) flags += "g";

      if (flags) {
        args.push(flags);
      }

      return args;
    }
  },

  reconstruct: function (args) {
    return args && new RegExp(args[0], args[1]);
  }
});

typeof Set === "function" &&
typeof Array.from === "function" &&
arson.registerType("Set", {
  deconstruct: function (set) {
    if (toString.call(set) === setTag) {
      return Array.from(set);
    }
  },

  reconstruct: function (values) {
    if (values) {
      values.forEach(this.add, this);
    } else {
      return new Set;
    }
  }
});

typeof Map === "function" &&
typeof Array.from === "function" &&
arson.registerType("Map", {
  deconstruct: function (map) {
    if (toString.call(map) === mapTag) {
      return Array.from(map);
    }
  },

  reconstruct: function (entries) {
    if (entries) {
      entries.forEach(function (entry) {
        this.set(entry[0], entry[1]);
      }, this);
    } else {
      return new Map;
    }
  }
});
