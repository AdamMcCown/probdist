
var distribution = require('../helpers/distribution');
var gamma = require('../helpers/gamma');
var quadrature = require('../helpers/quadrature');

module.exports = function(alpha, beta) {
  var inv_beta = gamma(alpha + beta) / (gamma(alpha) * gamma(beta));
  var pdf = function(x) {
	return x >= 0 && x <= 1 ?
		inv_beta * Math.pow(x, alpha-1) * Math.pow(1 - x, beta - 1) : 0;
  };
  return distribution({
    pdf: pdf,
	
	mean: alpha / (alpha + beta),
	
	variance: (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1)),
	
	cdf: function (x) {
		if (x <= 0) {
			return 0;
		} else if (0 < x && x < 1) {
			return quadrature(pdf, 0, x, {intervals: 10000});
		} else {
			return 1;
		}
	}
  });
};
