var events = require('events');
var util = require('util');
var http = require('http');
var ws = require('ws');
var websocket = require('websocket-stream');
var pkgcloud = require('pkgcloud');

var WebSocketServer = ws.Server;

module.exports = Hades;

util.inherits(Hades, events.EventEmitter);

function Hades(options) {
  if(!this instanceof Hades) {
    return new Hades(options);
  }
  events.EventEmitter.call(this);

  this.pkgcloudOpts = options.pkgcloud;

  if(!this.pkgcloudOpts) {
    this.emit('error', new Error('pkgcloud options are required'));
    return process.exit();
  }

  this.pkgcloud = pkgcloud.storage.createClient(this.pkgcloudOpts);

  this.pkgcloud.on('error', this.emit.bind('error'));

  this.server = http.createServer(this._requestHandler.bind(this));

  this.wss = new WebSocketServer({server: this.server});

  this.wss.on('connection', this._onSocketConnect.bind(this));

}

Hades.prototype.listen = function (port, callback) {
  this.server.listen(port, callback);
};

Hades.prototype._requestHandler = function (req, res) {
  res.writeHead(500);
  res.end('Not available right now\n');
};

Hades.prototype._onSocketConnect = function (socket) {
  var stream = websocket(socket);

  var upload = this.pkgcloud.upload();

  stream.pipe(upload);
};

