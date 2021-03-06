'use strict';

const EventEmitter = require('events').EventEmitter;
const WS = require('ws');

class Socket extends EventEmitter {
    constructor(ws,ip) {
        super();

        this.remoteAddress = ip;
        this.ws = null;
        this._init(ws);
    }

    _init(ws) {
        this.ws = ws;

        if(this.ws) {
            this.ws.on('message', (msg) => {
                this._parse(msg);
            });
            this.ws.on('close', () => {
                this._emit('close');
            });
            this.ws.on('open', () => {
                this._emit('connect');
            });
            this.ws.on('error', (er) => {
                this._emit('error', er);
            });
        }
    }

    get connected() {
        if(this.ws) {
            return this.ws.readyState == this.ws.OPEN;
        }

        return false;
    }

    close() {
        if(this.ws) {
            this.ws.close();
        }

        return this;
    }

    _emit(...args) {
        super.emit.apply(this, args);
    }

    _parse(msg) {
        const _this = this;
        var packet = JSON.parse(msg);
        if(packet.name && typeof packet.name == 'string'
            && packet.data && Array.isArray(packet.data)) {
            var data = [packet.name];
            data = data.concat(packet.data);
            this._emit.apply(this, data);
        }
        else {
            this._emit('error', new Error('Invalid Packet Received: ' + msg));
        }
    }

    emit(name, ...args) {
        var packet = {
            name: name,
            data: args
        };

        if(this.connected) {
            this.ws.send(JSON.stringify(packet), (er) => {
                if(er) {
                    this._emit('error', er);
                }
            });
        }

        return this;
    }
}

Socket.create = (uri) => {
    return new Socket(new WS(uri));
};

module.exports = exports = Socket;