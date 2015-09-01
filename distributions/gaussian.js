
var distribution = require('../helpers/distribution');

module.exports = function(mean, stddev) {
  if (mean === undefined) {
    mean = 0;
  }
  if (stddev === undefined) {
    stddev = 1;
  }

  return distribution({
    pdf: function(x) {
	  return (1 / (stddev * Math.sqrt(2 * Math.PI))) *
            Math.exp(- Math.pow(x - mean, 2) / (2 * Math.pow(stddev, 2)));
    },
	
	mean: mean,
	
	variance: Math.pow(stddev, 2),
	
	cdf: function (x) {
		if (x === -Infinity) {
			return 0;
		} else if (x === Infinity) {
			return 1;
		} else {
			if (x >= 0) {
				erf = erfApprox((x - mean) / (stddev * Math.sqrt(2))); 
			} else {
				erf = -erfApprox((-x - mean) / (stddev * Math.sqrt(2)));
			}
			return 0.5 * (1 + erf);
		}
	}
  });
};

function erfApprox(x) {
	var p = 0.3275911,
			a = {1: 0.254829592,
				 2: -0.284496736,
				 3: 1.421413741,
				 4: -1.453152027,
				 5: 1.061405429},
			t = 1 / (1 + p * x),
			i,
			sum = 0,
			erf = 0;
	for (i = 1; i <= 5; i += 1) {
		sum += a[i] * Math.pow(t, i);
	}
	return 1 - sum * Math.exp(-Math.pow(x, 2));
}