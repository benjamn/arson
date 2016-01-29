var assert = require("assert");
var arson = require("../index.js");

describe("encoding and decoding", function () {
  it("should work with primitive values", function () {
    function check(value) {
      assert.deepEqual(value, arson.decode(arson.encode(value)));
    }

    check(0);
    check(1234);
    check(true);
    check(false);
    check("asdf");
    check("");
    check(null);
    check(void 0);
    check({ foo: void 0 });

    // TODO It would be nice if these cases worked:
    // check(/asdf/);
  });

  it("should work for sparse arrays", function () {
    function check(array) {
      assert.deepEqual(array, arson.decode(arson.encode(array)));
    }

    check([,]);
    check([,,]);
    check([,,,]);
    check([1,,3]);
    check([1,,3,,4]);
    check([1,,3,,4,,]);
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

  it("should work with the global object", function () {
    var copy = arson.decode(arson.encode(global));
    assert.strictEqual(copy.global, copy);
  });
});
