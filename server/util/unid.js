var nextId = 0;
module.exports = function () {
	return (nextId++).toString(16);
};