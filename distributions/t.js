
var distribution = require('../helpers/distribution');
var beta = require('../helpers/beta');
var quadrature = require('../helpers/quadrature');

module.exports = function(nu) {
  var beta_term = Math.sqrt(nu) * beta(nu / 2, 0.5),
	  variance,
	  pdf = function (t) {
		return (Math.pow(nu / (Math.pow(t, 2) + nu), (nu + 1) / 2)) /
				beta_term;
	  };
  if (nu > 2) {
	  variance = nu / (nu - 2);
  } else if (1 < nu && nu <= 2) {
	  variance = Infinity;
  } else {
	  variance = undefined;
  }
  
  return distribution({
    pdf: pdf,
	
	mean: nu > 1 ? 0 : undefined,
	
	variance: variance,
	
	cdf: function (x) {
		if (x === -Infinity) {
			return 0;
		} else if (x === Infinity) {
			return 1;
		} else {
			return quadrature(pdf, -Infinity, x, {intervals: 100000});
		}
	}
  });
};
