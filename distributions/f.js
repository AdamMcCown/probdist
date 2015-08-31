
var distribution = require('../helpers/distribution'),
	beta = require('../helpers/beta'),
	quadrature = require('../helpers/quadrature');
	
module.exports = function(v1, v2) {
	var beta_v1_v2 = beta(v1 / 2, v2 / 2),
		pdf = function(x) {
			return x >= 0 ? 
			Math.sqrt(Math.pow(v1 * x, v1) * Math.pow(v2, v2) / 
				Math.pow(v1 * x + v2, v1 + v2)) /
			(x * beta_v1_v2) : 0;
		};
	
	return distribution({
		pdf: pdf,
		
		mean: v2 > 2 ? v2 / (v2 - 2) : undefined,
		
		variance: v2 > 4 ? 
			2 * Math.pow(v2, 2) * (v1 + v2 - 2) /
			(v1 * Math.pow(v2 - 2, 2) * (v2 - 4)) :
			undefined,
			
		cdf : function (x) {
			if (x < 0) {
				return 0;
			} else if (x === Infinity) {
				return 1;
			} else {
				return quadrature(pdf, 0, x);
			}
		}
	});
};