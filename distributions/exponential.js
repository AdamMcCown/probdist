
var distribution = require('../helpers/distribution');

module.exports = function(lambda) {
	return distribution({
		pdf: function(x) {
				return x >= 0 ?
				lambda * Math.exp(-lambda * x) :
				0;
		},
		
		mean: 1 / lambda,
		
		variance: 1 / (lambda * lambda),
		
		cdf: function (x) {
			if (x < 0) {
				return 0;
			} else if (x === Infinity) {
				return 1;
			} else {
				return 1 - Math.exp(-lambda * x);
			}
		}
	});
};