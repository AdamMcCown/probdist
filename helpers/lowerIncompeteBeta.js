
var gamma = require('./gamma'),
	factorial = require('./factorial');

module.exports = function (x, a, b) {
	var sum = 0,
		previousSum = 0,
		n = 0;
	do {
		previousSum = sum;
		sum += (pochhammer(1 - b, n) / (factorial(n) * (a + n))) 
				* Math.pow(x, n);
		n += 1;
	} while (Math.abs(sum - previousSum) > 1e-6 && sum !== Infinity);
	
	return sum === Infinity ?
			Math.pow(x, a) * previousSum : 
			Math.pow(x, a) * sum;
}

function pochhammer(x, n) {
	var product = 1,
		i;
	for (i = 0; i < n; i += 1) {
		product *= (x + i);
	}
	return product;
}