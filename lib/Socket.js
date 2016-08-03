var events = require('events');
var async = require('async');

var Socket = function() {
  this.ws = null;
  this.init.apply(this, arguments);
};

Socket.prototype = Object.create(events.EventEmitter.prototype);

Socket.prototype.connected = function() {
  if(this.ws) {
    return this.ws.readyState == this.ws.OPEN;
  }

  return false;
};

// Init with the already connected websocket.
Socket.prototype.init = function(ws) {
  var _this = this;
  this.ws = ws;

  if(this.ws) {
    this.ws.on('message', function(message) {
      _this._handleMessage(message);
    });
    this.ws.on('close', function() {
      _this._broadcast('close');
    });
    this.ws.on('error', function(er) {
      _this._broadcast('error', er);
    });
  }

  return this;
};

// processes the incoming message and emits it
Socket.prototype._handleMessage = function(message) {
  var _this = this;
  var packet = JSON.parse(message);
  if(packet.name && typeof packet.name == 'string' && packet.data && Array.isArray(packet.data)) {
    this._broadcast(packet.name, packet.data);
  }
  else {
    this._broadcast('error', new Error('Invalid Packet Received: ' + message));
  }

  return this;
};

// handles the emission of the actual incoming data
Socket.prototype._broadcast = function(event, data) {
  var emission = [event];
  emission = emission.concat(data);

  this._emit.apply(this, emission);

  return this;
};

// close the socket
Socket.prototype.close = function() {
  if(this.ws) {
    this.ws.close();
  }

  return this;
};

Socket.prototype._emit = Socket.prototype.emit;
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

  if(this.connected()) {
    this.ws.send(JSON.stringify(packet), function(er){
      if(er) {
        _this._broadcast('error', er);
      }
    });
  }

  return this;
};

module.exports = exports = Socket;
