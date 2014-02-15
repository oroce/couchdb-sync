"use strict";

var request = require( "request" );
var follow = require( "follow" );
var backoff = require( "backoff" ).fibonacci;
var EventEmitter = require( "events" ).EventEmitter;
var async = require( "async" );

module.exports = function( sourceUrl, seq ){
  seq = seq || 0;
  var emitter = new EventEmitter();

  var write = function( err, data ){
    if( err ){
      return emitter.emit( "fail", err );
    }

    emitter.emit( "progress", data.seq / maxSeq );
    emitter.emit( "data", data);
  };

  var onFollow = function( err, data ){
    write( err, data );
    if( err ){
      fb.backoff();
    }
    else{
      fb.reset();
    }
  };

  var feed = new (follow.Feed)({
    db: sourceUrl,
    include_docs: true,
    since: seq,
  });

  feed
    .on( "error", function( err ){
      onFollow( err );
    })
    .on( "change", function( data ){
      onFollow( null, data );
    });

  emitter.feed = feed;
  var maxSeq;

  var fb = backoff({
    randomisationFactor: 0,
    initialDelay: 1000,
    maxDelay: 30 * 1000
  });

  var followFb = backoff({
    randomisationFactor: 0,
    initialDelay: 1000,
    maxDelay: 30 * 1000
  });

  followFb.on( "ready", function(){
    feed.follow();
  });

  fb.once( "ready", function(){
    request.get({ url: sourceUrl, json: true }, function( err, _, data ){
      if( err ){
        emitter.emit( "fail", err );
        return fb.backoff();
      }

      maxSeq = data.update_seq;
      emitter.maxSeq = maxSeq;
      emitter.emit( "max", maxSeq);
      if( seq ){
        emitter.emit( "progress", seq / maxSeq);
      }
      followFb.backoff();
      fb.reset();
    });
  });
  fb.backoff();

  return emitter;
};