'use strict'

const EventEmitter = require('events').EventEmitter;
const WSS = require('ws').Server;
const async = require('async');
const Socket = require('./lib/socket');

class DataIO extends EventEmitter {
    constructor(uri) {
        super();

        this.sockets = [];
        this.wss = null;
        this._init(uri);
    }

    _init(uri) {
        const _this = this;

        if(typeof uri == 'string') {
            this.wss = new WSS({host: uri});
        }
        else if(typeof uri == 'number') {
            this.wss = new WSS({port: uri});
        }
        else if(typeof uri == 'object') {
            this.wss = new WSS({server: uri});
        }
        else {
            this.wss = new WSS({port: 8080});
        }

        this.wss.on('connection', (ws) => {
            console.log('socket connected');
            
            var socket = new Socket(ws);
            _this.sockets.push(socket);

            socket.on('close', () => {
                var idx = _this.sockets.indexOf(this);

                if(idx > -1) {
                    console.log('socket closed');
                    _this.sockets.splice(idx, 1);
                }
            });

            _this._emit('connection', socket);
        });
    }

    _emit() {
        var args = Array.prototype.slice.apply(arguments);
        super.emit.apply(this, args);
    }

    emit() {
        const _this = this;
        var args = Array.prototype.slice.apply(arguments);

        async.each(this.sockets, (socket, cb) => {
            socket.emit.apply(socket, args);
            cb();
        }, (er) => {
            //do nothing
        });

        return this;
    }
}

DataIO.Socket = Socket;

module.exports = exports = DataIO;