
var distribution = require('../helpers/distribution');
var gamma = require('../helpers/gamma');
var quadrature = require('../helpers/quadrature');

module.exports = function(k) {
  var denom = Math.pow(2, k/2) * gamma(k/2);
  var pdf = function(x) {
    return x >= 0 ?
           (Math.pow(x, (k/2) - 1) * Math.exp(-x/2)) / denom : 0;
  };
  return distribution({
    pdf: pdf,
	
	mean: k,
	
	variance: 2 * k,
	
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
