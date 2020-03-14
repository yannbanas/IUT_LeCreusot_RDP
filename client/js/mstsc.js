
(function() {

	
	Mstsc = function () {
	}
	
	Mstsc.prototype = {
		
		$ : function (id) {
			return document.getElementById(id);
		},
		
		
		elementOffset : function (el) {
		    var x = 0;
		    var y = 0;
		    while (el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop )) {
		        x += el.offsetLeft - el.scrollLeft;
		        y += el.offsetTop - el.scrollTop;
		        el = el.offsetParent;
		    }
		    return { top: y, left: x };
		},
		
		/**
		 * permet de destecter le navigateur web
		 * @returns {String} [firefox|chrome|ie]
		 */
		browser : function () {
			if (typeof InstallTrigger !== 'undefined') {
				return 'firefox';
			}
			
			if (!!window.chrome) {
				return 'chrome';
			}
			
			if (!!document.docuemntMode) {
				return 'ie';
			}
			
			return null;
		},
		
		/**
		 *  detect la langue
		 * @returns
		 */
		locale : function () {
			return window.navigator.userLanguage || window.navigator.language;
		}
	}
	
})();

this.Mstsc = new Mstsc();
