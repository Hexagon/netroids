define(['util/castrato'], function (bus) {

	var 
		controlState = {

			"fire": false,
			"reverse": false,
			"accelerate": false,

			"rapid": false,
			"spread": false,
			"damage": false,

			"rotation": {
				"x": 0,
				"y": 0
			}
		},
		lastMouseMove = new Date().getTime(),
		debug = false,

		// Which keys should trigger stuff
		listenKeys = ["Space", "ControlLeft", "ShiftLeft", "Digit1", "Digit2", "Digit3"],
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
		if(e.code == "Digit1") setState("rapid", true);
		if(e.code == "Digit2") setState("spread", true);
		if(e.code == "Digit3") setState("damage", true);
	});
	
	window.addEventListener('keyup', function (e) {
		// Ignore if not in list of interestinhg keys
		if(listenKeys.indexOf(e.code) === -1) return;
		if(fireKeys.indexOf(e.code) !== -1) setState("fire", false);
		if(reverseKeys.indexOf(e.code) !== -1) setState("reverse", false);
		if(e.code == "Digit1") setState("rapid", false);
		if(e.code == "Digit2") setState("spread", false);
		if(e.code == "Digit3") setState("damage", false);
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
		let ts = new Date().getTime();
		//if (ts - lastMouseMove > 15 ) {
			bus.emit("pointer:position", {
				x: e.clientX,
				y: e.clientY
			});
		//	lastMouseMove = ts;
		//}
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
		if(e.touches.length == 0) {
			setState("accelerate", false);
		} else if(e.touches.length == 1) {
			setState("accelerate", true);
			setState("fire", false);
		}
	});

	window.addEventListener('touchmove', function (e) {
		e.preventDefault();
		let ts = new Date().getTime();
		if (ts - lastMouseMove > 100 ) { 
			bus.emit("pointer:position", {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY
			});
			lastMouseMove = ts;
		}
	});

	bus.on("pointer:vector", function (v) {
		setState("rotation", v);
	});

});