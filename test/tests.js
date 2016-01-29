var assert = require("assert");
var arson = require("../index.js");

describe("encoding and decoding", function () {
  it("should work with primitive values", function () {
    function check(value) {
      assert.strictEqual(arson.decode(arson.encode(value)), value);
    }

    check(0);
    check(1234);
    check(true);
    check(false);
    check("asdf");
    check("");
    check(null);

    // TODO It would be nice if these cases worked:
    // check(void 0);
    // check(/asdf/);
  });

  it("should work with circular references", function () {
    var obj = {};
    obj.self = obj;
    var result = arson.decode(arson.encode(obj));
    assert.notStrictEqual(result, obj);
    assert.strictEqual(result.self, result);
  });

  it("should work with repeated references", function () {
    var a = {};
    var b = { foo: 42 };
    a.x = a.y = b;
    var result = arson.decode(arson.encode(a));
    assert.strictEqual(result.x, result.y);
  });
});
