
var distribution = require('../helpers/distribution'),
	factorial = require('../helpers/factorial');

module.exports = function(n, p) {
	var k,
		pdf = {},
		nfactorial = factorial(n);
	
	//large n may be computationally expensive even with stirlingApproximation
	//may want to use a rule for Gaussian approximation
	for (k = 0; k <= n; k += 1) {
		pdf[k] = nfactorial / (factorial(k) * factorial(n - k)) * 
				Math.pow(p, k) * Math.pow(1 - p, n - k);
	}
	
	return distribution({
		pdf: pdf,
		
		mean: n * p,
		
		variance: n * p * (1 - p),
		
		cdf: function (x) {
			if (x >= n) {
				return 1;
			} else {
				var sum = 0;
				for (k = 0; k <= x; k += 1) {
					sum += pdf[k];
				}
				return sum;
			}
		}
	});
};