var events = require('events');
var async = require('async');

var Socket = function() {
  this.ws = null;
  this.emitter = new events.EventEmitter();
  this.init.apply(this, arguments);
};

// Init with the already connected websocket.
Socket.prototype.init = function(ws) {
  var _this = this;
  this.ws = ws;
  this.connected = true;

  if(this.ws) {
    this.ws.on('message', function(message) {
      _this.handleMessage(message);
    });
    this.ws.on('close', function() {
      _this.connected = false;
      _this.broadcast('close');
    });
    this.ws.on('error', function(er) {
      _this.connected = false;
      _this.broadcast('error', er);
    });
  }

  return this;
};

// processes the incoming message and emits it
Socket.prototype.handleMessage = function(message) {
  var _this = this;
  var packet = JSON.parse(message);
  this.broadcast(packet.name, packet.data);

  return this;
};

// handles the emission of the actual incoming data
Socket.prototype.broadcast = function(event, data) {
  var emission = [event];
  emission = emission.concat(data);

  this.emitter.emit.apply(this.emitter, emission);

  return this;
};

// subscribe to an event
Socket.prototype.on = function(event, cb) {
  this.emitter.on(event, cb);

  return this;
};

// subscribe to an event for only one trigger count
Socket.prototype.once = function(event, cb) {
  this.emitter.once(event, cb);

  return this;
};

// close the socket
Socket.prototype.close = function() {
  if(this.ws) {
    this.ws.close();
  }

  return this;
};

Socket.prototype.removeListener = function(event, cb) {
  if(event && cb) {
    this.emitter.removeListener(event, cb);
  }
  
  return this;
};

// emit data to the client for the event
Socket.prototype.emit = function(name) {
  var _this = this;
  var args = [];

  if(arguments.length > 1) {
    args = Array.prototype.slice.call(arguments, 1, arguments.length);
  }

  var packet = {
    name: name,
    data: args
  };

  if(this.ws) {
    this.ws.send(JSON.stringify(packet), function(er){
      if(er) {
        _this.emitter.emit('error', er);
      }
    });
  }

  return this;
};

module.exports = exports = Socket;
