# couchdb-sync

It's an ugly module, needs lot of a refactoring, i mainly ported @dominictarr's [level-couch-sync][lcs] to a general sync module.

I did this because I'm trying to replicate npmjs registry to riak.

# API

```js
var sync = require("couchdb-sync")("https://fullfatdb.npmjs.com/registry");
sync
  .on( "data", function( doc ){
    // doc is a couchdb doc
  })
  .on( "progress", function( progress ){
    // progress of replication
  })
  .on( "fail", function( err ){
    // ohhh uhhh npm is down?!:D
  });
```

It emits `data` and `progress` events, and you can even pause and resume syncing by calling `instance.feed.pause()` and `instance.feed.resume()` methods. (It can be useful if data comes too fast).

[lcs][https://github.com/dominictarr/level-couch-sync]