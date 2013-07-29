var events = require('events');
var util = require('util');
var http = require('http');
var primus = require('primus');
var pkgcloud = require('pkgcloud');

var WebSocketServer = ws.Server;

module.exports = Hades;

util.inherits(Hades, events.EventEmitter);

function Hades(options) {
  if(!this instanceof Hades) { return new Hades(options) }
  events.EventEmitter.call(this);

  this.pkgcloudOpts = options.pkgcloud;

  if(!this.pkgcloudOpts) {
    return this.emit('error', new Error('pkgcloud options are required'));
  }

  this.pkgcloud = pkgcloud.storage.createClient(this.pkgcloudOpts);
  this.pkgcloud.on('error', this.emit.bind(this, 'error'));

  this.server = http.createServer(this._requestHandler.bind(this));

  this.primus = new Primus(this.server, { parser: 'binary' });

  this.primus.on('connection', this._onSocketConnect.bind(this));
  this.primus.on('disconnection', this._onSocketDisconnect.bind(this));

}

Hades.prototype.listen = function (port, callback) {
  this.server.listen(port, callback);
};

Hades.prototype._requestHandler = function (req, res) {
  res.writeHead(500);
  res.end('Not available right now\n');
};

Hades.prototype._onSocketConnect = function (spark) {

  var file = {
    container: spark.query.container,
    remote: spark.query.file
  };
  var upload = this.pkgcloud.upload(file);

  spark.pipe(upload);
};

Hades.prototype._onSocketDisconnect = function (spark) {};
