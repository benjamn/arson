var assert = require("assert");
var arson = require("../index.js");

describe("encoding and decoding", function () {
  it("should work with primitive values", function () {
    function check(value) {
      var enc = arson.encode(value);
      var dec = arson.decode(enc);

      if (isNaN(value)) {
        assert.ok(isNaN(dec));
      } else {
        assert.deepEqual(value, dec);
      }
    }

    check(0);
    check(1234);
    check(NaN);
    check(Infinity);
    check(-Infinity);
    check(true);
    check(false);
    check("asdf");
    check("");
    check(null);
    check(void 0);
    check({ foo: void 0 });
  });

  it("should work with RegExp objects", function () {
    var r1 = /asdf/ig;
    var r2 = arson.decode(arson.encode(r1));
    assert.ok(r2 instanceof RegExp);
    assert.strictEqual(r2.source, "asdf");
    assert.strictEqual(r2.ignoreCase, true);
    assert.strictEqual(r2.multiline, false);
    assert.strictEqual(r2.global, true);
    assert.ok(r2.test("xxx-asdf-yyy"));
  });

  it("should work with Date objects", function () {
    var d1 = new Date;
    var d2 = arson.decode(arson.encode(d1));
    assert.ok(d2 instanceof Date);
    assert.strictEqual(+d1, +d2);

    var dObj = arson.decode(arson.encode({ foo: d1, bar: [d1, d1] }));
    assert.strictEqual(+d1, +dObj.foo);
    assert.strictEqual(+d1, +dObj.bar[0]);
    assert.strictEqual(+d1, +dObj.bar[1]);
    assert.strictEqual(dObj.foo, dObj.bar[0]);
    assert.strictEqual(dObj.foo, dObj.bar[1]);
  });

  it("should work with Buffer objects", function () {
    var b = new Buffer("asdf");
    var bb = arson.decode(arson.encode([b, b]));
    assert.strictEqual(bb[0], bb[1]);
    assert.ok(bb[0] instanceof Buffer);
    assert.strictEqual(bb[0].toString("utf8"), "asdf");
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
