# arson [![Build Status](https://travis-ci.org/benjamn/arson.svg?branch=master)](https://travis-ci.org/benjamn/arson) [![Greenkeeper badge](https://badges.greenkeeper.io/benjamn/arson.svg)](https://greenkeeper.io/)

### *AR*bitrary *S*tructured *O*bject *N*otation

_Not to be confused with the criminal act of deliberately setting fire to property!_

[JSON](http://www.json.org/) is great until you need to encode an object with circular references:
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

But that's not all! `ARSON` can also encode `undefined`, thanks to the fact that `[][-1]` is always `undefined`:
```js
> ARSON.encode({foo:undefined})
'[{"foo":-1}]'
> ARSON.decode(_)
{ foo: undefined }
```

It can also encode array *holes*:
```js
> ARSON.encode(Array(3).concat([4, 5]))
'[[-2,-2,-2,1,2],4,5]'
> ARSON.decode(_)
[ , , , 4, 5 ]
```

`Buffer`s:
```js
> ARSON.encode(new Buffer("asdf"))
'[["Buffer","YXNkZg==","base64"]]'
> ARSON.decode(_)
<Buffer 61 73 64 66>
```

`Date`s:
```js
> ARSON.encode(new Date)
'[["Date","2016-02-02T00:25:36.886Z"]]'
> ARSON.decode(_)
Mon Feb 01 2016 19:25:36 GMT-0500 (EST)
```

`RegExp`s:
```js
> ARSON.encode(/asdf/img)
'[["RegExp","asdf","img"]]'
> ARSON.decode(_)
/asdf/gim
```

`Set`s:
```js
> s = new Set
Set {}
> s.add(s)
Set { Set { Set { [Object] } } }
> ARSON.encode(s)
'[["Set",0]]'
> ARSON.decode(_)
Set { Set { Set { [Object] } } }
> _.has(_)
true
```

and `Map`s:
```js
> m = new Map
Map {}
> m.set(1234, m)
Map { 1234 => Map { 1234 => Map { 1234 => [Object] } } }
> m.set(m, 5678)
Map {
  1234 => Map {
    1234 => Map {
      1234 => [Object],
      [Object] => 5678
    },
    Map {
      1234 => [Object],
      [Object] => 5678
    } => 5678
  },
  Map {
    1234 => Map {
      1234 => [Object],
      [Object] => 5678
    },
    Map {
      1234 => [Object],
      [Object] => 5678
    } => 5678
  } => 5678
}
> ARSON.encode(m)
'[["Map",1,2],[3,0],[0,4],1234,5678]'
> ARSON.decode(_)
Map {
  1234 => Map {
    1234 => Map {
      1234 => [Object],
      [Object] => 5678
    },
    Map {
      1234 => [Object],
      [Object] => 5678
    } => 5678
  },
  Map {
    1234 => Map {
      1234 => [Object],
      [Object] => 5678
    },
    Map {
      1234 => [Object],
      [Object] => 5678
    } => 5678
  } => 5678
}
> _.get(_.get(1234)) === 5678
true
```
