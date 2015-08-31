
var distribution = require('../helpers/distribution');
var quadrature = require('../helpers/quadrature');

module.exports = function(mean, stddev) {
  if (mean === undefined) {
    mean = 0;
  }
  if (stddev === undefined) {
    stddev = 1;
  }

  var pdf = function(x) {
	  return (1 / (stddev * Math.sqrt(2 * Math.PI))) *
            Math.exp(- Math.pow(x - mean, 2) / (2 * Math.pow(stddev, 2)));
  };
  return distribution({
    pdf: pdf,
	
	mean: mean,
	
	variance: Math.pow(stddev, 2),
	
	cdf: function (x) {
		if (x === -Infinity) {
			return 0;
		} else if (x === Infinity) {
			return 1;
		} else {
			return quadrature(pdf, -Infinity, x);
		}
	}
  });
};
