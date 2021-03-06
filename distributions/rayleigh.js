
var distribution = require('../helpers/distribution');

module.exports = function(sigma) {
  return distribution({
    pdf: function(x) {
      return x >= 0 ?
             (x / Math.pow(sigma, 2)) * Math.exp(-Math.pow(x, 2) / (2 * Math.pow(sigma, 2))) : 0;
    },
	
	mean: sigma * Math.sqrt(Math.PI / 2),
	
	variance: (4 - Math.PI) * Math.pow(sigma, 2) / 2,
	
	cdf: function (x) {
		if (x < 0) {
			return 0;
		} else if (x === Infinity) {
			return 1;
		} else {
			return 1 - Math.exp(-Math.pow(x, 2) / (2 * Math.pow(sigma, 2)));
		}
	}
  });
};
