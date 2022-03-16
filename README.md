# easing-fit

convert a function into keyframes, with output size optimized by fitting result in cubic-bezier timing function.

For example, say we have following equation for a bouncing ball's height:

    f = (t) -> Math.abs(Math.sin(Math.pow(3 * t + 1.77, 2)) / ( Math.pow(3 * t + 2, 5 * t) + 1))

We can convert it into a list of values with timing function defined in corresponding cubic beziers curves:

    [
        { percent:  0, value: 0.004, cubicBezier: [ 0.149,  0.2354, 0.2254, 0.883  ] },
        { percent: 12, value: 0.368, cubicBezier: [ 0.3784, 0.1998, 0.5522, 0.9861 ] },
        { percent: 26, value: 0.046, cubicBezier: [ 0.1838, 0.3635, 0.3735, 1      ] },
        ...
    ]

The bezier curves in the output result are tweaked to minimize the total frames needed for re-creating effect of the input equation. This can then be converted into CSS keyframes for animation.


## Installation

    npm install --save easing-fit


## Usage

Import easing-fit ( or, include `index.bundle.min.js` ):

    easingFit = require("easing-fit");


fit a given function with `easingFit.fit`:

    customfunc = (t) -> Math.sin(t * Math.PI * 2);
    frames = easingFit.fit(customFunc, opts); /* opts explained below */


convert the keyframes into CSS:

    result = easingFit.toKeyframes(frames, {
      prop: (kf, cfg, idx) -> {transform: "translate(#{kf.value})"}
      name: "sine",
      config: { /* ... custom defined config */ }
    });
    /* result is the result CSS content */

Check sample.ls for more detail.


## easingFit.fit Configuration

To tweak easing-fit further more, you can pass configuration into easingFit.fit, in the second parameter.

 * SampleCount: how many points to sample in each segment. default is 1000.
 * segSampleCount: how many points to sample when finding segment. default is 5.
 * errorThreshold: pass to curve-fit, for error thresholding. default is 0.1
 * precision: precision for output. default is 0.0001
 * segPtrs: Array of points for forcing easing-fit to cut segments at. handy for approximating non-smooth function. default is [].


## LICENSE

MIT


# fitting function
# Parameters:
#   func: timing function func(t), t = 0 ~ 1
#   options:
#     precision: output value will be rounded to this precision
#     sample-count: how many points to sample for each segment
#     error-threshold: max error between a spline and target function
