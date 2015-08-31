
var distribution = require('../helpers/distribution');

module.exports = function(p) {
  return distribution({
    pdf: {0: 1-p, 1: p},
	
	mean: p,
	
	variance: (1 - p) * p,
	
	cdf: function(x) {
		if (x < 0) {
			return 0;
		} else if (0 <= x && x < 1) {
			return 1 - p;
		} else {
			return 1;
		}
	}
  });
};
