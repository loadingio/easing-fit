(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function(){
  var fitCurve, svgPathProperties, round, sampleFunc, fit, toKeyframes, fitToKeyframes, sampleSvg, searchSvgPath, fromSvg, stepFromSvg;
  fitCurve = require('fit-curve');
  svgPathProperties = require('svg-path-properties');
  round = function(n, d){
    var p, ret;
    d == null && (d = 5);
    p = Math.pow(10, d);
    ret = (Math.round(n * p) / p + "").split(".");
    return +(ret[0] + (ret[1] ? "." + ret[1].substring(0, d) : ""));
  };
  sampleFunc = function(t){
    return Math.abs(Math.sin(Math.pow(3 * t + 1.77, 2)) / (Math.pow(3 * t + 2, 5 * t) + 1));
  };
  fit = function(func, opt){
    var ref$, ox, oy, dy, count, segments, i$, step$, to$, x, y, p, j$, to1$, i, points, segIdx, seg, cur, py, keyframes, len$, ps, curves, len1$, curve, x1, x2, y1, y2, ncurve, k$, j;
    opt == null && (opt = {});
    opt = import$({
      segSampleCount: 100,
      precision: 0.0001,
      sampleCount: 5,
      errorThreshold: 0.1,
      start: 0,
      end: 1,
      segPtrs: []
    }, opt);
    ref$ = [opt.start, 0, 1, 0, []], ox = ref$[0], oy = ref$[1], dy = ref$[2], count = ref$[3], segments = ref$[4];
    for (i$ = opt.start, to$ = opt.end, step$ = 1 / opt.segSampleCount; step$ < 0 ? i$ >= to$ : i$ <= to$; i$ += step$) {
      x = i$;
      y = func(x);
      if (count > 2 && Math.sign(y - oy) * Math.sign(dy) < 0) {
        segments.push([ox, x]);
        ox = x;
      }
      p = opt.segPtrs.filter(fn$).filter(fn1$);
      if (p.length) {
        for (j$ = 0, to1$ = p.length; j$ < to1$; ++j$) {
          i = j$;
          segments.push([ox, p[i]]);
          ox = p[i];
        }
      }
      dy = y - oy;
      oy = y;
      count = count + 1;
    }
    segments.push([ox, opt.end]);
    points = [];
    for (i$ = 0, to$ = segments.length; i$ < to$; ++i$) {
      segIdx = i$;
      seg = segments[segIdx];
      cur = [];
      for (j$ = seg[0], to1$ = seg[1], step$ = (seg[1] - seg[0]) / opt.sampleCount; step$ < 0 ? j$ > to1$ : j$ < to1$; j$ += step$) {
        x = j$;
        y = Math.round(func(x) * 1000) / 1000;
        cur.push([Math.round(1000 * x) * 0.001, Math.round(1000 * y) * 0.001]);
      }
      y = Math.round(func(seg[1]) * 1000) / 1000;
      cur.push([Math.round(1000 * seg[1]) * 0.001, Math.round(1000 * y) * 0.001]);
      points.push(cur);
    }
    py = NaN;
    keyframes = [];
    for (i$ = 0, len$ = points.length; i$ < len$; ++i$) {
      ps = points[i$];
      curves = fitCurve(ps, opt.errorThreshold);
      for (j$ = 0, len1$ = curves.length; j$ < len1$; ++j$) {
        curve = curves[j$];
        x1 = curve[0][0];
        x2 = curve[3][0];
        y1 = curve[0][1];
        y2 = curve[3][1];
        ncurve = [];
        if (Math.abs(y1 - py) < 0.5 * 0.01) {
          continue;
        }
        py = y1;
        for (k$ = 0; k$ < 4; ++k$) {
          j = k$;
          ncurve.push([Math.round(((curve[j][0] - x1) / (x2 - x1)) / opt.precision) * opt.precision, Math.round(((curve[j][1] - y1) / (y2 - y1)) / opt.precision) * opt.precision]);
        }
        if (isNaN(ncurve[1][1])) {
          ncurve[1][1] = ncurve[1][0];
        }
        if (isNaN(ncurve[2][1])) {
          ncurve[2][1] = ncurve[2][0];
        }
        keyframes.push({
          percent: round(x1 * 100),
          value: y1,
          cubicBezier: [ncurve[1][0], ncurve[1][1], ncurve[2][0], ncurve[2][1]].map(fn2$)
        });
      }
    }
    keyframes.push({
      percent: opt.end * 100,
      value: y2
    });
    return keyframes;
    function fn$(it){
      return it > x;
    }
    function fn1$(it){
      return it <= x + 1 / opt.segSampleCount;
    }
    function fn2$(it){
      return round(it);
    }
  };
  toKeyframes = function(keyframes, opt){
    var str, i$, to$, i, keyframe, props, k, v;
    opt == null && (opt = {});
    opt = import$({
      prop: function(f, c){
        return {
          content: "\"" + f.value + "\""
        };
      },
      name: null,
      format: 'css',
      config: {}
    }, opt || {});
    str = opt.name
      ? ["@keyframes " + opt.name]
      : [];
    if (opt.format === 'css') {
      str = str.concat("{");
      for (i$ = 0, to$ = keyframes.length; i$ < to$; ++i$) {
        i = i$;
        keyframe = keyframes[i];
        props = (fn$()).map(fn1$);
        str = str.concat((["  " + keyframe.percent + "% {", keyframe.cubicBezier ? "    animation-timing-function: cubic-bezier(" + keyframe.cubicBezier.join(',') + ");" : void 8].concat(props, ["  }"])).filter(fn2$));
      }
      str = str.concat("}");
      str = str.join('\n');
    } else {
      for (i$ = 0, to$ = keyframes.length; i$ < to$; ++i$) {
        i = i$;
        keyframe = keyframes[i];
        props = (fn3$()).map(fn4$);
        str = str.concat((["  " + keyframe.percent + "%", keyframe.cubicBezier ? "    animation-timing-function: cubic-bezier(" + keyframe.cubicBezier.join(',') + ")" : void 8].concat(props)).filter(fn5$));
      }
      str = str.join('\n');
    }
    return str;
    function fn$(){
      var ref$, results$ = [];
      for (k in ref$ = opt.prop(keyframe, opt.config, i)) {
        v = ref$[k];
        results$.push([k, v]);
      }
      return results$;
    }
    function fn1$(it){
      return "    " + it[0] + ": " + it[1] + ";";
    }
    function fn2$(it){
      return it;
    }
    function fn3$(){
      var ref$, results$ = [];
      for (k in ref$ = opt.prop(keyframe, opt.config, i)) {
        v = ref$[k];
        results$.push([k, v]);
      }
      return results$;
    }
    function fn4$(it){
      return "    " + it[0] + ": " + it[1];
    }
    function fn5$(it){
      return it;
    }
  };
  fitToKeyframes = function(step, opt){
    var ret, ref$;
    opt == null && (opt = {});
    ret = fit(step, opt);
    ret = toKeyframes(ret, {
      name: (ref$ = import$({
        prop: function(){
          return {};
        },
        format: 'css'
      }, opt)).name,
      prop: ref$.prop,
      format: ref$.format,
      config: ref$.config
    });
    return ret;
  };
  sampleSvg = "M0,50c0,0,2,0.5,6.7,0c5.6-0.6,3.5-18.1,7.1-18.1s4.2,25.6,8.9,25.6s6.8-10.3,8.4-14c1.9-4.4,7.9-5.4,10.9,0.1C46.7,52.3,100,50,100,50";
  searchSvgPath = function(p, x, len, err, r, lv){
    var m, ptr;
    err == null && (err = 0.01);
    r == null && (r = [0, 1]);
    lv == null && (lv = 20);
    m = (r[0] + r[1]) * 0.5;
    ptr = p.getPointAtLength(m * len);
    ptr = {
      x: ptr.x * 0.01,
      y: ptr.y * 0.01
    };
    if (Math.abs(ptr.x - x) < err || lv <= 0) {
      return (0.5 - ptr.y) * 2;
    }
    if (ptr.x > x) {
      return searchSvgPath(p, x, len, err, [r[0], (r[0] + r[1]) * 0.5], lv - 1);
    } else if (ptr.x < x) {
      return searchSvgPath(p, x, len, err, [(r[0] + r[1]) * 0.5, r[1]], lv - 1);
    } else {
      return (0.5 - ptr.y) * 2;
    }
  };
  fromSvg = function(d, opt){
    var step;
    opt == null && (opt = {});
    step = stepFromSvg(d);
    return fit(step, opt);
  };
  stepFromSvg = function(pathd, opt){
    var p, len, step, pts, res$, i$, step$, i;
    opt == null && (opt = {});
    p = svgPathProperties.svgPathProperties(pathd);
    len = p.getTotalLength();
    step = function(t){
      return searchSvgPath(p, t, len, 0.001);
    };
    if (!opt.presampling) {
      return step;
    }
    res$ = [];
    for (i$ = 0, step$ = 1 / opt.sampleCount; step$ < 0 ? i$ >= 1 : i$ <= 1; i$ += step$) {
      i = i$;
      res$.push(step(i));
    }
    pts = res$;
    return function(t){
      var idx;
      t = t * pts.length;
      idx = Math.floor(t);
      if (idx === pts.length - 1) {
        return pts[idx];
      }
      return (pts[idx + 1] - pts[idx]) * t(-idx);
    };
  };
  module.exports = {
    round: round,
    sampleFunc: sampleFunc,
    sampleSvg: sampleSvg,
    fitToKeyframes: fitToKeyframes,
    fit: fit,
    fromSvg: fromSvg,
    stepFromSvg: stepFromSvg,
    toKeyframes: toKeyframes
  };
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);

},{"fit-curve":2,"svg-path-properties":3}],2:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod);
        global.fitCurve = mod.exports;
    }
})(this, function (module) {
    'use strict';

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    // ==ClosureCompiler==
    // @output_file_name fit-curve.min.js
    // @compilation_level SIMPLE_OPTIMIZATIONS
    // ==/ClosureCompiler==

    /**
     *  @preserve  JavaScript implementation of
     *  Algorithm for Automatically Fitting Digitized Curves
     *  by Philip J. Schneider
     *  "Graphics Gems", Academic Press, 1990
     *
     *  The MIT License (MIT)
     *
     *  https://github.com/soswow/fit-curves
     */

    /**
     * Fit one or more Bezier curves to a set of points.
     *
     * @param {Array<Array<Number>>} points - Array of digitized points, e.g. [[5,5],[5,50],[110,140],[210,160],[320,110]]
     * @param {Number} maxError - Tolerance, squared error between points and fitted curve
     * @returns {Array<Array<Array<Number>>>} Array of Bezier curves, where each element is [first-point, control-point-1, control-point-2, second-point] and points are [x, y]
     */
    function fitCurve(points, maxError, progressCallback) {
        if (!Array.isArray(points)) {
            throw new TypeError("First argument should be an array");
        }
        points.forEach(function (point) {
            if (!Array.isArray(point) || point.length !== 2 || typeof point[0] !== 'number' || typeof point[1] !== 'number') {
                throw Error("Each point should be an array of two numbers");
            }
        });
        // Remove duplicate points
        points = points.filter(function (point, i) {
            return i === 0 || !(point[0] === points[i - 1][0] && point[1] === points[i - 1][1]);
        });

        if (points.length < 2) {
            return [];
        }

        var len = points.length;
        var leftTangent = createTangent(points[1], points[0]);
        var rightTangent = createTangent(points[len - 2], points[len - 1]);

        return fitCubic(points, leftTangent, rightTangent, maxError, progressCallback);
    }

    /**
     * Fit a Bezier curve to a (sub)set of digitized points.
     * Your code should not call this function directly. Use {@link fitCurve} instead.
     *
     * @param {Array<Array<Number>>} points - Array of digitized points, e.g. [[5,5],[5,50],[110,140],[210,160],[320,110]]
     * @param {Array<Number>} leftTangent - Unit tangent vector at start point
     * @param {Array<Number>} rightTangent - Unit tangent vector at end point
     * @param {Number} error - Tolerance, squared error between points and fitted curve
     * @returns {Array<Array<Array<Number>>>} Array of Bezier curves, where each element is [first-point, control-point-1, control-point-2, second-point] and points are [x, y]
     */
    function fitCubic(points, leftTangent, rightTangent, error, progressCallback) {
        var MaxIterations = 20; //Max times to try iterating (to find an acceptable curve)

        var bezCurve, //Control points of fitted Bezier curve
        u, //Parameter values for point
        uPrime, //Improved parameter values
        maxError, prevErr, //Maximum fitting error
        splitPoint, prevSplit, //Point to split point set at if we need more than one curve
        centerVector, toCenterTangent, fromCenterTangent, //Unit tangent vector(s) at splitPoint
        beziers, //Array of fitted Bezier curves if we need more than one curve
        dist, i;

        //console.log('fitCubic, ', points.length);

        //Use heuristic if region only has two points in it
        if (points.length === 2) {
            dist = maths.vectorLen(maths.subtract(points[0], points[1])) / 3.0;
            bezCurve = [points[0], maths.addArrays(points[0], maths.mulItems(leftTangent, dist)), maths.addArrays(points[1], maths.mulItems(rightTangent, dist)), points[1]];
            return [bezCurve];
        }

        //Parameterize points, and attempt to fit curve
        u = chordLengthParameterize(points);

        var _generateAndReport = generateAndReport(points, u, u, leftTangent, rightTangent, progressCallback);

        bezCurve = _generateAndReport[0];
        maxError = _generateAndReport[1];
        splitPoint = _generateAndReport[2];


        if (maxError < error) {
            return [bezCurve];
        }
        //If error not too large, try some reparameterization and iteration
        if (maxError < error * error) {

            uPrime = u;
            prevErr = maxError;
            prevSplit = splitPoint;

            for (i = 0; i < MaxIterations; i++) {

                uPrime = reparameterize(bezCurve, points, uPrime);

                var _generateAndReport2 = generateAndReport(points, u, uPrime, leftTangent, rightTangent, progressCallback);

                bezCurve = _generateAndReport2[0];
                maxError = _generateAndReport2[1];
                splitPoint = _generateAndReport2[2];


                if (maxError < error) {
                    return [bezCurve];
                }
                //If the development of the fitted curve grinds to a halt,
                //we abort this attempt (and try a shorter curve):
                else if (splitPoint === prevSplit) {
                        var errChange = maxError / prevErr;
                        if (errChange > .9999 && errChange < 1.0001) {
                            break;
                        }
                    }

                prevErr = maxError;
                prevSplit = splitPoint;
            }
        }

        //Fitting failed -- split at max error point and fit recursively
        beziers = [];

        //To create a smooth transition from one curve segment to the next,
        //we calculate the tangent of the points directly before and after the center,
        //and use that same tangent both to and from the center point.
        centerVector = maths.subtract(points[splitPoint - 1], points[splitPoint + 1]);
        //However, should those two points be equal, the normal tangent calculation will fail.
        //Instead, we calculate the tangent from that "double-point" to the center point, and rotate 90deg.
        if (centerVector[0] === 0 && centerVector[1] === 0) {
            //toCenterTangent = createTangent(points[splitPoint - 1], points[splitPoint]);
            //fromCenterTangent = createTangent(points[splitPoint + 1], points[splitPoint]);

            //[x,y] -> [-y,x]: http://stackoverflow.com/a/4780141/1869660
            centerVector = maths.subtract(points[splitPoint - 1], points[splitPoint]).reverse();
            centerVector[0] = -centerVector[0];
        }
        toCenterTangent = maths.normalize(centerVector);
        //To and from need to point in opposite directions:
        fromCenterTangent = maths.mulItems(toCenterTangent, -1);

        /*
        Note: An alternative to this "divide and conquer" recursion could be to always
              let new curve segments start by trying to go all the way to the end,
              instead of only to the end of the current subdivided polyline.
              That might let many segments fit a few points more, reducing the number of total segments.
                However, a few tests have shown that the segment reduction is insignificant
              (240 pts, 100 err: 25 curves vs 27 curves. 140 pts, 100 err: 17 curves on both),
              and the results take twice as many steps and milliseconds to finish,
              without looking any better than what we already have.
        */
        beziers = beziers.concat(fitCubic(points.slice(0, splitPoint + 1), leftTangent, toCenterTangent, error, progressCallback));
        beziers = beziers.concat(fitCubic(points.slice(splitPoint), fromCenterTangent, rightTangent, error, progressCallback));
        return beziers;
    };

    function generateAndReport(points, paramsOrig, paramsPrime, leftTangent, rightTangent, progressCallback) {
        var bezCurve, maxError, splitPoint;

        bezCurve = generateBezier(points, paramsPrime, leftTangent, rightTangent, progressCallback);
        //Find max deviation of points to fitted curve.
        //Here we always use the original parameters (from chordLengthParameterize()),
        //because we need to compare the current curve to the actual source polyline,
        //and not the currently iterated parameters which reparameterize() & generateBezier() use,
        //as those have probably drifted far away and may no longer be in ascending order.

        var _computeMaxError = computeMaxError(points, bezCurve, paramsOrig);

        maxError = _computeMaxError[0];
        splitPoint = _computeMaxError[1];


        if (progressCallback) {
            progressCallback({
                bez: bezCurve,
                points: points,
                params: paramsOrig,
                maxErr: maxError,
                maxPoint: splitPoint
            });
        }

        return [bezCurve, maxError, splitPoint];
    }

    /**
     * Use least-squares method to find Bezier control points for region.
     *
     * @param {Array<Array<Number>>} points - Array of digitized points
     * @param {Array<Number>} parameters - Parameter values for region
     * @param {Array<Number>} leftTangent - Unit tangent vector at start point
     * @param {Array<Number>} rightTangent - Unit tangent vector at end point
     * @returns {Array<Array<Number>>} Approximated Bezier curve: [first-point, control-point-1, control-point-2, second-point] where points are [x, y]
     */
    function generateBezier(points, parameters, leftTangent, rightTangent) {
        var bezCurve,
            //Bezier curve ctl pts
        A,
            a,
            //Precomputed rhs for eqn
        C,
            X,
            //Matrices C & X
        det_C0_C1,
            det_C0_X,
            det_X_C1,
            //Determinants of matrices
        alpha_l,
            alpha_r,
            //Alpha values, left and right

        epsilon,
            segLength,
            i,
            len,
            tmp,
            u,
            ux,
            firstPoint = points[0],
            lastPoint = points[points.length - 1];

        bezCurve = [firstPoint, null, null, lastPoint];
        //console.log('gb', parameters.length);

        //Compute the A's
        A = maths.zeros_Xx2x2(parameters.length);
        for (i = 0, len = parameters.length; i < len; i++) {
            u = parameters[i];
            ux = 1 - u;
            a = A[i];

            a[0] = maths.mulItems(leftTangent, 3 * u * (ux * ux));
            a[1] = maths.mulItems(rightTangent, 3 * ux * (u * u));
        }

        //Create the C and X matrices
        C = [[0, 0], [0, 0]];
        X = [0, 0];
        for (i = 0, len = points.length; i < len; i++) {
            u = parameters[i];
            a = A[i];

            C[0][0] += maths.dot(a[0], a[0]);
            C[0][1] += maths.dot(a[0], a[1]);
            C[1][0] += maths.dot(a[0], a[1]);
            C[1][1] += maths.dot(a[1], a[1]);

            tmp = maths.subtract(points[i], bezier.q([firstPoint, firstPoint, lastPoint, lastPoint], u));

            X[0] += maths.dot(a[0], tmp);
            X[1] += maths.dot(a[1], tmp);
        }

        //Compute the determinants of C and X
        det_C0_C1 = C[0][0] * C[1][1] - C[1][0] * C[0][1];
        det_C0_X = C[0][0] * X[1] - C[1][0] * X[0];
        det_X_C1 = X[0] * C[1][1] - X[1] * C[0][1];

        //Finally, derive alpha values
        alpha_l = det_C0_C1 === 0 ? 0 : det_X_C1 / det_C0_C1;
        alpha_r = det_C0_C1 === 0 ? 0 : det_C0_X / det_C0_C1;

        //If alpha negative, use the Wu/Barsky heuristic (see text).
        //If alpha is 0, you get coincident control points that lead to
        //divide by zero in any subsequent NewtonRaphsonRootFind() call.
        segLength = maths.vectorLen(maths.subtract(firstPoint, lastPoint));
        epsilon = 1.0e-6 * segLength;
        if (alpha_l < epsilon || alpha_r < epsilon) {
            //Fall back on standard (probably inaccurate) formula, and subdivide further if needed.
            bezCurve[1] = maths.addArrays(firstPoint, maths.mulItems(leftTangent, segLength / 3.0));
            bezCurve[2] = maths.addArrays(lastPoint, maths.mulItems(rightTangent, segLength / 3.0));
        } else {
            //First and last control points of the Bezier curve are
            //positioned exactly at the first and last data points
            //Control points 1 and 2 are positioned an alpha distance out
            //on the tangent vectors, left and right, respectively
            bezCurve[1] = maths.addArrays(firstPoint, maths.mulItems(leftTangent, alpha_l));
            bezCurve[2] = maths.addArrays(lastPoint, maths.mulItems(rightTangent, alpha_r));
        }

        return bezCurve;
    };

    /**
     * Given set of points and their parameterization, try to find a better parameterization.
     *
     * @param {Array<Array<Number>>} bezier - Current fitted curve
     * @param {Array<Array<Number>>} points - Array of digitized points
     * @param {Array<Number>} parameters - Current parameter values
     * @returns {Array<Number>} New parameter values
     */
    function reparameterize(bezier, points, parameters) {
        /*
        var j, len, point, results, u;
        results = [];
        for (j = 0, len = points.length; j < len; j++) {
            point = points[j], u = parameters[j];
              results.push(newtonRaphsonRootFind(bezier, point, u));
        }
        return results;
        //*/
        return parameters.map(function (p, i) {
            return newtonRaphsonRootFind(bezier, points[i], p);
        });
    };

    /**
     * Use Newton-Raphson iteration to find better root.
     *
     * @param {Array<Array<Number>>} bez - Current fitted curve
     * @param {Array<Number>} point - Digitized point
     * @param {Number} u - Parameter value for "P"
     * @returns {Number} New u
     */
    function newtonRaphsonRootFind(bez, point, u) {
        /*
            Newton's root finding algorithm calculates f(x)=0 by reiterating
            x_n+1 = x_n - f(x_n)/f'(x_n)
            We are trying to find curve parameter u for some point p that minimizes
            the distance from that point to the curve. Distance point to curve is d=q(u)-p.
            At minimum distance the point is perpendicular to the curve.
            We are solving
            f = q(u)-p * q'(u) = 0
            with
            f' = q'(u) * q'(u) + q(u)-p * q''(u)
            gives
            u_n+1 = u_n - |q(u_n)-p * q'(u_n)| / |q'(u_n)**2 + q(u_n)-p * q''(u_n)|
        */

        var d = maths.subtract(bezier.q(bez, u), point),
            qprime = bezier.qprime(bez, u),
            numerator = /*sum(*/maths.mulMatrix(d, qprime) /*)*/
        ,
            denominator = maths.sum(maths.addItems(maths.squareItems(qprime), maths.mulMatrix(d, bezier.qprimeprime(bez, u))));

        if (denominator === 0) {
            return u;
        } else {
            return u - numerator / denominator;
        }
    };

    /**
     * Assign parameter values to digitized points using relative distances between points.
     *
     * @param {Array<Array<Number>>} points - Array of digitized points
     * @returns {Array<Number>} Parameter values
     */
    function chordLengthParameterize(points) {
        var u = [],
            currU,
            prevU,
            prevP;

        points.forEach(function (p, i) {
            currU = i ? prevU + maths.vectorLen(maths.subtract(p, prevP)) : 0;
            u.push(currU);

            prevU = currU;
            prevP = p;
        });
        u = u.map(function (x) {
            return x / prevU;
        });

        return u;
    };

    /**
     * Find the maximum squared distance of digitized points to fitted curve.
     *
     * @param {Array<Array<Number>>} points - Array of digitized points
     * @param {Array<Array<Number>>} bez - Fitted curve
     * @param {Array<Number>} parameters - Parameterization of points
     * @returns {Array<Number>} Maximum error (squared) and point of max error
     */
    function computeMaxError(points, bez, parameters) {
        var dist, //Current error
        maxDist, //Maximum error
        splitPoint, //Point of maximum error
        v, //Vector from point to curve
        i, count, point, t;

        maxDist = 0;
        splitPoint = points.length / 2;

        var t_distMap = mapTtoRelativeDistances(bez, 10);

        for (i = 0, count = points.length; i < count; i++) {
            point = points[i];
            //Find 't' for a point on the bez curve that's as close to 'point' as possible:
            t = find_t(bez, parameters[i], t_distMap, 10);

            v = maths.subtract(bezier.q(bez, t), point);
            dist = v[0] * v[0] + v[1] * v[1];

            if (dist > maxDist) {
                maxDist = dist;
                splitPoint = i;
            }
        }

        return [maxDist, splitPoint];
    };

    //Sample 't's and map them to relative distances along the curve:
    var mapTtoRelativeDistances = function mapTtoRelativeDistances(bez, B_parts) {
        var B_t_curr;
        var B_t_dist = [0];
        var B_t_prev = bez[0];
        var sumLen = 0;

        for (var i = 1; i <= B_parts; i++) {
            B_t_curr = bezier.q(bez, i / B_parts);

            sumLen += maths.vectorLen(maths.subtract(B_t_curr, B_t_prev));

            B_t_dist.push(sumLen);
            B_t_prev = B_t_curr;
        }

        //Normalize B_length to the same interval as the parameter distances; 0 to 1:
        B_t_dist = B_t_dist.map(function (x) {
            return x / sumLen;
        });
        return B_t_dist;
    };

    function find_t(bez, param, t_distMap, B_parts) {
        if (param < 0) {
            return 0;
        }
        if (param > 1) {
            return 1;
        }

        /*
            'param' is a value between 0 and 1 telling us the relative position
            of a point on the source polyline (linearly from the start (0) to the end (1)).
            To see if a given curve - 'bez' - is a close approximation of the polyline,
            we compare such a poly-point to the point on the curve that's the same
            relative distance along the curve's length.
              But finding that curve-point takes a little work:
            There is a function "B(t)" to find points along a curve from the parametric parameter 't'
            (also relative from 0 to 1: http://stackoverflow.com/a/32841764/1869660
                                        http://pomax.github.io/bezierinfo/#explanation),
            but 't' isn't linear by length (http://gamedev.stackexchange.com/questions/105230).
              So, we sample some points along the curve using a handful of values for 't'.
            Then, we calculate the length between those samples via plain euclidean distance;
            B(t) concentrates the points around sharp turns, so this should give us a good-enough outline of the curve.
            Thus, for a given relative distance ('param'), we can now find an upper and lower value
            for the corresponding 't' by searching through those sampled distances.
            Finally, we just use linear interpolation to find a better value for the exact 't'.
              More info:
                http://gamedev.stackexchange.com/questions/105230/points-evenly-spaced-along-a-bezier-curve
                http://stackoverflow.com/questions/29438398/cheap-way-of-calculating-cubic-bezier-length
                http://steve.hollasch.net/cgindex/curves/cbezarclen.html
                https://github.com/retuxx/tinyspline
        */
        var lenMax, lenMin, tMax, tMin, t;

        //Find the two t-s that the current param distance lies between,
        //and then interpolate a somewhat accurate value for the exact t:
        for (var i = 1; i <= B_parts; i++) {

            if (param <= t_distMap[i]) {
                tMin = (i - 1) / B_parts;
                tMax = i / B_parts;
                lenMin = t_distMap[i - 1];
                lenMax = t_distMap[i];

                t = (param - lenMin) / (lenMax - lenMin) * (tMax - tMin) + tMin;
                break;
            }
        }
        return t;
    }

    /**
     * Creates a vector of length 1 which shows the direction from B to A
     */
    function createTangent(pointA, pointB) {
        return maths.normalize(maths.subtract(pointA, pointB));
    }

    /*
        Simplified versions of what we need from math.js
        Optimized for our input, which is only numbers and 1x2 arrays (i.e. [x, y] coordinates).
    */

    var maths = function () {
        function maths() {
            _classCallCheck(this, maths);
        }

        maths.zeros_Xx2x2 = function zeros_Xx2x2(x) {
            var zs = [];
            while (x--) {
                zs.push([0, 0]);
            }
            return zs;
        };

        maths.mulItems = function mulItems(items, multiplier) {
            //return items.map(x => x*multiplier);
            return [items[0] * multiplier, items[1] * multiplier];
        };

        maths.mulMatrix = function mulMatrix(m1, m2) {
            //https://en.wikipedia.org/wiki/Matrix_multiplication#Matrix_product_.28two_matrices.29
            //Simplified to only handle 1-dimensional matrices (i.e. arrays) of equal length:
            //  return m1.reduce((sum,x1,i) => sum + (x1*m2[i]),
            //                   0);
            return m1[0] * m2[0] + m1[1] * m2[1];
        };

        maths.subtract = function subtract(arr1, arr2) {
            //return arr1.map((x1, i) => x1 - arr2[i]);
            return [arr1[0] - arr2[0], arr1[1] - arr2[1]];
        };

        maths.addArrays = function addArrays(arr1, arr2) {
            //return arr1.map((x1, i) => x1 + arr2[i]);
            return [arr1[0] + arr2[0], arr1[1] + arr2[1]];
        };

        maths.addItems = function addItems(items, addition) {
            //return items.map(x => x+addition);
            return [items[0] + addition, items[1] + addition];
        };

        maths.sum = function sum(items) {
            return items.reduce(function (sum, x) {
                return sum + x;
            });
        };

        maths.dot = function dot(m1, m2) {
            return maths.mulMatrix(m1, m2);
        };

        maths.vectorLen = function vectorLen(v) {
            var a = v[0],
                b = v[1];
            return Math.sqrt(a * a + b * b);
        };

        maths.divItems = function divItems(items, divisor) {
            //return items.map(x => x/divisor);
            return [items[0] / divisor, items[1] / divisor];
        };

        maths.squareItems = function squareItems(items) {
            //return items.map(x => x*x);
            var a = items[0],
                b = items[1];
            return [a * a, b * b];
        };

        maths.normalize = function normalize(v) {
            return this.divItems(v, this.vectorLen(v));
        };

        return maths;
    }();

    var bezier = function () {
        function bezier() {
            _classCallCheck(this, bezier);
        }

        bezier.q = function q(ctrlPoly, t) {
            var tx = 1.0 - t;
            var pA = maths.mulItems(ctrlPoly[0], tx * tx * tx),
                pB = maths.mulItems(ctrlPoly[1], 3 * tx * tx * t),
                pC = maths.mulItems(ctrlPoly[2], 3 * tx * t * t),
                pD = maths.mulItems(ctrlPoly[3], t * t * t);
            return maths.addArrays(maths.addArrays(pA, pB), maths.addArrays(pC, pD));
        };

        bezier.qprime = function qprime(ctrlPoly, t) {
            var tx = 1.0 - t;
            var pA = maths.mulItems(maths.subtract(ctrlPoly[1], ctrlPoly[0]), 3 * tx * tx),
                pB = maths.mulItems(maths.subtract(ctrlPoly[2], ctrlPoly[1]), 6 * tx * t),
                pC = maths.mulItems(maths.subtract(ctrlPoly[3], ctrlPoly[2]), 3 * t * t);
            return maths.addArrays(maths.addArrays(pA, pB), pC);
        };

        bezier.qprimeprime = function qprimeprime(ctrlPoly, t) {
            return maths.addArrays(maths.mulItems(maths.addArrays(maths.subtract(ctrlPoly[2], maths.mulItems(ctrlPoly[1], 2)), ctrlPoly[0]), 6 * (1.0 - t)), maths.mulItems(maths.addArrays(maths.subtract(ctrlPoly[3], maths.mulItems(ctrlPoly[2], 2)), ctrlPoly[1]), 6 * t));
        };

        return bezier;
    }();

    module.exports = fitCurve;
});

},{}],3:[function(require,module,exports){
// http://geoexamples.com/path-properties/ Version 0.4.10. Copyright 2019 Roger Veciana i Rovira.
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.spp = {}));
}(this, function (exports) { 'use strict';

	//Parses an SVG path into an object.
	//Taken from https://github.com/jkroso/parse-svg-path
	//Re-written so it can be used with rollup
	var length = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0};
	var segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig;

	function parse(path) {
	  var data = [];
		path.replace(segment, function(_, command, args){
			var type = command.toLowerCase();
			args = parseValues(args);

			// overloaded moveTo
			if (type === 'm' && args.length > 2) {
				data.push([command].concat(args.splice(0, 2)));
				type = 'l';
				command = command === 'm' ? 'l' : 'L';
			}

			while (args.length >= 0) {
				if (args.length === length[type]) {
					args.unshift(command);
					return data.push(args);
				}
				if (args.length < length[type]) {
	        throw new Error('malformed path data');
	      }
				data.push([command].concat(args.splice(0, length[type])));
			}
		});
	  return data;
	}

	var number = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig;

	function parseValues(args) {
		var numbers = args.match(number);
		return numbers ? numbers.map(Number) : [];
	}

	//Calculate Bezier curve length and positionAtLength
	//Algorithms taken from http://bl.ocks.org/hnakamur/e7efd0602bfc15f66fc5, https://gist.github.com/tunght13488/6744e77c242cc7a94859 and http://stackoverflow.com/questions/11854907/calculate-the-length-of-a-segment-of-a-quadratic-bezier

	function Bezier(ax, ay, bx, by, cx, cy, dx, dy) {
	  return new Bezier$1(ax, ay, bx, by, cx, cy, dx, dy);
	}

	function Bezier$1(ax, ay, bx, by, cx, cy, dx, dy) {
	  this.a = {x:ax, y:ay};
	  this.b = {x:bx, y:by};
	  this.c = {x:cx, y:cy};
	  this.d = {x:dx, y:dy};

	  if(dx !== null && dx !== undefined && dy !== null && dy !== undefined){
	    this.getArcLength = getCubicArcLength;
	    this.getPoint = cubicPoint;
	    this.getDerivative = cubicDerivative;
	  } else {
	    this.getArcLength = getQuadraticArcLength;
	    this.getPoint = quadraticPoint;
	    this.getDerivative = quadraticDerivative;
	  }

	  this.init();
	}

	Bezier$1.prototype = {
	  constructor: Bezier$1,
	  init: function() {
	    
	    this.length = this.getArcLength([this.a.x, this.b.x, this.c.x, this.d.x],
	                                    [this.a.y, this.b.y, this.c.y, this.d.y]);
	  },

	  getTotalLength: function() {
	    return this.length;
	  },
	  getPointAtLength: function(length) {
	    var t = t2length(length, this.length, this.getArcLength,
	                    [this.a.x, this.b.x, this.c.x, this.d.x],
	                    [this.a.y, this.b.y, this.c.y, this.d.y]);

	    return this.getPoint([this.a.x, this.b.x, this.c.x, this.d.x],
	                                    [this.a.y, this.b.y, this.c.y, this.d.y],
	                                  t);
	  },
	  getTangentAtLength: function(length){
	    var t = t2length(length, this.length, this.getArcLength,
	                    [this.a.x, this.b.x, this.c.x, this.d.x],
	                    [this.a.y, this.b.y, this.c.y, this.d.y]);

	    var derivative = this.getDerivative([this.a.x, this.b.x, this.c.x, this.d.x],
	                    [this.a.y, this.b.y, this.c.y, this.d.y], t);
	    var mdl = Math.sqrt(derivative.x * derivative.x + derivative.y * derivative.y);
	    var tangent;
	    if (mdl > 0){
	      tangent = {x: derivative.x/mdl, y: derivative.y/mdl};
	    } else {
	      tangent = {x: 0, y: 0};
	    }
	    return tangent;
	  },
	  getPropertiesAtLength: function(length){
	    var t = t2length(length, this.length, this.getArcLength,
	                    [this.a.x, this.b.x, this.c.x, this.d.x],
	                    [this.a.y, this.b.y, this.c.y, this.d.y]);

	    var derivative = this.getDerivative([this.a.x, this.b.x, this.c.x, this.d.x],
	                    [this.a.y, this.b.y, this.c.y, this.d.y], t);
	    var mdl = Math.sqrt(derivative.x * derivative.x + derivative.y * derivative.y);
	    var tangent;
	    if (mdl > 0){
	      tangent = {x: derivative.x/mdl, y: derivative.y/mdl};
	    } else {
	      tangent = {x: 0, y: 0};
	    }
	    var point = this.getPoint([this.a.x, this.b.x, this.c.x, this.d.x],
	                                    [this.a.y, this.b.y, this.c.y, this.d.y],
	                                  t);
	    return {x: point.x, y: point.y, tangentX: tangent.x, tangentY: tangent.y};
	  }
	};

	function quadraticDerivative(xs, ys, t){
	  return {x: (1 - t) * 2*(xs[1] - xs[0]) +t * 2*(xs[2] - xs[1]),
	    y: (1 - t) * 2*(ys[1] - ys[0]) +t * 2*(ys[2] - ys[1])
	  };
	}

	function cubicDerivative(xs, ys, t){
	  var derivative = quadraticPoint(
	            [3*(xs[1] - xs[0]), 3*(xs[2] - xs[1]), 3*(xs[3] - xs[2])],
	            [3*(ys[1] - ys[0]), 3*(ys[2] - ys[1]), 3*(ys[3] - ys[2])],
	            t);
	  return derivative;
	}

	function t2length(length, total_length, func, xs, ys){
	  var error = 1;
	  var t = length/total_length;
	  var step = (length - func(xs, ys, t))/total_length;

	  var numIterations = 0;
	  while (error > 0.001){
	    var increasedTLength = func(xs, ys, t + step);
	    var decreasedTLength = func(xs, ys, t - step);
	    var increasedTError = Math.abs(length - increasedTLength) / total_length;
	    var decreasedTError = Math.abs(length - decreasedTLength) / total_length;
	    if (increasedTError < error) {
	      error = increasedTError;
	      t += step;
	    } else if (decreasedTError < error) {
	      error = decreasedTError;
	      t -= step;
	    } else {
	      step /= 2;
	    }

	    numIterations++;
	    if(numIterations > 500){
	      break;
	    }
	  }

	  return t;
	}

	function quadraticPoint(xs, ys, t){
	  var x = (1 - t) * (1 - t) * xs[0] + 2 * (1 - t) * t * xs[1] + t * t * xs[2];
	  var y = (1 - t) * (1 - t) * ys[0] + 2 * (1 - t) * t * ys[1] + t * t * ys[2];
	  return {x: x, y: y};
	}

	function cubicPoint(xs, ys, t){
	  var x = (1 - t) * (1 - t) * (1 - t) * xs[0] + 3 * (1 - t) * (1 - t) * t * xs[1] +
	  3 * (1 - t) * t * t * xs[2] + t * t * t * xs[3];
	  var y = (1 - t) * (1 - t) * (1 - t) * ys[0] + 3 * (1 - t) * (1 - t) * t * ys[1] +
	  3 * (1 - t) * t * t * ys[2] + t * t * t * ys[3];

	  return {x: x, y: y};
	}

	function getQuadraticArcLength(xs, ys, t) {
	  if (t === undefined) {
	    t = 1;
	  }
	   var ax = xs[0] - 2 * xs[1] + xs[2];
	   var ay = ys[0] - 2 * ys[1] + ys[2];
	   var bx = 2 * xs[1] - 2 * xs[0];
	   var by = 2 * ys[1] - 2 * ys[0];

	   var A = 4 * (ax * ax + ay * ay);
	   var B = 4 * (ax * bx + ay * by);
	   var C = bx * bx + by * by;

	   if(A === 0){
	     return t * Math.sqrt(Math.pow(xs[2] - xs[0], 2) + Math.pow(ys[2] - ys[0], 2));
	   }
	   var b = B/(2*A);
	   var c = C/A;
	   var u = t + b;
	   var k = c - b*b;

	   var uuk = (u*u+k)>0?Math.sqrt(u*u+k):0;
	   var bbk = (b*b+k)>0?Math.sqrt(b*b+k):0;
	   var term = ((b+Math.sqrt(b*b+k)))!==0?k*Math.log(Math.abs((u+uuk)/(b+bbk))):0;
	   
	   return (Math.sqrt(A)/2)*(
	     u*uuk-b*bbk+
	     term
	   );

	}

	// Legendre-Gauss abscissae (xi values, defined at i=n as the roots of the nth order Legendre polynomial Pn(x))
	var tValues = [
	  [],
	  [],
	  [-0.5773502691896257645091487805019574556476,0.5773502691896257645091487805019574556476],
	  [0,-0.7745966692414833770358530799564799221665,0.7745966692414833770358530799564799221665],
	  [-0.3399810435848562648026657591032446872005,0.3399810435848562648026657591032446872005,-0.8611363115940525752239464888928095050957,0.8611363115940525752239464888928095050957],
	  [0,-0.5384693101056830910363144207002088049672,0.5384693101056830910363144207002088049672,-0.9061798459386639927976268782993929651256,0.9061798459386639927976268782993929651256],
	  [0.6612093864662645136613995950199053470064,-0.6612093864662645136613995950199053470064,-0.2386191860831969086305017216807119354186,0.2386191860831969086305017216807119354186,-0.9324695142031520278123015544939946091347,0.9324695142031520278123015544939946091347],
	  [0, 0.4058451513773971669066064120769614633473,-0.4058451513773971669066064120769614633473,-0.7415311855993944398638647732807884070741,0.7415311855993944398638647732807884070741,-0.9491079123427585245261896840478512624007,0.9491079123427585245261896840478512624007],
	  [-0.1834346424956498049394761423601839806667,0.1834346424956498049394761423601839806667,-0.5255324099163289858177390491892463490419,0.5255324099163289858177390491892463490419,-0.7966664774136267395915539364758304368371,0.7966664774136267395915539364758304368371,-0.9602898564975362316835608685694729904282,0.9602898564975362316835608685694729904282],
	  [0,-0.8360311073266357942994297880697348765441,0.8360311073266357942994297880697348765441,-0.9681602395076260898355762029036728700494,0.9681602395076260898355762029036728700494,-0.3242534234038089290385380146433366085719,0.3242534234038089290385380146433366085719,-0.6133714327005903973087020393414741847857,0.6133714327005903973087020393414741847857],
	  [-0.1488743389816312108848260011297199846175,0.1488743389816312108848260011297199846175,-0.4333953941292471907992659431657841622000,0.4333953941292471907992659431657841622000,-0.6794095682990244062343273651148735757692,0.6794095682990244062343273651148735757692,-0.8650633666889845107320966884234930485275,0.8650633666889845107320966884234930485275,-0.9739065285171717200779640120844520534282,0.9739065285171717200779640120844520534282],
	  [0,-0.2695431559523449723315319854008615246796,0.2695431559523449723315319854008615246796,-0.5190961292068118159257256694586095544802,0.5190961292068118159257256694586095544802,-0.7301520055740493240934162520311534580496,0.7301520055740493240934162520311534580496,-0.8870625997680952990751577693039272666316,0.8870625997680952990751577693039272666316,-0.9782286581460569928039380011228573907714,0.9782286581460569928039380011228573907714],
	  [-0.1252334085114689154724413694638531299833,0.1252334085114689154724413694638531299833,-0.3678314989981801937526915366437175612563,0.3678314989981801937526915366437175612563,-0.5873179542866174472967024189405342803690,0.5873179542866174472967024189405342803690,-0.7699026741943046870368938332128180759849,0.7699026741943046870368938332128180759849,-0.9041172563704748566784658661190961925375,0.9041172563704748566784658661190961925375,-0.9815606342467192506905490901492808229601,0.9815606342467192506905490901492808229601],
	  [0,-0.2304583159551347940655281210979888352115,0.2304583159551347940655281210979888352115,-0.4484927510364468528779128521276398678019,0.4484927510364468528779128521276398678019,-0.6423493394403402206439846069955156500716,0.6423493394403402206439846069955156500716,-0.8015780907333099127942064895828598903056,0.8015780907333099127942064895828598903056,-0.9175983992229779652065478365007195123904,0.9175983992229779652065478365007195123904,-0.9841830547185881494728294488071096110649,0.9841830547185881494728294488071096110649],
	  [-0.1080549487073436620662446502198347476119,0.1080549487073436620662446502198347476119,-0.3191123689278897604356718241684754668342,0.3191123689278897604356718241684754668342,-0.5152486363581540919652907185511886623088,0.5152486363581540919652907185511886623088,-0.6872929048116854701480198030193341375384,0.6872929048116854701480198030193341375384,-0.8272013150697649931897947426503949610397,0.8272013150697649931897947426503949610397,-0.9284348836635735173363911393778742644770,0.9284348836635735173363911393778742644770,-0.9862838086968123388415972667040528016760,0.9862838086968123388415972667040528016760],
	  [0,-0.2011940939974345223006283033945962078128,0.2011940939974345223006283033945962078128,-0.3941513470775633698972073709810454683627,0.3941513470775633698972073709810454683627,-0.5709721726085388475372267372539106412383,0.5709721726085388475372267372539106412383,-0.7244177313601700474161860546139380096308,0.7244177313601700474161860546139380096308,-0.8482065834104272162006483207742168513662,0.8482065834104272162006483207742168513662,-0.9372733924007059043077589477102094712439,0.9372733924007059043077589477102094712439,-0.9879925180204854284895657185866125811469,0.9879925180204854284895657185866125811469],
	  [-0.0950125098376374401853193354249580631303,0.0950125098376374401853193354249580631303,-0.2816035507792589132304605014604961064860,0.2816035507792589132304605014604961064860,-0.4580167776572273863424194429835775735400,0.4580167776572273863424194429835775735400,-0.6178762444026437484466717640487910189918,0.6178762444026437484466717640487910189918,-0.7554044083550030338951011948474422683538,0.7554044083550030338951011948474422683538,-0.8656312023878317438804678977123931323873,0.8656312023878317438804678977123931323873,-0.9445750230732325760779884155346083450911,0.9445750230732325760779884155346083450911,-0.9894009349916499325961541734503326274262,0.9894009349916499325961541734503326274262],
	  [0,-0.1784841814958478558506774936540655574754,0.1784841814958478558506774936540655574754,-0.3512317634538763152971855170953460050405,0.3512317634538763152971855170953460050405,-0.5126905370864769678862465686295518745829,0.5126905370864769678862465686295518745829,-0.6576711592166907658503022166430023351478,0.6576711592166907658503022166430023351478,-0.7815140038968014069252300555204760502239,0.7815140038968014069252300555204760502239,-0.8802391537269859021229556944881556926234,0.8802391537269859021229556944881556926234,-0.9506755217687677612227169578958030214433,0.9506755217687677612227169578958030214433,-0.9905754753144173356754340199406652765077,0.9905754753144173356754340199406652765077],
	  [-0.0847750130417353012422618529357838117333,0.0847750130417353012422618529357838117333,-0.2518862256915055095889728548779112301628,0.2518862256915055095889728548779112301628,-0.4117511614628426460359317938330516370789,0.4117511614628426460359317938330516370789,-0.5597708310739475346078715485253291369276,0.5597708310739475346078715485253291369276,-0.6916870430603532078748910812888483894522,0.6916870430603532078748910812888483894522,-0.8037049589725231156824174550145907971032,0.8037049589725231156824174550145907971032,-0.8926024664975557392060605911271455154078,0.8926024664975557392060605911271455154078,-0.9558239495713977551811958929297763099728,0.9558239495713977551811958929297763099728,-0.9915651684209309467300160047061507702525,0.9915651684209309467300160047061507702525],
	  [0,-0.1603586456402253758680961157407435495048,0.1603586456402253758680961157407435495048,-0.3165640999636298319901173288498449178922,0.3165640999636298319901173288498449178922,-0.4645707413759609457172671481041023679762,0.4645707413759609457172671481041023679762,-0.6005453046616810234696381649462392798683,0.6005453046616810234696381649462392798683,-0.7209661773352293786170958608237816296571,0.7209661773352293786170958608237816296571,-0.8227146565371428249789224867127139017745,0.8227146565371428249789224867127139017745,-0.9031559036148179016426609285323124878093,0.9031559036148179016426609285323124878093,-0.9602081521348300308527788406876515266150,0.9602081521348300308527788406876515266150,-0.9924068438435844031890176702532604935893,0.9924068438435844031890176702532604935893],
	  [-0.0765265211334973337546404093988382110047,0.0765265211334973337546404093988382110047,-0.2277858511416450780804961953685746247430,0.2277858511416450780804961953685746247430,-0.3737060887154195606725481770249272373957,0.3737060887154195606725481770249272373957,-0.5108670019508270980043640509552509984254,0.5108670019508270980043640509552509984254,-0.6360536807265150254528366962262859367433,0.6360536807265150254528366962262859367433,-0.7463319064601507926143050703556415903107,0.7463319064601507926143050703556415903107,-0.8391169718222188233945290617015206853296,0.8391169718222188233945290617015206853296,-0.9122344282513259058677524412032981130491,0.9122344282513259058677524412032981130491,-0.9639719272779137912676661311972772219120,0.9639719272779137912676661311972772219120,-0.9931285991850949247861223884713202782226,0.9931285991850949247861223884713202782226],
	  [0,-0.1455618541608950909370309823386863301163,0.1455618541608950909370309823386863301163,-0.2880213168024010966007925160646003199090,0.2880213168024010966007925160646003199090,-0.4243421202074387835736688885437880520964,0.4243421202074387835736688885437880520964,-0.5516188358872198070590187967243132866220,0.5516188358872198070590187967243132866220,-0.6671388041974123193059666699903391625970,0.6671388041974123193059666699903391625970,-0.7684399634756779086158778513062280348209,0.7684399634756779086158778513062280348209,-0.8533633645833172836472506385875676702761,0.8533633645833172836472506385875676702761,-0.9200993341504008287901871337149688941591,0.9200993341504008287901871337149688941591,-0.9672268385663062943166222149076951614246,0.9672268385663062943166222149076951614246,-0.9937521706203895002602420359379409291933,0.9937521706203895002602420359379409291933],
	  [-0.0697392733197222212138417961186280818222,0.0697392733197222212138417961186280818222,-0.2078604266882212854788465339195457342156,0.2078604266882212854788465339195457342156,-0.3419358208920842251581474204273796195591,0.3419358208920842251581474204273796195591,-0.4693558379867570264063307109664063460953,0.4693558379867570264063307109664063460953,-0.5876404035069115929588769276386473488776,0.5876404035069115929588769276386473488776,-0.6944872631866827800506898357622567712673,0.6944872631866827800506898357622567712673,-0.7878168059792081620042779554083515213881,0.7878168059792081620042779554083515213881,-0.8658125777203001365364256370193787290847,0.8658125777203001365364256370193787290847,-0.9269567721871740005206929392590531966353,0.9269567721871740005206929392590531966353,-0.9700604978354287271239509867652687108059,0.9700604978354287271239509867652687108059,-0.9942945854823992920730314211612989803930,0.9942945854823992920730314211612989803930],
	  [0,-0.1332568242984661109317426822417661370104,0.1332568242984661109317426822417661370104,-0.2641356809703449305338695382833096029790,0.2641356809703449305338695382833096029790,-0.3903010380302908314214888728806054585780,0.3903010380302908314214888728806054585780,-0.5095014778460075496897930478668464305448,0.5095014778460075496897930478668464305448,-0.6196098757636461563850973116495956533871,0.6196098757636461563850973116495956533871,-0.7186613631319501944616244837486188483299,0.7186613631319501944616244837486188483299,-0.8048884016188398921511184069967785579414,0.8048884016188398921511184069967785579414,-0.8767523582704416673781568859341456716389,0.8767523582704416673781568859341456716389,-0.9329710868260161023491969890384229782357,0.9329710868260161023491969890384229782357,-0.9725424712181152319560240768207773751816,0.9725424712181152319560240768207773751816,-0.9947693349975521235239257154455743605736,0.9947693349975521235239257154455743605736],
	  [-0.0640568928626056260850430826247450385909,0.0640568928626056260850430826247450385909,-0.1911188674736163091586398207570696318404,0.1911188674736163091586398207570696318404,-0.3150426796961633743867932913198102407864,0.3150426796961633743867932913198102407864,-0.4337935076260451384870842319133497124524,0.4337935076260451384870842319133497124524,-0.5454214713888395356583756172183723700107,0.5454214713888395356583756172183723700107,-0.6480936519369755692524957869107476266696,0.6480936519369755692524957869107476266696,-0.7401241915785543642438281030999784255232,0.7401241915785543642438281030999784255232,-0.8200019859739029219539498726697452080761,0.8200019859739029219539498726697452080761,-0.8864155270044010342131543419821967550873,0.8864155270044010342131543419821967550873,-0.9382745520027327585236490017087214496548,0.9382745520027327585236490017087214496548,-0.9747285559713094981983919930081690617411,0.9747285559713094981983919930081690617411,-0.9951872199970213601799974097007368118745,0.9951872199970213601799974097007368118745]
	];

	// Legendre-Gauss weights (wi values, defined by a function linked to in the Bezier primer article)
	var cValues = [
	  [],[],
	  [1.0,1.0],
	  [0.8888888888888888888888888888888888888888,0.5555555555555555555555555555555555555555,0.5555555555555555555555555555555555555555],
	  [0.6521451548625461426269360507780005927646,0.6521451548625461426269360507780005927646,0.3478548451374538573730639492219994072353,0.3478548451374538573730639492219994072353],
	  [0.5688888888888888888888888888888888888888,0.4786286704993664680412915148356381929122,0.4786286704993664680412915148356381929122,0.2369268850561890875142640407199173626432,0.2369268850561890875142640407199173626432],
	  [0.3607615730481386075698335138377161116615,0.3607615730481386075698335138377161116615,0.4679139345726910473898703439895509948116,0.4679139345726910473898703439895509948116,0.1713244923791703450402961421727328935268,0.1713244923791703450402961421727328935268],
	  [0.4179591836734693877551020408163265306122,0.3818300505051189449503697754889751338783,0.3818300505051189449503697754889751338783,0.2797053914892766679014677714237795824869,0.2797053914892766679014677714237795824869,0.1294849661688696932706114326790820183285,0.1294849661688696932706114326790820183285],
	  [0.3626837833783619829651504492771956121941,0.3626837833783619829651504492771956121941,0.3137066458778872873379622019866013132603,0.3137066458778872873379622019866013132603,0.2223810344533744705443559944262408844301,0.2223810344533744705443559944262408844301,0.1012285362903762591525313543099621901153,0.1012285362903762591525313543099621901153],
	  [0.3302393550012597631645250692869740488788,0.1806481606948574040584720312429128095143,0.1806481606948574040584720312429128095143,0.0812743883615744119718921581105236506756,0.0812743883615744119718921581105236506756,0.3123470770400028400686304065844436655987,0.3123470770400028400686304065844436655987,0.2606106964029354623187428694186328497718,0.2606106964029354623187428694186328497718],
	  [0.2955242247147528701738929946513383294210,0.2955242247147528701738929946513383294210,0.2692667193099963550912269215694693528597,0.2692667193099963550912269215694693528597,0.2190863625159820439955349342281631924587,0.2190863625159820439955349342281631924587,0.1494513491505805931457763396576973324025,0.1494513491505805931457763396576973324025,0.0666713443086881375935688098933317928578,0.0666713443086881375935688098933317928578],
	  [0.2729250867779006307144835283363421891560,0.2628045445102466621806888698905091953727,0.2628045445102466621806888698905091953727,0.2331937645919904799185237048431751394317,0.2331937645919904799185237048431751394317,0.1862902109277342514260976414316558916912,0.1862902109277342514260976414316558916912,0.1255803694649046246346942992239401001976,0.1255803694649046246346942992239401001976,0.0556685671161736664827537204425485787285,0.0556685671161736664827537204425485787285],
	  [0.2491470458134027850005624360429512108304,0.2491470458134027850005624360429512108304,0.2334925365383548087608498989248780562594,0.2334925365383548087608498989248780562594,0.2031674267230659217490644558097983765065,0.2031674267230659217490644558097983765065,0.1600783285433462263346525295433590718720,0.1600783285433462263346525295433590718720,0.1069393259953184309602547181939962242145,0.1069393259953184309602547181939962242145,0.0471753363865118271946159614850170603170,0.0471753363865118271946159614850170603170],
	  [0.2325515532308739101945895152688359481566,0.2262831802628972384120901860397766184347,0.2262831802628972384120901860397766184347,0.2078160475368885023125232193060527633865,0.2078160475368885023125232193060527633865,0.1781459807619457382800466919960979955128,0.1781459807619457382800466919960979955128,0.1388735102197872384636017768688714676218,0.1388735102197872384636017768688714676218,0.0921214998377284479144217759537971209236,0.0921214998377284479144217759537971209236,0.0404840047653158795200215922009860600419,0.0404840047653158795200215922009860600419],
	  [0.2152638534631577901958764433162600352749,0.2152638534631577901958764433162600352749,0.2051984637212956039659240656612180557103,0.2051984637212956039659240656612180557103,0.1855383974779378137417165901251570362489,0.1855383974779378137417165901251570362489,0.1572031671581935345696019386238421566056,0.1572031671581935345696019386238421566056,0.1215185706879031846894148090724766259566,0.1215185706879031846894148090724766259566,0.0801580871597602098056332770628543095836,0.0801580871597602098056332770628543095836,0.0351194603317518630318328761381917806197,0.0351194603317518630318328761381917806197],
	  [0.2025782419255612728806201999675193148386,0.1984314853271115764561183264438393248186,0.1984314853271115764561183264438393248186,0.1861610000155622110268005618664228245062,0.1861610000155622110268005618664228245062,0.1662692058169939335532008604812088111309,0.1662692058169939335532008604812088111309,0.1395706779261543144478047945110283225208,0.1395706779261543144478047945110283225208,0.1071592204671719350118695466858693034155,0.1071592204671719350118695466858693034155,0.0703660474881081247092674164506673384667,0.0703660474881081247092674164506673384667,0.0307532419961172683546283935772044177217,0.0307532419961172683546283935772044177217],
	  [0.1894506104550684962853967232082831051469,0.1894506104550684962853967232082831051469,0.1826034150449235888667636679692199393835,0.1826034150449235888667636679692199393835,0.1691565193950025381893120790303599622116,0.1691565193950025381893120790303599622116,0.1495959888165767320815017305474785489704,0.1495959888165767320815017305474785489704,0.1246289712555338720524762821920164201448,0.1246289712555338720524762821920164201448,0.0951585116824927848099251076022462263552,0.0951585116824927848099251076022462263552,0.0622535239386478928628438369943776942749,0.0622535239386478928628438369943776942749,0.0271524594117540948517805724560181035122,0.0271524594117540948517805724560181035122],
	  [0.1794464703562065254582656442618856214487,0.1765627053669926463252709901131972391509,0.1765627053669926463252709901131972391509,0.1680041021564500445099706637883231550211,0.1680041021564500445099706637883231550211,0.1540457610768102880814315948019586119404,0.1540457610768102880814315948019586119404,0.1351363684685254732863199817023501973721,0.1351363684685254732863199817023501973721,0.1118838471934039710947883856263559267358,0.1118838471934039710947883856263559267358,0.0850361483171791808835353701910620738504,0.0850361483171791808835353701910620738504,0.0554595293739872011294401653582446605128,0.0554595293739872011294401653582446605128,0.0241483028685479319601100262875653246916,0.0241483028685479319601100262875653246916],
	  [0.1691423829631435918406564701349866103341,0.1691423829631435918406564701349866103341,0.1642764837458327229860537764659275904123,0.1642764837458327229860537764659275904123,0.1546846751262652449254180038363747721932,0.1546846751262652449254180038363747721932,0.1406429146706506512047313037519472280955,0.1406429146706506512047313037519472280955,0.1225552067114784601845191268002015552281,0.1225552067114784601845191268002015552281,0.1009420441062871655628139849248346070628,0.1009420441062871655628139849248346070628,0.0764257302548890565291296776166365256053,0.0764257302548890565291296776166365256053,0.0497145488949697964533349462026386416808,0.0497145488949697964533349462026386416808,0.0216160135264833103133427102664524693876,0.0216160135264833103133427102664524693876],
	  [0.1610544498487836959791636253209167350399,0.1589688433939543476499564394650472016787,0.1589688433939543476499564394650472016787,0.1527660420658596667788554008976629984610,0.1527660420658596667788554008976629984610,0.1426067021736066117757461094419029724756,0.1426067021736066117757461094419029724756,0.1287539625393362276755157848568771170558,0.1287539625393362276755157848568771170558,0.1115666455473339947160239016817659974813,0.1115666455473339947160239016817659974813,0.0914900216224499994644620941238396526609,0.0914900216224499994644620941238396526609,0.0690445427376412265807082580060130449618,0.0690445427376412265807082580060130449618,0.0448142267656996003328381574019942119517,0.0448142267656996003328381574019942119517,0.0194617882297264770363120414644384357529,0.0194617882297264770363120414644384357529],
	  [0.1527533871307258506980843319550975934919,0.1527533871307258506980843319550975934919,0.1491729864726037467878287370019694366926,0.1491729864726037467878287370019694366926,0.1420961093183820513292983250671649330345,0.1420961093183820513292983250671649330345,0.1316886384491766268984944997481631349161,0.1316886384491766268984944997481631349161,0.1181945319615184173123773777113822870050,0.1181945319615184173123773777113822870050,0.1019301198172404350367501354803498761666,0.1019301198172404350367501354803498761666,0.0832767415767047487247581432220462061001,0.0832767415767047487247581432220462061001,0.0626720483341090635695065351870416063516,0.0626720483341090635695065351870416063516,0.0406014298003869413310399522749321098790,0.0406014298003869413310399522749321098790,0.0176140071391521183118619623518528163621,0.0176140071391521183118619623518528163621],
	  [0.1460811336496904271919851476833711882448,0.1445244039899700590638271665537525436099,0.1445244039899700590638271665537525436099,0.1398873947910731547221334238675831108927,0.1398873947910731547221334238675831108927,0.1322689386333374617810525744967756043290,0.1322689386333374617810525744967756043290,0.1218314160537285341953671771257335983563,0.1218314160537285341953671771257335983563,0.1087972991671483776634745780701056420336,0.1087972991671483776634745780701056420336,0.0934444234560338615532897411139320884835,0.0934444234560338615532897411139320884835,0.0761001136283793020170516533001831792261,0.0761001136283793020170516533001831792261,0.0571344254268572082836358264724479574912,0.0571344254268572082836358264724479574912,0.0369537897708524937999506682993296661889,0.0369537897708524937999506682993296661889,0.0160172282577743333242246168584710152658,0.0160172282577743333242246168584710152658],
	  [0.1392518728556319933754102483418099578739,0.1392518728556319933754102483418099578739,0.1365414983460151713525738312315173965863,0.1365414983460151713525738312315173965863,0.1311735047870623707329649925303074458757,0.1311735047870623707329649925303074458757,0.1232523768105124242855609861548144719594,0.1232523768105124242855609861548144719594,0.1129322960805392183934006074217843191142,0.1129322960805392183934006074217843191142,0.1004141444428809649320788378305362823508,0.1004141444428809649320788378305362823508,0.0859416062170677274144436813727028661891,0.0859416062170677274144436813727028661891,0.0697964684245204880949614189302176573987,0.0697964684245204880949614189302176573987,0.0522933351526832859403120512732112561121,0.0522933351526832859403120512732112561121,0.0337749015848141547933022468659129013491,0.0337749015848141547933022468659129013491,0.0146279952982722006849910980471854451902,0.0146279952982722006849910980471854451902],
	  [0.1336545721861061753514571105458443385831,0.1324620394046966173716424647033169258050,0.1324620394046966173716424647033169258050,0.1289057221880821499785953393997936532597,0.1289057221880821499785953393997936532597,0.1230490843067295304675784006720096548158,0.1230490843067295304675784006720096548158,0.1149966402224113649416435129339613014914,0.1149966402224113649416435129339613014914,0.1048920914645414100740861850147438548584,0.1048920914645414100740861850147438548584,0.0929157660600351474770186173697646486034,0.0929157660600351474770186173697646486034,0.0792814117767189549228925247420432269137,0.0792814117767189549228925247420432269137,0.0642324214085258521271696151589109980391,0.0642324214085258521271696151589109980391,0.0480376717310846685716410716320339965612,0.0480376717310846685716410716320339965612,0.0309880058569794443106942196418845053837,0.0309880058569794443106942196418845053837,0.0134118594871417720813094934586150649766,0.0134118594871417720813094934586150649766],
	  [0.1279381953467521569740561652246953718517,0.1279381953467521569740561652246953718517,0.1258374563468282961213753825111836887264,0.1258374563468282961213753825111836887264,0.1216704729278033912044631534762624256070,0.1216704729278033912044631534762624256070,0.1155056680537256013533444839067835598622,0.1155056680537256013533444839067835598622,0.1074442701159656347825773424466062227946,0.1074442701159656347825773424466062227946,0.0976186521041138882698806644642471544279,0.0976186521041138882698806644642471544279,0.0861901615319532759171852029837426671850,0.0861901615319532759171852029837426671850,0.0733464814110803057340336152531165181193,0.0733464814110803057340336152531165181193,0.0592985849154367807463677585001085845412,0.0592985849154367807463677585001085845412,0.0442774388174198061686027482113382288593,0.0442774388174198061686027482113382288593,0.0285313886289336631813078159518782864491,0.0285313886289336631813078159518782864491,0.0123412297999871995468056670700372915759,0.0123412297999871995468056670700372915759]
	];

	// LUT for binomial coefficient arrays per curve order 'n'
	var binomialCoefficients = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]];

	// Look up what the binomial coefficient is for pair {n,k}
	function binomials(n, k) {
	  return binomialCoefficients[n][k];
	}

	/**
	 * Compute the curve derivative (hodograph) at t.
	 */
	function getDerivative(derivative, t, vs) {
	  // the derivative of any 't'-less function is zero.
	  var n = vs.length - 1,
	      _vs,
	      value,
	      k;
	  if (n === 0) {
	    return 0;
	  }

	  // direct values? compute!
	  if (derivative === 0) {
	    value = 0;
	    for (k = 0; k <= n; k++) {
	      value += binomials(n, k) * Math.pow(1 - t, n - k) * Math.pow(t, k) * vs[k];
	    }
	    return value;
	  } else {
	    // Still some derivative? go down one order, then try
	    // for the lower order curve's.
	    _vs = new Array(n);
	    for (k = 0; k < n; k++) {
	      _vs[k] = n * (vs[k + 1] - vs[k]);
	    }
	    return getDerivative(derivative - 1, t, _vs);
	  }
	}

	function B(xs, ys, t) {
	  var xbase = getDerivative(1, t, xs);
	  var ybase = getDerivative(1, t, ys);
	  var combined = xbase * xbase + ybase * ybase;
	  return Math.sqrt(combined);
	}

	function getCubicArcLength(xs, ys, t) {
	  var z, sum, i, correctedT;

	  /*if (xs.length >= tValues.length) {
	    throw new Error('too high n bezier');
	  }*/

	  if (t === undefined) {
	    t = 1;
	  }
	  var n = 20;

	  z = t / 2;
	  sum = 0;
	  for (i = 0; i < n; i++) {
	    correctedT = z * tValues[n][i] + z;
	    sum += cValues[n][i] * B(xs, ys, correctedT);
	  }
	  return z * sum;
	}

	//Calculate ans Arc curve length and positionAtLength
	//The point in ellipse functions have been taken from https://github.com/MadLittleMods/svg-curve-lib/tree/f07d6008a673816f4cb74a3269164b430c3a95cb

	function Arc(x0, y0, rx,ry, xAxisRotate, LargeArcFlag,SweepFlag, x,y) {
	  return new Arc$1(x0, y0, rx,ry, xAxisRotate, LargeArcFlag,SweepFlag, x,y);
	}

	function Arc$1(x0, y0,rx,ry, xAxisRotate, LargeArcFlag, SweepFlag,x1,y1) {
	  this.x0 = x0;
	  this.y0 = y0;
	  this.rx = rx;
	  this.ry = ry;
	  this.xAxisRotate = xAxisRotate;
	  this.LargeArcFlag = LargeArcFlag;
	  this.SweepFlag = SweepFlag;
	  this.x1 = x1;
	  this.y1 = y1;

	  var lengthProperties = approximateArcLengthOfCurve(300, function(t) {
	    return pointOnEllipticalArc({x: x0, y:y0}, rx, ry, xAxisRotate,
	                                 LargeArcFlag, SweepFlag, {x: x1, y:y1}, t);
	  });

	  this.length = lengthProperties.arcLength;
	}

	Arc$1.prototype = {
	  constructor: Arc$1,
	  init: function() {

	    
	  },

	  getTotalLength: function() {
	    return this.length;
	  },
	  getPointAtLength: function(fractionLength) {
	    
	    if(fractionLength < 0){
	      fractionLength = 0;
	    } else if(fractionLength > this.length){
	      fractionLength = this.length;
	    }
	    
	    var position = pointOnEllipticalArc({x: this.x0, y:this.y0}, 
	      this.rx, this.ry, this.xAxisRotate,
	      this.LargeArcFlag, this.SweepFlag,
	      {x: this.x1, y: this.y1},
	      fractionLength/this.length);
	     
	    return {x: position.x, y: position.y};

	  },
	  getTangentAtLength: function(fractionLength) {
	    if(fractionLength < 0){
	        fractionLength = 0;
	        } else if(fractionLength > this.length){
	        fractionLength = this.length;
	        }
	        var position = pointOnEllipticalArc({x: this.x0, y:this.y0}, 
	          this.rx, this.ry, this.xAxisRotate,
	          this.LargeArcFlag, this.SweepFlag,
	          {x: this.x1, y: this.y1},
	          fractionLength/this.length); 
	        return {x: Math.cos(position.ellipticalArcAngle - Math.PI/2), y: Math.sin(position.ellipticalArcAngle - Math.PI/2)};
	        
	  },
	  getPropertiesAtLength: function(fractionLength){
	    var tangent = this.getTangentAtLength(fractionLength);
	    var point = this.getPointAtLength(fractionLength);
	    return {x: point.x, y: point.y, tangentX: tangent.x, tangentY: tangent.y};
	  }
	};

	function pointOnEllipticalArc(p0, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p1, t) {

	  // In accordance to: http://www.w3.org/TR/SVG/implnote.html#ArcOutOfRangeParameters
	  rx = Math.abs(rx);
	  ry = Math.abs(ry);
	  xAxisRotation = mod(xAxisRotation, 360);
	  var xAxisRotationRadians = toRadians(xAxisRotation);
	  // If the endpoints are identical, then this is equivalent to omitting the elliptical arc segment entirely.
	  if(p0.x === p1.x && p0.y === p1.y) {
	    return p0;
	  }
	  
	  // If rx = 0 or ry = 0 then this arc is treated as a straight line segment joining the endpoints.    
	  if(rx === 0 || ry === 0) {
	    return this.pointOnLine(p0, p1, t);
	  }

	  
	  // Following "Conversion from endpoint to center parameterization"
	  // http://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
	  
	  // Step #1: Compute transformedPoint
	  var dx = (p0.x-p1.x)/2;
	  var dy = (p0.y-p1.y)/2;
	  var transformedPoint = {
	    x: Math.cos(xAxisRotationRadians)*dx + Math.sin(xAxisRotationRadians)*dy,
	    y: -Math.sin(xAxisRotationRadians)*dx + Math.cos(xAxisRotationRadians)*dy
	  };
	  // Ensure radii are large enough
	  var radiiCheck = Math.pow(transformedPoint.x, 2)/Math.pow(rx, 2) + Math.pow(transformedPoint.y, 2)/Math.pow(ry, 2);
	  if(radiiCheck > 1) {
	    rx = Math.sqrt(radiiCheck)*rx;
	    ry = Math.sqrt(radiiCheck)*ry;
	  }

	  // Step #2: Compute transformedCenter
	  var cSquareNumerator = Math.pow(rx, 2)*Math.pow(ry, 2) - Math.pow(rx, 2)*Math.pow(transformedPoint.y, 2) - Math.pow(ry, 2)*Math.pow(transformedPoint.x, 2);
	  var cSquareRootDenom = Math.pow(rx, 2)*Math.pow(transformedPoint.y, 2) + Math.pow(ry, 2)*Math.pow(transformedPoint.x, 2);
	  var cRadicand = cSquareNumerator/cSquareRootDenom;
	  // Make sure this never drops below zero because of precision
	  cRadicand = cRadicand < 0 ? 0 : cRadicand;
	  var cCoef = (largeArcFlag !== sweepFlag ? 1 : -1) * Math.sqrt(cRadicand);
	  var transformedCenter = {
	    x: cCoef*((rx*transformedPoint.y)/ry),
	    y: cCoef*(-(ry*transformedPoint.x)/rx)
	  };

	  // Step #3: Compute center
	  var center = {
	    x: Math.cos(xAxisRotationRadians)*transformedCenter.x - Math.sin(xAxisRotationRadians)*transformedCenter.y + ((p0.x+p1.x)/2),
	    y: Math.sin(xAxisRotationRadians)*transformedCenter.x + Math.cos(xAxisRotationRadians)*transformedCenter.y + ((p0.y+p1.y)/2)
	  };

	  
	  // Step #4: Compute start/sweep angles
	  // Start angle of the elliptical arc prior to the stretch and rotate operations.
	  // Difference between the start and end angles
	  var startVector = {
	    x: (transformedPoint.x-transformedCenter.x)/rx,
	    y: (transformedPoint.y-transformedCenter.y)/ry
	  };
	  var startAngle = angleBetween({
	    x: 1,
	    y: 0
	  }, startVector);
	  
	  var endVector = {
	    x: (-transformedPoint.x-transformedCenter.x)/rx,
	    y: (-transformedPoint.y-transformedCenter.y)/ry
	  };
	  var sweepAngle = angleBetween(startVector, endVector);
	  
	  if(!sweepFlag && sweepAngle > 0) {
	    sweepAngle -= 2*Math.PI;
	  }
	  else if(sweepFlag && sweepAngle < 0) {
	    sweepAngle += 2*Math.PI;
	  }
	  // We use % instead of `mod(..)` because we want it to be -360deg to 360deg(but actually in radians)
	  sweepAngle %= 2*Math.PI;
	  
	  // From http://www.w3.org/TR/SVG/implnote.html#ArcParameterizationAlternatives
	  var angle = startAngle+(sweepAngle*t);
	  var ellipseComponentX = rx*Math.cos(angle);
	  var ellipseComponentY = ry*Math.sin(angle);
	  
	  var point = {
	    x: Math.cos(xAxisRotationRadians)*ellipseComponentX - Math.sin(xAxisRotationRadians)*ellipseComponentY + center.x,
	    y: Math.sin(xAxisRotationRadians)*ellipseComponentX + Math.cos(xAxisRotationRadians)*ellipseComponentY + center.y
	  };

	  // Attach some extra info to use
	  point.ellipticalArcStartAngle = startAngle;
	  point.ellipticalArcEndAngle = startAngle+sweepAngle;
	  point.ellipticalArcAngle = angle;

	  point.ellipticalArcCenter = center;
	  point.resultantRx = rx;
	  point.resultantRy = ry;

	  

	  return point;
	}

	function approximateArcLengthOfCurve(resolution, pointOnCurveFunc) {
	  // Resolution is the number of segments we use
	  resolution = resolution ? resolution : 500;
	  
	  var resultantArcLength = 0;
	  var arcLengthMap = [];
	  var approximationLines = [];

	  var prevPoint = pointOnCurveFunc(0);
	  var nextPoint;
	  for(var i = 0; i < resolution; i++) {
	    var t = clamp(i*(1/resolution), 0, 1);
	    nextPoint = pointOnCurveFunc(t);
	    resultantArcLength += distance(prevPoint, nextPoint);
	    approximationLines.push([prevPoint, nextPoint]);

	    arcLengthMap.push({
	      t: t,
	      arcLength: resultantArcLength
	    });
	    
	    prevPoint = nextPoint;
	  }
	  // Last stretch to the endpoint
	  nextPoint = pointOnCurveFunc(1);
	  approximationLines.push([prevPoint, nextPoint]);
	  resultantArcLength += distance(prevPoint, nextPoint);
	  arcLengthMap.push({
	    t: 1,
	    arcLength: resultantArcLength
	  });

	  return {
	    arcLength: resultantArcLength,
	    arcLengthMap: arcLengthMap,
	    approximationLines: approximationLines
	  };
	}

	function mod(x, m) {
	  return (x%m + m)%m;
	}

	function toRadians(angle) {
	  return angle * (Math.PI / 180);
	}

	function distance(p0, p1) {
	  return Math.sqrt(Math.pow(p1.x-p0.x, 2) + Math.pow(p1.y-p0.y, 2));
	}

	function clamp(val, min, max) {
	  return Math.min(Math.max(val, min), max);
	}


	function angleBetween(v0, v1) {
	  var p = v0.x*v1.x + v0.y*v1.y;
	  var n = Math.sqrt((Math.pow(v0.x, 2)+Math.pow(v0.y, 2)) * (Math.pow(v1.x, 2)+Math.pow(v1.y, 2)));
	  var sign = v0.x*v1.y - v0.y*v1.x < 0 ? -1 : 1;
	  var angle = sign*Math.acos(p/n);
	  
	  //var angle = Math.atan2(v0.y, v0.x) - Math.atan2(v1.y,  v1.x);
	  
	  return angle;
	}

	function LinearPosition(x0, x1, y0, y1) {
	  return new LinearPosition$1(x0, x1, y0, y1);

	}

	function LinearPosition$1(x0, x1, y0, y1){
	  this.x0 = x0;
	  this.x1 = x1;
	  this.y0 = y0;
	  this.y1 = y1;
	}

	LinearPosition$1.prototype.getTotalLength = function(){
	  return Math.sqrt(Math.pow(this.x0 - this.x1, 2) +
	         Math.pow(this.y0 - this.y1, 2));
	};

	LinearPosition$1.prototype.getPointAtLength = function(pos){
	  var fraction = pos/ (Math.sqrt(Math.pow(this.x0 - this.x1, 2) +
	         Math.pow(this.y0 - this.y1, 2)));

	  var newDeltaX = (this.x1 - this.x0)*fraction;
	  var newDeltaY = (this.y1 - this.y0)*fraction;
	  return { x: this.x0 + newDeltaX, y: this.y0 + newDeltaY };
	};
	LinearPosition$1.prototype.getTangentAtLength = function(){
	  var module = Math.sqrt((this.x1 - this.x0) * (this.x1 - this.x0) +
	              (this.y1 - this.y0) * (this.y1 - this.y0));
	  return { x: (this.x1 - this.x0)/module, y: (this.y1 - this.y0)/module };
	};
	LinearPosition$1.prototype.getPropertiesAtLength = function(pos){
	  var point = this.getPointAtLength(pos);
	  var tangent = this.getTangentAtLength();
	  return {x: point.x, y: point.y, tangentX: tangent.x, tangentY: tangent.y};
	};

	function pathProperties(svgString) {
	  var length = 0;
	  var partial_lengths = [];
	  var functions = [];

	  function svgProperties(string){
	    if(!string){return null;}
	    var parsed = parse(string);
	    var cur = [0, 0];
	    var prev_point = [0, 0];
	    var curve;
	    var ringStart;
	    for (var i = 0; i < parsed.length; i++){
	      //moveTo
	      if(parsed[i][0] === "M"){
	        cur = [parsed[i][1], parsed[i][2]];
	        ringStart = [cur[0], cur[1]];
	        functions.push(null);
	      } else if(parsed[i][0] === "m"){
	        cur = [parsed[i][1] + cur[0], parsed[i][2] + cur[1]];
	        ringStart = [cur[0], cur[1]];
	        functions.push(null);
	      }
	      //lineTo
	      else if(parsed[i][0] === "L"){
	        length = length + Math.sqrt(Math.pow(cur[0] - parsed[i][1], 2) + Math.pow(cur[1] - parsed[i][2], 2));
	        functions.push(new LinearPosition(cur[0], parsed[i][1], cur[1], parsed[i][2]));
	        cur = [parsed[i][1], parsed[i][2]];
	      } else if(parsed[i][0] === "l"){
	        length = length + Math.sqrt(Math.pow(parsed[i][1], 2) + Math.pow(parsed[i][2], 2));
	        functions.push(new LinearPosition(cur[0], parsed[i][1] + cur[0], cur[1], parsed[i][2] + cur[1]));
	        cur = [parsed[i][1] + cur[0], parsed[i][2] + cur[1]];
	      } else if(parsed[i][0] === "H"){
	        length = length + Math.abs(cur[0] - parsed[i][1]);
	        functions.push(new LinearPosition(cur[0], parsed[i][1], cur[1], cur[1]));
	        cur[0] = parsed[i][1];
	      } else if(parsed[i][0] === "h"){
	        length = length + Math.abs(parsed[i][1]);
	        functions.push(new LinearPosition(cur[0], cur[0] + parsed[i][1], cur[1], cur[1]));
	        cur[0] = parsed[i][1] + cur[0];
	      } else if(parsed[i][0] === "V"){
	        length = length + Math.abs(cur[1] - parsed[i][1]);
	        functions.push(new LinearPosition(cur[0], cur[0], cur[1], parsed[i][1]));
	        cur[1] = parsed[i][1];
	      } else if(parsed[i][0] === "v"){
	        length = length + Math.abs(parsed[i][1]);
	        functions.push(new LinearPosition(cur[0], cur[0], cur[1], cur[1] + parsed[i][1]));
	        cur[1] = parsed[i][1] + cur[1];
	      //Close path
	      }  else if(parsed[i][0] === "z" || parsed[i][0] === "Z"){
	        length = length + Math.sqrt(Math.pow(ringStart[0] - cur[0], 2) + Math.pow(ringStart[1] - cur[1], 2));
	        functions.push(new LinearPosition(cur[0], ringStart[0], cur[1], ringStart[1]));
	        cur = [ringStart[0], ringStart[1]];
	      }
	      //Cubic Bezier curves
	      else if(parsed[i][0] === "C"){
	        curve = new Bezier(cur[0], cur[1] , parsed[i][1], parsed[i][2] , parsed[i][3], parsed[i][4] , parsed[i][5], parsed[i][6]);
	        length = length + curve.getTotalLength();
	        cur = [parsed[i][5], parsed[i][6]];
	        functions.push(curve);
	      } else if(parsed[i][0] === "c"){
	        curve = new Bezier(cur[0], cur[1] , cur[0] + parsed[i][1], cur[1] + parsed[i][2] , cur[0] + parsed[i][3], cur[1] + parsed[i][4] , cur[0] + parsed[i][5], cur[1] + parsed[i][6]);
	        if(curve.getTotalLength() > 0){
	          length = length + curve.getTotalLength();
	          functions.push(curve);
	          cur = [parsed[i][5] + cur[0], parsed[i][6] + cur[1]];
	        } else {
	          functions.push(new LinearPosition(cur[0], cur[0], cur[1], cur[1]));
	        }
	      } else if(parsed[i][0] === "S"){
	        if(i>0 && ["C","c","S","s"].indexOf(parsed[i-1][0]) > -1){
	          curve = new Bezier(cur[0], cur[1] , 2*cur[0] - curve.c.x, 2*cur[1] - curve.c.y, parsed[i][1], parsed[i][2] , parsed[i][3], parsed[i][4]);
	        } else {
	          curve = new Bezier(cur[0], cur[1] , cur[0], cur[1], parsed[i][1], parsed[i][2] , parsed[i][3], parsed[i][4]);
	        }
	        length = length + curve.getTotalLength();
	        cur = [parsed[i][3], parsed[i][4]];
	        functions.push(curve);
	      }  else if(parsed[i][0] === "s"){ //240 225
	        if(i>0 && ["C","c","S","s"].indexOf(parsed[i-1][0]) > -1){
	          curve = new Bezier(cur[0], cur[1] , cur[0] + curve.d.x - curve.c.x, cur[1] + curve.d.y - curve.c.y, cur[0] + parsed[i][1], cur[1] + parsed[i][2] , cur[0] + parsed[i][3], cur[1] + parsed[i][4]);
	        } else {
	          curve = new Bezier(cur[0], cur[1] , cur[0], cur[1], cur[0] + parsed[i][1], cur[1] + parsed[i][2] , cur[0] + parsed[i][3], cur[1] + parsed[i][4]);
	        }
	        length = length + curve.getTotalLength();
	        cur = [parsed[i][3] + cur[0], parsed[i][4] + cur[1]];
	        functions.push(curve);
	      }
	      //Quadratic Bezier curves
	      else if(parsed[i][0] === "Q"){
	        if(cur[0] == parsed[i][1] && cur[1] == parsed[i][2]){
	          curve = new LinearPosition(parsed[i][1], parsed[i][3], parsed[i][2], parsed[i][4]);
	        } else {
	          curve = new Bezier(cur[0], cur[1] , parsed[i][1], parsed[i][2] , parsed[i][3], parsed[i][4]);
	        }
	        length = length + curve.getTotalLength();
	        functions.push(curve);
	        cur = [parsed[i][3], parsed[i][4]];
	        prev_point = [parsed[i][1], parsed[i][2]];

	      }  else if(parsed[i][0] === "q"){
	        if(!(parsed[i][1] == 0 && parsed[i][2] == 0)){
	          curve = new Bezier(cur[0], cur[1] , cur[0] + parsed[i][1], cur[1] + parsed[i][2] , cur[0] + parsed[i][3], cur[1] + parsed[i][4]);
	        } else {
	          curve = new LinearPosition(cur[0] + parsed[i][1], cur[0] + parsed[i][3], cur[1] + parsed[i][2], cur[1] + parsed[i][4]);
	        }
	        length = length + curve.getTotalLength();
	        prev_point = [cur[0] + parsed[i][1], cur[1] + parsed[i][2]];
	        cur = [parsed[i][3] + cur[0], parsed[i][4] + cur[1]];
	        functions.push(curve);
	      } else if(parsed[i][0] === "T"){
	        if(i>0 && ["Q","q","T","t"].indexOf(parsed[i-1][0]) > -1){
	          curve = new Bezier(cur[0], cur[1] , 2 * cur[0] - prev_point[0] , 2 * cur[1] - prev_point[1] , parsed[i][1], parsed[i][2]);
	        } else {
	          curve = new LinearPosition(cur[0], parsed[i][1], cur[1], parsed[i][2]);
	        }
	        functions.push(curve);
	        length = length + curve.getTotalLength();
	        prev_point = [2 * cur[0] - prev_point[0] , 2 * cur[1] - prev_point[1]];
	        cur = [parsed[i][1], parsed[i][2]];

	      } else if(parsed[i][0] === "t"){
	        if(i>0 && ["Q","q","T","t"].indexOf(parsed[i-1][0]) > -1){
	          curve = new Bezier(cur[0], cur[1] , 2 * cur[0] - prev_point[0] , 2 * cur[1] - prev_point[1] , cur[0] + parsed[i][1], cur[1] + parsed[i][2]);
	        } else {
	          curve = new LinearPosition(cur[0], cur[0] + parsed[i][1], cur[1], cur[1] + parsed[i][2]);
	        }
	        length = length + curve.getTotalLength();
	        prev_point = [2 * cur[0] - prev_point[0] , 2 * cur[1] - prev_point[1]];
	        cur = [parsed[i][1] + cur[0], parsed[i][2] + cur[0]];
	        functions.push(curve);
	      } else if(parsed[i][0] === "A"){
	        curve = new Arc(cur[0], cur[1], parsed[i][1], parsed[i][2], parsed[i][3], parsed[i][4], parsed[i][5], parsed[i][6], parsed[i][7]);

	        length = length + curve.getTotalLength();
	        cur = [parsed[i][6], parsed[i][7]];
	        functions.push(curve);
	      } else if(parsed[i][0] === "a"){
	        curve = new Arc(cur[0], cur[1], parsed[i][1], parsed[i][2], parsed[i][3], parsed[i][4], parsed[i][5], cur[0] + parsed[i][6], cur[1] + parsed[i][7]);

	        length = length + curve.getTotalLength();
	        cur = [cur[0] + parsed[i][6], cur[1] + parsed[i][7]];
	        functions.push(curve);
	      }
	      partial_lengths.push(length);

	    }
	    return svgProperties;
	  }

	 svgProperties.getTotalLength = function(){
	    return length;
	  };

	  svgProperties.getPointAtLength = function(fractionLength){
	    var fractionPart = getPartAtLength(fractionLength);
	    return functions[fractionPart.i].getPointAtLength(fractionPart.fraction);
	  };

	  svgProperties.getTangentAtLength = function(fractionLength){
	    var fractionPart = getPartAtLength(fractionLength);
	    return functions[fractionPart.i].getTangentAtLength(fractionPart.fraction);
	  };

	  svgProperties.getPropertiesAtLength = function(fractionLength){
	    var fractionPart = getPartAtLength(fractionLength);
	    return functions[fractionPart.i].getPropertiesAtLength(fractionPart.fraction);
	  };

	  svgProperties.getParts = function(){
	    var parts = [];
	    for(var i = 0; i< functions.length; i++){
	      if(functions[i] != null){
	        var properties = {};
	        properties['start'] = functions[i].getPointAtLength(0);
	        properties['end'] = functions[i].getPointAtLength(partial_lengths[i] - partial_lengths[i-1]);
	        properties['length'] = partial_lengths[i] - partial_lengths[i-1];
	        (function(func){
	          properties['getPointAtLength'] = function(d){return func.getPointAtLength(d);};
	          properties['getTangentAtLength'] = function(d){return func.getTangentAtLength(d);};
	          properties['getPropertiesAtLength'] = function(d){return func.getPropertiesAtLength(d);};
	        })(functions[i]);
	        
	        parts.push(properties);
	      }
	    }
	  
	    return parts;
	  };

	  var getPartAtLength = function(fractionLength){
	    if(fractionLength < 0){
	      fractionLength = 0;
	    } else if(fractionLength > length){
	      fractionLength = length;
	    }

	    var i = partial_lengths.length - 1;

	    while(partial_lengths[i] >= fractionLength && partial_lengths[i] > 0){
	      i--;
	    }
	    i++;
	    return {fraction: fractionLength-partial_lengths[i-1], i: i};
	  };

	  return svgProperties(svgString);
	}

	exports.Bezier = Bezier;
	exports.parse = parse;
	exports.svgPathProperties = pathProperties;

	Object.defineProperty(exports, '__esModule', { value: true });

}));

},{}]},{},[1]);
