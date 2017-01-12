define(['dom/controls', 'dom/hud'], function (controls, hud) {

	var views = {
			loading: document.getElementById('loading'),
			/*login: document.getElementById('login'),*/
			game: document.getElementById('game')
		},
		elements = {
			loadstatus: document.getElementById('loadstatus'),
			join: document.getElementById('join'),
			nick: document.getElementById('nick'),
			status: document.getElementById('status'),
			ready: document.getElementById('ready')
				
		}

		hideAllViews = function (elms, defaultClass) {
			Object.keys(views).forEach(function (viewName) {
				if(views[viewName].className.indexOf(' hidden') === -1 ) {
					views[viewName].className = views[viewName].className + ' hidden';
				}
			});
		},

		show = function (elm) {
			elm.className = (elm.className || "").replace(/hidden/g,'');
		},

		hide = function (elm) {
			elm.className = (elm.className || "").replace(/hidden/g,'') + ' hidden';
		},

		htmlEncode = function (text) {
			 return text
			 			.replace(/&/g, '&amp;')
			 			.replace(/"/g, '&quot;')
			 			.replace(/'/g, '&#39;')
			 			.replace(/</g, '&lt;')
			 			.replace(/>/g, '&gt;');
		};

	// Set window title
	document.title = document.title + ' ' + netroidsRelease + ' - ' + netroidsVersion;

	return {
		show: function (view) {
			hideAllViews();
			show(views[view]);
		},
		showElement: function (element) {
			show(elements[element]);
		},
		hideElement: function (element) {
			hide(elements[element]);
		},
		focus: function (element) {
			elements[element].focus();
		},
		clearLoadStatus: function () {
			elements.loadstatus.innerHTML = "";
		},
		addLoadStatus: function (text) {
			elements.loadstatus.innerHTML += "<h4>" + text + "</h4>";
		},
		on: function (elm, ev, fn) {	
			elements[elm].addEventListener(ev, fn);
		},
		value: function (elm) {
			return htmlEncode(elements[elm].value);
		}
	};

});