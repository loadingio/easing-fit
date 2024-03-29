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
