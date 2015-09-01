
var gamma = require('./gamma');

module.exports = function (s, x) {
	var coefficient = Math.pow(x, s) * gamma(s) * Math.exp(-x),
		sum = 0,
		previousSum = 0,
		k = 0;
	do {
		previousSum = sum;
		sum += Math.pow(x, k) / gamma(s + k + 1);
		k += 1;
	} while (Math.abs(sum - previousSum) > 1e-6);
	
	return coefficient * sum;
}
