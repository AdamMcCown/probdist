
var distribution = require('../helpers/distribution');
var gamma = require('../helpers/gamma');
var lowerIncompleteGamma = require('../helpers/lowerIncompleteGamma');

module.exports = function(k) {
  var denom = Math.pow(2, k/2) * gamma(k/2);
  
  return distribution({
    pdf: function(x) {
		return x >= 0 ?
           (Math.pow(x, (k/2) - 1) * Math.exp(-x/2)) / denom : 0;
	},
	
	mean: k,
	
	variance: 2 * k,
	
	cdf: function (x) {
		if (x <= 0) {
			return 0;
		} else if (x === Infinity) {
			return 1;
		} else {
			return lowerIncompleteGamma(k / 2, x / 2) / gamma(k / 2); 
		}
	}
  });
};
