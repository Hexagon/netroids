define(['util/castrato'],function (bus) {

	var 
		keyStates = [],
		pos = {
			x: 0,
			y: 0
		},
		debug = false;

	window.addEventListener('contextmenu', function (e) {	
		e.preventDefault();
		return false;
	});

	window.addEventListener('mousedown', function (e) {
		if(!keyStates[e.button]) {
			keyStates[e.button] = true;
			pos = {
				x: e.clientX,
				y: e.clientY
			}
			bus.emit("mouse:state", {buttons: keyStates, position: pos});
		} else {
			keyStates[e.button] = true;
		}
		
		if( debug ) console.log('Mouse down: ',e.button);
	});
	
	window.addEventListener('mouseup', function (e) {
		if(keyStates[e.button]) {
			delete keyStates[e.button];
			pos = {
				x: e.clientX,
				y: e.clientY
			}
			bus.emit("mouse:state", {buttons: keyStates, position: pos});
		} else {
			delete keyStates[e.button];
		}

		if( debug ) console.log('Mouse up: ',e.button);

	});

	window.addEventListener('mousemove', function (e) {
		pos = {
			x: e.clientX,
			y: e.clientY
		}
		bus.emit("mouse:state", {buttons: keyStates, position: pos});
		if( debug ) console.log('Mouse drag: ', pos);
	});

});