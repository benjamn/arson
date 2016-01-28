# arson, _n_.
> the criminal act of deliberately setting fire to property

### *AR*bitrary *S*tructured *O*bject *N*otation

JSON is great until you need to encode an object with circular references:
```js
var obj = {};
obj.self = obj;
JSON.stringify(obj); // throws
```

Throwing an exception is lame, but even worse is muddling along as if everything is ok:
```js
var a = {};
var b = { foo: 42 };
a.x = a.y = b;
var c = JSON.parse(JSON.stringify(a));
assert.strictEqual(c.x, c.y); // fails
```

We need an object notation that supports circular and repeated references.

That's where `ARSON` comes in:
```js
var a = {};
var b = { foo: 42 };
a.x = a.y = b;
var c = ARSON.parse(ARSON.stringify(a));
assert.strictEqual(c.x, c.y); // no problem!
```

`ARSON` is compact, often even more compact than JSON, because repeated objects are defined only once:
```js
var a = {};
var b = { foo: 42 };
a.x = a.y = b;
ARSON.stringify(a); // [{"x":1,"y":1},{"foo":2},42] vs.
                    // {"x":{"foo":42},"y":{"foo":42}}
```
