
(function() {
	/**
	 * mappage de la souris
	 * @param button {integer} client button number
	 */
	function mouseButtonMap(button) {
		switch(button) {
		case 0:
			return 1;
		case 2:
			return 2;
		default:
			return 0;
		}
	};
	
	/**
	 * Mstsc client
	 * gerer les entrer du client connecter
	 * bitmap processing pour le logo permet d'utiliser les svg
	 * @param canvas {canvas} rendering element
	 */
	function Client(canvas) {
		this.canvas = canvas;
		// create renderer
		this.render = new Mstsc.Canvas.create(this.canvas); 
		this.socket = null;
		this.activeSession = false;
		this.install();
	}
	
	Client.prototype = {
		install : function () {
			var self = this;
			// permet de lier les event de deplacement de la souris
			this.canvas.addEventListener('mousemove', function (e) {
				if (!self.socket) return;
				
				var offset = Mstsc.elementOffset(self.canvas);
				self.socket.emit('mouse', e.clientX - offset.left, e.clientY - offset.top, 0, false);
				e.preventDefault || !self.activeSession();
				return false;
			});
			this.canvas.addEventListener('mousedown', function (e) {
				if (!self.socket) return;
				
				var offset = Mstsc.elementOffset(self.canvas);
				self.socket.emit('mouse', e.clientX - offset.left, e.clientY - offset.top, mouseButtonMap(e.button), true);
				e.preventDefault();
				return false;
			});
			this.canvas.addEventListener('mouseup', function (e) {
				if (!self.socket || !self.activeSession) return;
				
				var offset = Mstsc.elementOffset(self.canvas);
				self.socket.emit('mouse', e.clientX - offset.left, e.clientY - offset.top, mouseButtonMap(e.button), false);
				e.preventDefault();
				return false;
			});
			this.canvas.addEventListener('contextmenu', function (e) {
				if (!self.socket || !self.activeSession) return;
				
				var offset = Mstsc.elementOffset(self.canvas);
				self.socket.emit('mouse', e.clientX - offset.left, e.clientY - offset.top, mouseButtonMap(e.button), false);
				e.preventDefault();
				return false;
			});
			this.canvas.addEventListener('DOMMouseScroll', function (e) {
				if (!self.socket || !self.activeSession) return;
				
				var isHorizontal = false;
				var delta = e.detail;
				var step = Math.round(Math.abs(delta) * 15 / 8);
				
				var offset = Mstsc.elementOffset(self.canvas);
				self.socket.emit('wheel', e.clientX - offset.left, e.clientY - offset.top, step, delta > 0, isHorizontal);
				e.preventDefault();
				return false;
			});
			this.canvas.addEventListener('mousewheel', function (e) {
				if (!self.socket || !self.activeSession) return;
				
				var isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
				var delta = isHorizontal?e.deltaX:e.deltaY;
				var step = Math.round(Math.abs(delta) * 15 / 8);
				
				var offset = Mstsc.elementOffset(self.canvas);
				self.socket.emit('wheel', e.clientX - offset.left, e.clientY - offset.top, step, delta > 0, isHorizontal);
				e.preventDefault();
				return false;
			});
			
			// idem mais pour le clavier
			window.addEventListener('keydown', function (e) {
				if (!self.socket || !self.activeSession) return;
				
				self.socket.emit('scancode', Mstsc.scancode(e), true);

				e.preventDefault();
				return false;
			});
			window.addEventListener('keyup', function (e) {
				if (!self.socket || !self.activeSession) return;
				
				self.socket.emit('scancode', Mstsc.scancode(e), false);
				
				e.preventDefault();
				return false;
			});
			
			return this;
		},
		/**
		 * connect fonction
		 * @param ip {string} ip target for rdp
		 * @param domain {string} microsoft domain
		 * @param username {string} session username
		 * @param password {string} session password
		 * @param next {function} asynchrone end callback
		 */
		connect : function (ip, domain, username, password, next) {
			
			var parts = document.location.pathname.split('/')
		      , base = parts.slice(0, parts.length - 1).join('/') + '/'
		      , path = base + 'socket.io';
			
			
			// demare la  connection
			var self = this;
			this.socket = io(window.location.protocol + "//" + window.location.host, { "path": path }).on('rdp-connect', function() {
				
				console.log('[mstsc.js] connected');
				self.activeSession = true;
			}).on('rdp-bitmap', function(bitmap) {
				console.log('[mstsc.js] bitmap update bpp : ' + bitmap.bitsPerPixel);
				self.render.update(bitmap);
			}).on('rdp-close', function() {
				next(null);
				console.log('[mstsc.js] close');
				self.activeSession = false;
			}).on('rdp-error', function (err) {
				next(err);
				console.log('[mstsc.js] error : ' + err.code + '(' + err.message + ')');
				self.activeSession = false;
			});
			
			// evoie les infos event sur le serveur node
			this.socket.emit('infos', {
				ip : ip, 
				port : 3389, 
				screen : { 
					width : this.canvas.width, 
					height : this.canvas.height 
				}, 
				domain : domain, 
				username : username, 
				password : password, 
				locale : Mstsc.locale()
				
			});
		
		}
	}
	
	Mstsc.client = {
		create : function (canvas) {
			return new Client(canvas);
		}
	}
})();
