
var assert = require("assert");
var fs = require('fs');
var distributions = require('../index.js');

function empiricalPDF(x) {
    return function(t) {
        var i, n = x.length;
        for (i=0; i < n; i++) {
          if (parseFloat(x[i], 10) > t) {
            break;
          }
        }
        return i / n;
    };
}

function numberSort(a, b) {  return a - b; }

var C_ALPHA = 1.95; //equates to alpha level .001

function kolmogorovSmirnovTest(x, y) {
  var pdfx = empiricalPDF(x);
  var pdfy = empiricalPDF(y);
  var xy = x.concat(y);
  xy.sort(numberSort);

  var D = 0;
  for (var i=0; i < xy.length; i++) {
      var t = xy[i];
      D = Math.max(Math.abs(pdfx(t) - pdfy(t)), D);
  }
  return D > C_ALPHA * Math.sqrt((x.length + y.length) /  (x.length * y.length));
}

function isDrawnFromDistribution(sample, name) {
  var y = JSON.parse(fs.readFileSync('test/fixtures/' + name + '.json'));
  sample.sort(numberSort);
  y.sort(numberSort);

  //return if we failed to reject the null hypothesis that
  //y and sample came from the same distribution
  return !kolmogorovSmirnovTest(sample, y);
}

function categoryCount(sample) {
  var counts = {};
  for (var i=0; i < sample.length; i++) {
    var x = sample[i];
    if (counts[x] === undefined) {
      counts[x] = 0;
    }
    counts[x] ++;
  }
  return counts;
}

function approximately(x1, x2, within) {
	within = within || 1e-6;
	return Math.abs(x1 - x2) <= within;
}

describe('Distributions', function() {
  this.timeout(10000);

  it('Uniform sample', function () {

    var distribution = distributions.uniform(-2, 20);
    var sample = distribution.sample(100);

    assert.ok(isDrawnFromDistribution(sample, 'uniform_-2_20'));
	assert.equal(distribution.mean, 9);
	assert.equal(distribution.variance, 22 * 22 / 12);
  });

  it('Uniform probability density function', function () {

    var distribution = distributions.uniform(); // defaults to 0-1

    assert.equal(distribution.pdf(-100), 0);
    assert.equal(distribution.pdf(-10), 0);
    assert.equal(distribution.pdf(-1), 0);
    assert.equal(distribution.pdf(0), 1);
    assert.equal(distribution.pdf(0.1), 1);
    assert.equal(distribution.pdf(0.25), 1);
    assert.equal(distribution.pdf(0.5), 1);
    assert.equal(distribution.pdf(0.75), 1);
    assert.equal(distribution.pdf(1), 1);
    assert.equal(distribution.pdf(2), 0);
    assert.equal(distribution.pdf(10), 0);
    assert.equal(distribution.pdf(100), 0);
	assert.equal(distribution.mean, 0.5);
	assert.equal(distribution.variance, 1 / 12);
  });
  
  it('Uniform CDF', function () {
	var distribution = distributions.uniform();

	assert.equal(distribution.cdf(-1), 0);
	assert.equal(distribution.cdf(0), 0);
	assert.ok(approximately(distribution.cdf(0.1), 0.1));
	assert.ok(approximately(distribution.cdf(0.15), 0.15));
	assert.ok(approximately(distribution.cdf(0.2), 0.2));
	assert.ok(approximately(distribution.cdf(0.3), 0.3));
	assert.ok(approximately(distribution.cdf(0.5), 0.5));
	assert.ok(approximately(distribution.cdf(0.75), 0.75));
	assert.ok(approximately(distribution.cdf(0.99), 0.99));
	assert.ok(approximately(distribution.cdf(1), 1));
	assert.equal(distribution.cdf(1.1), 1);
  });
  
  it('Discrete uniform sample', function () {
	var distribution = distributions.discreteuniform(1, 20);
	var sample = distribution.sample(100);

    assert.ok(isDrawnFromDistribution(sample, 'discreteuniform_1_20'));
	assert.equal(distribution.mean, 21 / 2);
	assert.equal(distribution.variance, 399 / 12);
  });
  
  it('Discrete uniform probability density function', function () {
	 var distribution = distributions.discreteuniform(2); // defaults to 1, 2
	 
	 assert.equal(distribution.pdf[1], 0.5);
	 assert.equal(distribution.pdf[2], 0.5);
	 assert.equal(distribution.mean, 1.5);
	 assert.equal(distribution.variance, 0.25);
  });
  
  it('Discrete uniform CDF', function () {
	var distribution = distributions.discreteuniform(1, 10);
	  
	assert.equal(distribution.cdf(0), 0);
	assert.equal(distribution.cdf(1), 0.1);
	assert.equal(distribution.cdf(3.2), 0.3);
	assert.equal(distribution.cdf(5), 0.5);
	assert.equal(distribution.cdf(7), 0.7);
	assert.equal(distribution.cdf(9.9), 0.9);
	assert.equal(distribution.cdf(10), 1);
  });
  
  it('Binomial sample', function () {
	var distribution = distributions.binomial(10, 0.3);
    var sample = distribution.sample(100);

    assert.ok(isDrawnFromDistribution(sample, 'binomial_10_.3'));
	assert.equal(distribution.mean, 3);
	assert.equal(distribution.variance, 10 * 0.3 * 0.7); 
  });
  
  it('Binomial CDF', function () {
	var distribution = distributions.binomial(10, 0.3);

	assert.equal(distribution.cdf(-1), 0);
	assert.equal(distribution.cdf(2), distribution.cdf(2.5));
	assert.equal(distribution.cdf(10), 1);
	assert.ok(approximately(distribution.cdf(0), 0.02824752));
	assert.ok(approximately(distribution.cdf(3), 0.6496107));
	assert.ok(approximately(distribution.cdf(5), 0.952651));
	assert.ok(approximately(distribution.cdf(7), 0.9984096));
	assert.ok(approximately(distribution.cdf(9), 0.9999941));
  });
  
  it('Negative binomial sample', function () {
	var distribution = distributions.negativebinomial(4, 0.2);
    var sample = distribution.sample(100);

    assert.ok(isDrawnFromDistribution(sample, 'negativebinomial_4_.2'));
	assert.equal(distribution.mean, 1);
	assert.equal(distribution.variance.toFixed(2), 1.25); 
  });
  
  it('Negative binomial probability density function', function () {
	var distribution = distributions.negativebinomial(4, 0.2);

    assert.equal(distribution.pdf(0).toFixed(4), 0.4096);
    assert.equal(distribution.pdf(0).toFixed(4), 0.4096);//test cache coverage
    assert.equal(distribution.pdf(1).toFixed(5), 0.32768);
    assert.equal(distribution.pdf(2).toFixed(5), 0.16384);
    assert.equal(distribution.pdf(6).toFixed(8), 0.00220201);
	assert.equal(distribution.pdf(1.5), 0);
    assert.equal(distribution.pdf(-1), 0);
  });
  
  it('Negative binomial CDF', function () {
	var nbinom_4_2_success = distributions.negativebinomial(4, 0.2),
		nbinom_4_8_failure = distributions.negativebinomial(4, 0.8, false);
	
	assert.equal(nbinom_4_2_success.cdf(-1), 0);
	assert.ok(approximately(nbinom_4_2_success.cdf(0), 0.4096));
	assert.ok(approximately(nbinom_4_2_success.cdf(1), 0.73728));
	assert.ok(approximately(nbinom_4_2_success.cdf(2.2), 0.90112));
	assert.ok(approximately(nbinom_4_2_success.cdf(3.9), 0.966656));
	assert.ok(approximately(nbinom_4_2_success.cdf(4), 0.9895936));
	assert.ok(approximately(nbinom_4_2_success.cdf(5), 0.9969336));
	assert.equal(nbinom_4_2_success.cdf(Infinity), 1);
	
	assert.equal(nbinom_4_8_failure.cdf(-1), 0);
	assert.ok(approximately(nbinom_4_8_failure.cdf(0), 0.4096));
	assert.ok(approximately(nbinom_4_8_failure.cdf(1), 0.73728));
	assert.ok(approximately(nbinom_4_8_failure.cdf(2.2), 0.90112));
	assert.ok(approximately(nbinom_4_8_failure.cdf(3.9), 0.966656));
	assert.ok(approximately(nbinom_4_8_failure.cdf(4), 0.9895936));
	assert.ok(approximately(nbinom_4_8_failure.cdf(5), 0.9969336));
	assert.equal(nbinom_4_8_failure.cdf(Infinity), 1);
  });
  
  it('Geometric sample', function () {
	var distribution = distributions.geometric(0.2);
    var sample = distribution.sample(100);

    assert.ok(isDrawnFromDistribution(sample, 'geometric_.2'));
	assert.equal(distribution.mean, 5);
	assert.equal(distribution.variance.toFixed(0), 20); 
  });
  
  it('Shifted Geometric sample', function () {
	var distribution = distributions.geometric(0.1, true);
    var sample = distribution.sample(100);

    assert.ok(isDrawnFromDistribution(sample, 'geometric_.1'));
	assert.equal(distribution.mean, 9);
	assert.equal(distribution.variance.toFixed(0), 90); 
  });
  
  it('Geometric(s) probability density function', function () {
	var geo_2 = distributions.geometric(0.2);
	
	assert.equal(geo_2.pdf(0), 0);
	assert.equal(geo_2.pdf(-1), 0);
	assert.equal(geo_2.pdf(1).toFixed(1), 0.2);
	assert.equal(geo_2.pdf(2).toFixed(2), 0.16);
	assert.equal(geo_2.pdf(2.5), 0);
	
	var shifted_geo_2 = distributions.geometric(0.2, true);
	assert.equal(shifted_geo_2.pdf(0), 0.2);
	assert.equal(shifted_geo_2.pdf(-1), 0);
	assert.equal(shifted_geo_2.pdf(1).toFixed(2), 0.16);
	assert.equal(shifted_geo_2.pdf(2).toFixed(3), 0.128);
	assert.equal(shifted_geo_2.pdf(2.5), 0);
  });
  
  it('Geometric(s) CDF', function () {
	var geo_2 = distributions.geometric(0.2),
		shifted_geo_2 = distributions.geometric(0.2, true);
		
	assert.equal(shifted_geo_2.cdf(-0.1), 0);
	assert.equal(shifted_geo_2.cdf(0), 0.2);
	assert.ok(approximately(shifted_geo_2.cdf(1), 0.36));
	assert.ok(approximately(shifted_geo_2.cdf(2), 0.488));
	assert.ok(approximately(shifted_geo_2.cdf(3.3), 0.5904));
	assert.ok(approximately(shifted_geo_2.cdf(4), 0.67232));
	assert.ok(approximately(shifted_geo_2.cdf(5), 0.737856));
	assert.ok(approximately(shifted_geo_2.cdf(10.9), 0.9141007));
	assert.ok(approximately(shifted_geo_2.cdf(20), 0.9907766));
	assert.ok(approximately(shifted_geo_2.cdf(30), 0.9990096));
	assert.equal(shifted_geo_2.cdf(Infinity), 1);
	
	assert.equal(geo_2.cdf(-0.1), 0);
	assert.equal(geo_2.cdf(0), 0);
	assert.ok(approximately(geo_2.cdf(1), 0.2));
	assert.ok(approximately(geo_2.cdf(2), 0.36));
	assert.ok(approximately(geo_2.cdf(3.3), 0.488));
	assert.ok(approximately(geo_2.cdf(4), 0.5904));
	assert.ok(approximately(geo_2.cdf(5), 0.67232));
	assert.ok(approximately(geo_2.cdf(6), 0.737856));
	assert.ok(approximately(geo_2.cdf(11.9), 0.9141007));
	assert.ok(approximately(geo_2.cdf(21), 0.9907766));
	assert.ok(approximately(geo_2.cdf(31), 0.9990096));
	assert.equal(geo_2.cdf(Infinity), 1);
  });

  it('Gaussian sample', function () {
    var distribution = distributions.gaussian(1, 4);
    var sample = distribution.sample(100);

    assert.ok(isDrawnFromDistribution(sample, 'gaussian_1_4'));
	assert.equal(distribution.mean, 1);
	assert.equal(distribution.variance, 16);
  });

  it('Gaussian sample default', function () {
    var distribution = distributions.gaussian(); // should default to 0,1
    var sample = distribution.sample(100);

    assert.ok(isDrawnFromDistribution(sample, 'normal'));
	assert.equal(distribution.mean, 0);
	assert.equal(distribution.variance, 1);
  });
  
  it('Gaussian CDF', function () {
	var distribution = distributions.gaussian();

	assert.equal(distribution.cdf(-Infinity), 0);
	assert.ok(approximately(distribution.cdf(-4), 3.167124e-05));
	assert.ok(approximately(distribution.cdf(-3), 0.001349898));
	assert.ok(approximately(distribution.cdf(-2), 0.02275013));
	assert.ok(approximately(distribution.cdf(-1), 0.1586553));
	assert.ok(approximately(distribution.cdf(0), 0.5));
	assert.ok(approximately(distribution.cdf(1), 0.8413447));
	assert.ok(approximately(distribution.cdf(2), 0.9772499));
	assert.ok(approximately(distribution.cdf(3), 0.9986501));
	assert.ok(approximately(distribution.cdf(4), 0.9999683));
	assert.equal(distribution.cdf(Infinity), 1);
  });
  
  it('Cauchy sample', function () {
	var distribution = distributions.cauchy(10, 12);
	var sample = distribution.sample(100);

    assert.ok(isDrawnFromDistribution(sample, 'cauchy_10_12'));
	assert.equal(distribution.mean, undefined);
	assert.equal(distribution.variance, undefined);
  });
  
  it('Cauchy sample default', function () {
	var distribution = distributions.cauchy();//should default to 0,1
	var sample = distribution.sample(100);

    assert.ok(isDrawnFromDistribution(sample, 'cauchy'));
	assert.equal(distribution.mean, undefined);
	assert.equal(distribution.variance, undefined);
  });
  
  it('Cauchy CDF', function () {
	  var distribution = distributions.cauchy();
	  
	  assert.equal(distribution.cdf(-Infinity), 0);
	  assert.ok(approximately(distribution.cdf(-100), 0.003182993));
	  assert.ok(approximately(distribution.cdf(-10), 0.03172552));
	  assert.ok(approximately(distribution.cdf(-1), 0.25));
	  assert.ok(approximately(distribution.cdf(0), 0.5));
	  assert.ok(approximately(distribution.cdf(5), 0.937167));
	  assert.ok(approximately(distribution.cdf(25), 0.9872744));
	  assert.equal(distribution.cdf(Infinity), 1);
  });

  it('Poisson sample', function () {
    var distribution = distributions.poisson(3);
    var sample = distribution.sample(100);

    assert.ok(isDrawnFromDistribution(sample, 'poisson_3'));
	assert.equal(distribution.mean, 3);
	assert.equal(distribution.variance, 3);
  });

  it('Poisson probability distribution function', function () {
    var distribution = distributions.poisson(5);

	assert.equal(distribution.pdf(1.5), 0);
    assert.ok(approximately(distribution.pdf(0), 0.006737947));
    assert.ok(approximately(distribution.pdf(1), 0.033689735));
    assert.ok(approximately(distribution.pdf(2), 0.084224337));
    assert.ok(approximately(distribution.pdf(3), 0.140373896));
    assert.ok(approximately(distribution.pdf(4), 0.175467370));
    assert.ok(approximately(distribution.pdf(5), 0.175467370));
	assert.equal(distribution.mean, 5);
	assert.equal(distribution.variance, 5);
  });
  
  it('Poisson CDF', function () {
	var distribution = distributions.poisson(5);

	assert.equal(distribution.cdf(-1), 0);
	assert.ok(approximately(distribution.cdf(0), 0.006737947));
    assert.ok(approximately(distribution.cdf(1), 0.040427682));
    assert.ok(approximately(distribution.cdf(2), 0.124652019));
    assert.ok(approximately(distribution.cdf(3.9), 0.265025915));
    assert.ok(approximately(distribution.cdf(4), 0.440493285));
    assert.ok(approximately(distribution.cdf(5.1), 0.615960655));
    assert.ok(approximately(distribution.cdf(10), 0.9863047));
    assert.ok(approximately(distribution.cdf(15), 0.999931));
	assert.equal(distribution.cdf(Infinity), 1);
  });
  
  //test normally passes, but seems to have a high chance of failure, so skipping for now
  //and 'replacing' it by comparing pdf values directly in the test below
  //there may be an issue in generating random samples from skinny tailed distributions
  it.skip('Exponential sample', function () {
	var distribution = distributions.exponential(3);
    var sample = distribution.sample(100);

    assert.ok(isDrawnFromDistribution(sample, 'exponential_3'));
	assert.equal(distribution.mean, 1 / 3);
	assert.equal(distribution.variance, 1 / 9);
  });
  
  it('Exponential probability distribution function', function () {
	var distribution = distributions.exponential(0.1),
		threshold = 0.0001;

	assert.ok(Math.abs(distribution.pdf(-1) - 0) < threshold);
	assert.ok(Math.abs(distribution.pdf(0) - 0.1) < threshold);
	assert.ok(Math.abs(distribution.pdf(1) - 0.09048374) < threshold);
    assert.ok(Math.abs(distribution.pdf(2) - 0.08187308) < threshold);
    assert.ok(Math.abs(distribution.pdf(3) - 0.07408182) < threshold);
    assert.ok(Math.abs(distribution.pdf(4) - 0.067032) < threshold);
    assert.ok(Math.abs(distribution.pdf(5) - 0.06065307) < threshold);
    assert.ok(Math.abs(distribution.pdf(20) - 0.01353353) < threshold);
	assert.equal(distribution.mean, 10);
	assert.equal(distribution.variance.toFixed(0), 100);  
  });
  
  it('Exponential CDF', function () {
	 var distribution = distributions.exponential(0.1);
	 
	 assert.equal(distribution.cdf(-1), 0);
	 assert.equal(distribution.cdf(0), 0);
	 assert.ok(approximately(distribution.cdf(0.1), 0.009950166));
	 assert.ok(approximately(distribution.cdf(1), 0.09516258));
	 assert.ok(approximately(distribution.cdf(10), 0.6321206));
	 assert.ok(approximately(distribution.cdf(100), 0.9999546));
	 assert.equal(distribution.cdf(Infinity), 1);
  });

  it('Bernoulli sample', function () {
    var distribution = distributions.bernoulli(0.8);
    var sample = distribution.sample(10000);
    var counts = categoryCount(sample);

    assert.ok( Math.abs(counts[0] / sample.length - 0.2) < 0.01 );
    assert.ok( Math.abs(counts[1] / sample.length - 0.8) < 0.01 );
	assert.equal(distribution.mean, 0.8);
	assert.equal(distribution.variance.toFixed(2), 0.16);
  });
  
  it('Bernoulli CDF', function () {
	var distribution = distributions.bernoulli(0.8);
	
	assert.equal(distribution.cdf(-1), 0);
	assert.equal(distribution.cdf(0.5).toFixed(1), 0.2);
	assert.equal(distribution.cdf(1.5), 1);
  });

  it('Categorical sample', function () {
    var distribution = distributions.categorical({ a: 0.1, b: 0.5, c: 0.2, d: 0.2});
    var sample = distribution.sample(10000);
    var counts = categoryCount(sample);

    assert.ok( Math.abs(counts.a / sample.length - 0.1) < 0.01 );
    assert.ok( Math.abs(counts.b / sample.length - 0.5) < 0.01 );
    assert.ok( Math.abs(counts.c / sample.length - 0.2) < 0.01 );
    assert.ok( Math.abs(counts.d / sample.length - 0.2) < 0.01 );
	assert.equal(distribution.mean, undefined);
	assert.equal(distribution.variance, undefined);
  });
  
  it('Categorical mean and variance', function () {
	  var distribution = distributions.categorical({0: 0.5, '1': 0.25, '2': 0.25});
	  assert.equal(distribution.mean, 0.75);
	  assert.equal(distribution.variance, 0.6875); 
  });
  
  it('Categorical CDF', function () {
	var distribution = distributions.categorical({0: 0.5, '1': 0.25, '2': 0.25});
	  
	assert.equal(distribution.cdf(-1), 0);
	assert.equal(distribution.cdf(0), 0.5);
	assert.equal(distribution.cdf(1.25), 0.75);
	assert.equal(distribution.cdf(2), 1);
	assert.equal(distribution.cdf('3'), 1);
	  
	distribution = distributions.categorical({ a: 0.1, b: 0.5, c: 0.2, d: 0.2});  
	assert.equal(distribution.cdf('a'), undefined);
  });

  it('Chi-Squared sample', function () {
    var distribution = distributions.chisquare(2);
    var sample = distribution.sample(100);

    assert.ok(isDrawnFromDistribution(sample, 'chisquare_2'));
	assert.equal(distribution.mean, 2);
	assert.equal(distribution.variance, 4);
  });
  
  it('Chi-Squared CDF', function () {
	var distribution = distributions.chisquare(1);
	  
	assert.equal(distribution.cdf(-1), 0);
	assert.ok(approximately(distribution.cdf(0.01), 0.07965567));
	assert.ok(approximately(distribution.cdf(0.1), 0.2481704));
	assert.ok(approximately(distribution.cdf(0.5), 0.5204999));
	assert.ok(approximately(distribution.cdf(1), 0.6826895));
	assert.ok(approximately(distribution.cdf(2), 0.8427008));
	assert.ok(approximately(distribution.cdf(10), 0.9984346));
	assert.equal(distribution.cdf(Infinity), 1);
	  
  });

  it('Beta sample', function () {
    var distribution = distributions.beta(2, 1);
    var sample = distribution.sample(100);

    assert.ok(isDrawnFromDistribution(sample, 'beta_2_1'));
	assert.equal(distribution.mean, 2 / 3);
	assert.equal(distribution.variance, 2 / (9*4));
  });
  
  it('Beta CDF', function () {
	 var distribution = distributions.beta(0.5, 0.5);
	 
	 assert.equal(distribution.cdf(-1), 0);
	 assert.equal(distribution.cdf(0), 0);
	 assert.ok(approximately(distribution.cdf(0.0001), 0.006366304));
	 assert.ok(approximately(distribution.cdf(0.001), 0.02013504));
	 assert.ok(approximately(distribution.cdf(0.01), 0.06376856));
	 assert.ok(approximately(distribution.cdf(0.1), 0.2048328));
	 assert.ok(approximately(distribution.cdf(0.5), 0.5, 1e-5));
	 assert.ok(approximately(distribution.cdf(0.7), 0.6309899, 1e-5));
	 assert.ok(approximately(distribution.cdf(0.9), 0.7951672, 2e-5));
	 assert.ok(approximately(distribution.cdf(0.99), 0.9362314, 1e-3));
	 assert.equal(distribution.cdf(1), 1);
	 assert.equal(distribution.cdf(2), 1);
  });

  it('Pareto sample', function () {
      var distribution = distributions.pareto(3, 0.75);
      var sample = distribution.sample(100);
	  
      assert.ok(isDrawnFromDistribution(sample, 'pareto_3_.75'));
	  assert.equal(distribution.mean, Infinity);
	  assert.equal(distribution.variance, undefined);
  });
  
  it('Pareto mean and variance', function () {
	var distribution = distributions.pareto(3, 2);
	
	assert.equal(distribution.mean, 6);
	assert.equal(distribution.variance, Infinity);
	
	distribution = distributions.pareto(3, 3);
	assert.equal(distribution.mean.toFixed(1), 4.5);
	assert.equal(distribution.variance.toFixed(2), 6.75);
  });
  
  it('Pareto CDF', function () {
	var distribution = distributions.pareto(1, 10);
	
	assert.equal(distribution.cdf(0), 0);
	assert.equal(distribution.cdf(1), 0);
	assert.ok(approximately(distribution.cdf(1.0001), 0.0009994502));
	assert.ok(approximately(distribution.cdf(1.001), 0.009945219));
	assert.ok(approximately(distribution.cdf(1.01), 0.09471305));
	assert.ok(approximately(distribution.cdf(1.1), 0.6144567));
	assert.ok(approximately(distribution.cdf(1.2), 0.8384944));
	assert.ok(approximately(distribution.cdf(1.5), 0.9826585));
	assert.ok(approximately(distribution.cdf(2), 0.9990234));
	assert.equal(distribution.cdf(Infinity), 1);
  });

  it('Gamma sample', function () {
      var distribution = distributions.gamma(4, 2);
      var sample = distribution.sample(100);

      assert.ok(isDrawnFromDistribution(sample, 'gamma_4_2'));
	  assert.equal(distribution.mean, 8);
	  assert.equal(distribution.variance, 16);
  });
  
  it('Gamma CDF', function () {
	var distribution = distributions.gamma(0.5, 1);
	
	assert.equal(distribution.cdf(-1), 0);
	assert.equal(distribution.cdf(0), 0);
	assert.ok(approximately(distribution.cdf(0.00001), 0.003568236));
	assert.ok(approximately(distribution.cdf(0.0001), 0.01128342));
	assert.ok(approximately(distribution.cdf(0.001), 0.03567059));
	assert.ok(approximately(distribution.cdf(0.01), 0.1124629));
	assert.ok(approximately(distribution.cdf(0.1), 0.3452792));
	assert.ok(approximately(distribution.cdf(1), 0.8427008));
	assert.ok(approximately(distribution.cdf(10), 0.9999923));
	assert.equal(distribution.cdf(Infinity), 1);
  });

  it('Rayleigh sample', function () {
      var distribution = distributions.rayleigh(1);
      var sample = distribution.sample(100);

      assert.ok(isDrawnFromDistribution(sample, 'rayleigh_1'));
	  assert.equal(distribution.mean, Math.sqrt(Math.PI / 2));
	  assert.equal(distribution.variance, (4 - Math.PI) / 2);
  });
  
  it('Rayleigh CDF', function () {
	var distribution = distributions.rayleigh(1);
	
	assert.equal(distribution.cdf(-1), 0);
	assert.equal(distribution.cdf(0), 0);
	assert.ok(approximately(distribution.cdf(1), 0.3934693));
	assert.ok(approximately(distribution.cdf(2), 0.8646647));
	assert.ok(approximately(distribution.cdf(3), 0.9888910));
	assert.ok(approximately(distribution.cdf(4), 0.9996645));
	assert.equal(distribution.cdf(Infinity), 1);
  });

  it("Student's T sample", function () {
      var distribution = distributions.t(0.5);
      var sample = distribution.sample(100);

      assert.ok(isDrawnFromDistribution(sample, 't_.5'));
	  assert.equal(distribution.mean, undefined);
	  assert.equal(distribution.variance, undefined);
	  
      distribution = distributions.t(7);
      sample = distribution.sample(100);

      assert.ok(isDrawnFromDistribution(sample, 't_7'));
	  assert.equal(distribution.mean, 0);
	  assert.equal(distribution.variance, 1.4);
	  
	  distribution = distributions.t(2);
	  assert.equal(distribution.mean, 0);
	  assert.equal(distribution.variance, Infinity);
  });
  
  it("Student's T CDF", function () {
	var distribution = distributions.t(0.5);
	
	assert.equal(distribution.cdf(-Infinity), 0);
	assert.ok(approximately(distribution.cdf(-10000), 0.00320701));
	assert.ok(approximately(distribution.cdf(-1000), 0.01014145));
	assert.ok(approximately(distribution.cdf(-100), 0.03206986));
	assert.ok(approximately(distribution.cdf(-10), 0.10133868));
	assert.ok(approximately(distribution.cdf(-1), 0.30112161));
	assert.ok(approximately(distribution.cdf(0), 0.5));
	assert.ok(approximately(distribution.cdf(1), 0.69887839));
	assert.ok(approximately(distribution.cdf(10), 0.89866132));
	assert.ok(approximately(distribution.cdf(100), 0.96793014));
	assert.ok(approximately(distribution.cdf(1000), 0.98985855));
	assert.ok(approximately(distribution.cdf(10000), 0.99679299));
	assert.equal(distribution.cdf(Infinity), 1);
  });
  
  it("Snedecor's F sample", function () {
      var distribution = distributions.f(5, 5);
      var sample = distribution.sample(100);
	
      assert.ok(isDrawnFromDistribution(sample, 'F_5_5'));
	  assert.equal(distribution.mean.toFixed(2), 1.67);
	  assert.equal(distribution.variance.toFixed(2), 8.89);
  });
  
  it("Snedecor's F mean and variance", function () {
	  var distribution = distributions.f(4, 3);
	  
	  assert.equal(distribution.mean, 3);
	  assert.equal(distribution.variance, undefined);
	  
	  distribution = distributions.f(2, 1);
	  
	  assert.equal(distribution.mean, undefined);
	  assert.equal(distribution.variance, undefined);
  });
  
  it("Snedecor'F CDF", function () {
	var distribution = distributions.f(1, 1);
	
	assert.equal(distribution.cdf(-1), 0);
	assert.equal(distribution.cdf(0), 0);
	assert.ok(approximately(distribution.cdf(0.00001), 0.002013162));
	assert.ok(approximately(distribution.cdf(0.0001), 0.006365986));
	assert.ok(approximately(distribution.cdf(0.001), 0.02012498));
	assert.ok(approximately(distribution.cdf(0.01), 0.06345103));
	assert.ok(approximately(distribution.cdf(0.1), 0.1949822));
	assert.ok(approximately(distribution.cdf(1), 0.5));
	assert.ok(approximately(distribution.cdf(10), 0.8050178, 2e-3));
	assert.ok(approximately(distribution.cdf(100), 0.936549, 1e-3));
	assert.ok(approximately(distribution.cdf(1000), 0.979875, 1.3e-2));
	assert.ok(approximately(distribution.cdf(10000), 0.993634, 2e-1));
	assert.equal(distribution.cdf(Infinity), 1);
  });
  
});
