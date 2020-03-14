//section des module
var rdp = require('node-rdpjs');

/**
 * permet de creer un proxy entre la couche rdp et socket.io
 * @param server {http(s).Server} http server
 */
//script core permet le retour des info au client pour voir ce que utilisateur envoie position sourie clavier ....
module.exports = function (server) {
	var io = require('socket.io')(server);
	io.on('connection', function(client) {
		var rdpClient = null;
		client.on('infos', function (infos) {
			if (rdpClient) {
				// clean older connection
				rdpClient.close();
			};
			
			rdpClient = rdp.createClient({ 
				domain : infos.domain, 
				userName : infos.username,
				password : infos.password,
				enablePerf : true,
				autoLogin : true,
				screen : infos.screen,
				locale : infos.locale,
				logLevel : process.argv[2] || 'INFO'
			}).on('connect', function () {
				client.emit('rdp-connect');
			}).on('bitmap', function(bitmap) {
				client.emit('rdp-bitmap', bitmap);
			}).on('close', function() {
				client.emit('rdp-close');
			}).on('error', function(err) {
				client.emit('rdp-error', err);
			}).connect(infos.ip, infos.port);
		}).on('mouse', function (x, y, button, isPressed) {
			if (!rdpClient)  return;

			rdpClient.sendPointerEvent(x, y, button, isPressed);
		}).on('wheel', function (x, y, step, isNegative, isHorizontal) {
			if (!rdpClient) {
				return;
			}
			rdpClient.sendWheelEvent(x, y, step, isNegative, isHorizontal);
		}).on('scancode', function (code, isPressed) {
			if (!rdpClient) return;

			rdpClient.sendKeyEventScancode(code, isPressed);
		}).on('unicode', function (code, isPressed) {
			if (!rdpClient) return;

			rdpClient.sendKeyEventUnicode(code, isPressed);
		}).on('disconnect', function() {
			if(!rdpClient) return;

			rdpClient.close();
		});
	});
}
