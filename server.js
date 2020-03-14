//Section d'importation des modules et des varriable
var express = require('express');
var http = require('http');
var app = express();
var portsrv = 4242

//Permet d'envoyer le page web au client
app.use(express.static(__dirname + '/client'))
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/html/index.html');
});

//permet de demarer le serveur sur le port 4242
console.log('Demarage du serveur...')
var server = http.createServer(app).listen(process.env.PORT || portsrv);
console.log('Serveur:[OK]		bind: '+portsrv)
console.log('Envoie de la page web:'+__dirname + '/client/html/index.html')
require('./server/mstsc')(server);
