
var distribution = require('../helpers/distribution');

module.exports = function(x0, lambda) {
	if (lambda === undefined) {
		lambda = 1;
	} 
	if (x0 === undefined) {
		x0 = 0;
	}
	
	return distribution({
		pdf: function(x) {
			return 1 / (Math.PI * lambda * (1 + Math.pow((x - x0) / lambda, 2)));
		},
		
		mean: undefined,
		
		variance: undefined,
		
		cdf: function (x) {
			if (x === -Infinity) {
				return 0;
			} else if (x === Infinity) {
				return 1;
			} else {
				return (1 / Math.PI) * Math.atan((x - x0) / lambda) + 0.5;
			}
		}
	});
};