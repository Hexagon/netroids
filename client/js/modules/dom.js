define(['dom/controls', 'dom/hud'], function (controls, hud) {

	var views = {
			loading: document.getElementById('loading'),
			login: document.getElementById('login'),
			game: document.getElementById('game')
		},
		elements = {
			status: document.getElementById('loadstatus')
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
		};

	return {
		show: function (view) {
			hideAllViews();
			show(views[view]);
		},
		clearLoadStatus: function () {
			elements.status.innerHTML = "";
		},
		addLoadStatus: function (text) {
			elements.status.innerHTML += "<h4>" + text + "</h4>";
		}
	};

});