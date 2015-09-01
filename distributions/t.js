
var distribution = require('../helpers/distribution');
var beta = require('../helpers/beta');
var lowerIncompeteBeta = require('../helpers/lowerIncompeteBeta');

module.exports = function(nu) {
  var beta_term = Math.sqrt(nu) * beta(nu / 2, 0.5),
	  variance;
  if (nu > 2) {
	  variance = nu / (nu - 2);
  } else if (1 < nu && nu <= 2) {
	  variance = Infinity;
  } else {
	  variance = undefined;
  }
  
  return distribution({
    pdf: function (t) {
		return (Math.pow(nu / (Math.pow(t, 2) + nu), (nu + 1) / 2)) /
				beta_term;
	},
	
	mean: nu > 1 ? 0 : undefined,
	
	variance: variance,
	
	cdf: function (t) {
		var denom = beta(nu / 2, 0.5);
		if (t === -Infinity) {
			return 0;
		} else if (t === Infinity) {
			return 1;
		} else {
			var num = 1 - 0.5 * lowerIncompeteBeta(nu / (Math.pow(t, 2) + nu), nu / 2, 0.5) / 
				denom;
			if (t > 0) {
				return num;
			} else if (t < 0) {
				return 1 - num;
			} else {
				return 0.5;
			}
		}
	}
  });
};
