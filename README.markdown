Data.io
===============

No nonsense pure event driven websocket server. With a simple data packet format that uses JSON. It is easy to create a client for any language, way easier than socket.io. You can find some pre-built ones https://github.com/metric/data.io.clients

Does not handle binary data. If you want to send binary, either base64 encode it or make sure the bytes are in a regular JavaScript Array object.

Does not queue emissions if not connected. If not connected then nothing is sent and it is ignored.

Is compatible with the latest Express.js build or a regular Node.js http or https server.

I tried to keep it as similar to socket.io as possible. So it would be easy to transition to it with minimal code changes.

I got tired of dealing with Socket.io and the fact it was so fucking complicated to build a client for other platforms and languages. Therefore, I broke Socket.io down to its essentials. I do not need JSONP or ajax fallbacks. If your browser doesn't support websockets, then sorry you are out of luck. This is a pure event driven websocket server and the only overhead is parsing JSON for transmission and receiving, plus the regular websocket protocol.

How simple is the JSON packet? See for yourself
```
{
  "event": "EventName",
  "data": [...]
}
```

Each array item in the data array corresponds to an argument in the event callback. Yep that simple.

How to Install
===============

Either download the src from here and put it in node_modules or install via npm with:
```
npm install data.io
```

Dependencies
--------------
async and ws

These should be installed automatically if using npm. Otherwise you will need to install those via npm with:
```
npm install async
npm install ws
```

Getting Started
=================

It is just like socket.io on the server side.

```
var io = require('Data.io');

var nio = new io(Express App || Http/Https Server || Port).on('connection', function(socket) {
  socket.on('whatever', function(somedata) {
    //do whatever
    socket.emit('whatever', somedata);
  });
});
```

The DataIO object only ever has one event emitted and that is: connection. It is emitted when a new socket is connected and the socket is passed as the only argument. All other events are handled by the individual sockets.

Do you need to send something to all clients at once?
```
// assuming you stored the DataIO object in the
// var nio such as the above example
nio.emit('whatever', somedata);
```

That is basically it for the server. The next section covers some finer details.

Advanced Usage
================

You can also unsubscribe from events on a socket at will or only subscribe to an event only once.

Unsubscribing from an event on a socket:
```
//You must have the original callback function
//somewhere in order to remove it.
//remember a function that uses .bind is not the same as the original function.
//.bind wraps the function in another function.
//So when using .bind make sure you save the .bind version in a variable
//in case you want to remove it as a listener.
socket.removeListener('event', originalCallbackFunction);
```
A more complete example of the above:
```
function MyClass(socket) {
  this.socket = socket;

  this.init = function() {
    this.boundOnSomething = this.onSomething.bind(this);

    this.socket.on('something', this.boundOnSomething);
  };

  this.onSomething = function(data) {
    ///do whatever
    this.socket.emit('something', data);
    //Unsubscribe but with the boundOnSomething
    this.socket.removeListener('something', this.boundOnSomething);
  };

  this.init.call(this);
}

var myclass = new MyClass(someSocket);
```

Subscribing to a socket event only once:
```
socket.once('someEvent', function(somedata) {
  //this event handler will only be called once
  //and then it will be removed automatically
  //do something...
});
```

Determining if the socket is still connected:
```
if(socket.connected) {
  //do something
}
```

Common Socket Events
=======================

1. close - emitted when the socket closes
2. error - emitted when there is an error. An error object is the only thing passed through as an argument
