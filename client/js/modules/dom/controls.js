define(['util/castrato'], function (bus) {

	var 
		controlState = {
			"fire": false,
			"reverse": false,
			"accelerate": false,
			"rotation": {
				"x": 0,
				"y": 0
			}
		},
		debug = false,

		// Which keys should trigger stuff
		listenKeys = ["Space", "ControlLeft", "ShiftLeft"],
		fireKeys = ["Space", "ControlLeft"],
		reverseKeys = ["ShiftLeft"],

		setState = function (prop, val, isEvent) {

			if (controlState[prop] !== val) {
				controlState[prop] = val;
				bus.emit("controls:state", controlState);
			}

		};

	/* Keyboard events */
	window.addEventListener('keydown', function (e) {
		// Ignore if not in list of interestinhg keys
		if(listenKeys.indexOf(e.code) === -1) return;
		if(fireKeys.indexOf(e.code) !== -1) setState("fire", true);
		if(reverseKeys.indexOf(e.code) !== -1) setState("reverse", true);
	});
	
	window.addEventListener('keyup', function (e) {
		// Ignore if not in list of interestinhg keys
		if(listenKeys.indexOf(e.code) === -1) return;
		if(fireKeys.indexOf(e.code) !== -1) setState("fire", false);
		if(reverseKeys.indexOf(e.code) !== -1) setState("reverse", false);
	});

	/* Mouse events */
	window.addEventListener('contextmenu', function (e) {	
		e.preventDefault();
		return false;
	});

	window.addEventListener('mousedown', function (e) {
		if(e.button == 0) {
			setState("accelerate", true);
		}
	});
	
	window.addEventListener('mouseup', function (e) {
		if(e.button == 0) {
			setState("accelerate", false);
		}
	});

	window.addEventListener('mousemove', function (e) {
		bus.emit("pointer:position", {
			x: e.clientX,
			y: e.clientY
		});
	});

	window.addEventListener('touchstart', function (e) {
		e.preventDefault();
		if(e.touches.length == 1) {
			setState("accelerate", true);	
			setState("fire", false);
		} else {
			setState("fire", true);
			setState("accelerate", false);
		}
		
	});
	
	window.addEventListener('touchend', function (e) {
		e.preventDefault();
		if(e.touches.length == 1) {
			setState("accelerate", false);
		} else if(e.touches.length == 2) {
			setState("accelerate", true);
			setState("fire", false);
		}
	});

	window.addEventListener('touchmove', function (e) {
		e.preventDefault();
		bus.emit("pointer:position", {
			x: e.touches[0].clientX,
			y: e.touches[0].clientY
		});
	});

	bus.on("pointer:vector", function (v) {
		setState("rotation", v);
	});

});