define(['util/castrato'], function (bus) {

	var 
		keyStates = {},
		debug = false;

	window.addEventListener('keydown', function (e) {
		if(!keyStates[e.code]) {
			keyStates[e.code] = true;
			bus.emit("keys:change", keyStates);
		} else {
			keyStates[e.code] = true;
		}
		
		if( debug ) console.log('Key down: ',e.code);
	});
	
	window.addEventListener('keyup', function (e) {
		if(keyStates[e.code]) {
			delete keyStates[e.code];
			bus.emit("keys:change", keyStates);
		} else {
			delete keyStates[e.code];
		}

		if( debug ) console.log('Key up: ',e.code);
	});

});