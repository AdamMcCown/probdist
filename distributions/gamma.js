
var distribution = require('../helpers/distribution');
var gamma = require('../helpers/gamma');
var quadrature = require('../helpers/quadrature');

module.exports = function(alpha, beta) {
  var gamma_alpha = gamma(alpha);
  var pdf = function(x) {
    return x > 0 ?
			(Math.pow(beta, -alpha) * Math.pow(x, alpha-1) * Math.exp(-x / beta)) /
            gamma_alpha : 0;
  };
  return distribution({
    pdf: pdf,
	
	mean: alpha * beta,
	
	variance: alpha * Math.pow(beta, 2),
	
	cdf: function (x) {
		if (x <= 0) {
			return 0;
		} else if (x === Infinity) {
			return 1;
		} else {
			return quadrature(pdf, 0, x);
		}
	}
  });
};
