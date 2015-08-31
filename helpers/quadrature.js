
function simpsons(f, a, b) {
	return ((b - a) / 6) *
			(f(a) + 4 * f((a + b) / 2) + f(b));
}
	
module.exports = quadrature;

/**
* Finds a numerical integral approximation
*
* @method quadrature
* @param {Function} f is the integrand to evaluate
* @param {Object} args
* @return {Number} numerical approximation of integral
*/
function quadrature(f, a, b, args) {
	//function f check
	if (typeof f !== 'function') {
		throw Error('must provide f as a function');
	} else if (f.length !== 1) {
		throw Error('function f can only have one argument');
	}
	
	//object check
	if (args && typeof args !== 'object') {
		throw Error('args argument must be an object');
	}
	
	var options = clone(args);//don't want to override original args as it may be reused
	//set up options
	if (arguments.length === 4) {
		options.start = a;
		options.end = b;
	} else if (arguments.length === 3) {
		options = {
			start: a,
			end: b
		};
	} else if (arguments.length === 2) {
		options = a;
	} else if (arguments.length === 1) {
		throw Error('must supply arguments a and b or provide args argument');
	} else {
		throw Error('invalid number of arguments');
	}
	options.intervals = options.intervals || 1000;
	
	//argument validation
	if (typeof options.start !== 'number' && options.start !== -Infinity && options.start !== Infinity) {
		throw Error('start must be a number');
	} else if (typeof options.end !== 'number' && options.end !== Infinity && options.end !== -Infinity) {
		throw Error('end must be a number');
	} else if (typeof options.intervals !== 'number' || options.intervals <= 0) {
		throw Error('intervals must be a positive number');
	}
	
	var sum = calculate(f, options);
	return sum;
	//TODO any probdist will converge
}

function calculate(f, options) {
	var n = Math.floor(options.intervals), //n
		start = options.start, //a
		end = options.end, //b
		stepSize, //h
		i,
		sum = 0,
		newF = f,
		reverseIntegral = false;
		
	//check start === end
	//then check start > end and switch them if need be
	if (start === end) {
		return 0;
	} else if (start > end) {
		start = options.end;
		end = options.start;
		reverseIntegral = true;
	}
	
	//improper integral check, change of variables to finite interval 
	if (start === -Infinity && end === Infinity) {
		newF = function (t) {
			//prevent divide by 0
			if (t === 0) {
				t = 0.000001;
			}
			var tSquared = Math.pow(t, 2);
			//prevent divide by 0
			if (tSquared === 1) {
				tSquared = 0.999999;
			}
			return f(t / (1 - tSquared)) * (1 + tSquared) / Math.pow(1 - tSquared, 2);
		};
		start = -1;
		end = 1;
	} else if (start !== -Infinity && end === Infinity) {
		newF = (function () {
			var a = start;
			return function (t) {
				//prevent divide by 0
				if (t === 1) {
					t = 0.999999;
				}
				return f(a + (t / (1 - t))) / Math.pow(1 - t, 2);
			};
		}());
		start = 0;
		end = 1;
	} else if (start === -Infinity && end !== Infinity) {
		newF = (function () {
			var b = end;
			return function (t) {
				//prevent divide by 0
				if (t === 0) {
					t = 0.000001;
				}
				return f(b - (1 - t) / t) / Math.pow(t, 2);
			};
		}());
		start = 0;
		end = 1;
	}
	
	stepSize = (end - start) / n;
	
	//another improper integral check
	//we want to find the limit as we approach an end point
	//so we evaluate the integral close to the end point
	//and hope the new result is close to the limit if one exists
	if (newF(start) === Infinity || newF(start) === -Infinity || isNaN(newF(start))) {
		start += 0.000001 //this seemed to smallest value that wouldn't break tests
	}
	if (newF(end) === Infinity || newF(end) === -Infinity || isNaN(newF(end))) {
		end -= 0.000001;
	}
	
	for (i = 0; i < n; i += 1) {
		var a1 = start + stepSize * i,
			b1 = start + stepSize * (i + 1),
			approx = simpsons(newF, a1, b1);
		
		//isNaN check, e.g. 0 / 0, sin(infinity), and infinity / infinity return NaN
		if (isNaN(approx)){
			throw Error('interval approximation for [' + a1 + ',' + b1 + '] returned ' + approx);	
		}
		sum += approx;
	}
	
	return reverseIntegral ? -sum : sum;
}

function clone(options) {
	var newObj = {};
	for (var prop in options) {
		if (options.hasOwnProperty(prop)) {
			newObj[prop] = options[prop];
		}
	}
	return newObj;
}
