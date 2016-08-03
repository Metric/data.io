var events = require('events');
var wss = require('ws').Server;
var async = require('async');
var Socket = require('./lib/Socket');
var http = require('http');
var https = require('https');

var DataIO = function() {
  this.sockets = [];
  this.init.apply(this, arguments);
};

DataIO.prototype = Object.create(events.EventEmitter.prototype);

//The only event that is ever emitted from DataIO main is: connection, for
//when a new socket client connects
//all other events are handled by the socket itself.
DataIO.prototype.init = function(uri) {
  var _this = this;
  if(typeof uri == 'string') {
    this.wss = new wss({host: uri});
  }
  else if(typeof uri == 'number') {
    //this is a port
    //use default host
    this.wss = new wss({port: uri});
  }
  else if(typeof uri == 'object') {
    //then it must be an Express.js server / http server / https server
    this.wss = new wss({server: uri});
  }
  else {
    this.wss = new wss({port: 8080});
  }

  this.wss.on('connection', function(ws) {
    var socket = new Socket(ws);
    _this.sockets.push(socket);

    socket.on('close', function() {
        _this.sockets.splice(_this.sockets.indexOf(this), 1);
    });

    _this._emit('connection', socket);
  });

  return this;
};

// emit the event and data to all connected sockets
DataIO.prototype._emit = DataIO.prototype.emit;
DataIO.prototype.emit = function() {
  var _this = this;
  var args = Array.prototype.slice.apply(arguments);

  async.each(this.sockets, function(socket, cb) {
    socket.emit.apply(socket, args);
    cb();
  }, function(er) {

  });

  return this;
};

module.exports = exports = DataIO;
