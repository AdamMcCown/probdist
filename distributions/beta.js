
var distribution = require('../helpers/distribution');
var gamma = require('../helpers/gamma');
var lowerIncompeteBeta = require('../helpers/lowerIncompeteBeta');

module.exports = function(alpha, beta) {
  var inv_beta = gamma(alpha + beta) / (gamma(alpha) * gamma(beta));
  
  return distribution({
    pdf: function(x) {
		return x >= 0 && x <= 1 ?
			inv_beta * Math.pow(x, alpha-1) * Math.pow(1 - x, beta - 1) : 0;
	},
	
	mean: alpha / (alpha + beta),
	
	variance: (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1)),
	
	cdf: function (x) {
		if (x <= 0) {
			return 0;
		} else if (0 < x && x < 1) {
			return lowerIncompeteBeta(x, alpha, beta) * inv_beta;
			// return lowerIncompeteBeta.F_2_1(alpha, 1 - beta, alpha + 1, x) * 
				// inv_beta;
		} else {
			return 1;
		}
	}
  });
};
