
var distribution = require('../helpers/distribution');

module.exports = function(xm, alpha) {
  var variance; 
  if (1 < alpha && alpha <= 2) {
	  variance = Infinity;
  } else if (alpha > 2) {
	  variance = Math.pow(xm, 2) * alpha / (Math.pow(alpha - 1, 2) * (alpha - 2));
  } else {
	  variance = undefined;
  }
  
  return distribution({
    pdf: function(x) {
      return x >= xm ?
             Math.pow(alpha * xm, alpha) / Math.pow(x, alpha + 1) : 0;
    },
	
	mean: alpha <= 1 ? Infinity : alpha * xm / (alpha - 1),
	
	variance: variance,
	
	cdf: function (x) {
		if (x < xm) {
			return 0;
		} else if (x === Infinity) {
			return 1;
		} else {
			return 1 - Math.pow(xm / x, alpha);
		}
	}
  });
};
