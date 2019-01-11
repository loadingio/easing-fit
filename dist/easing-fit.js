// Generated by LiveScript 1.3.1
var fitCurve, round, sampleFunc, fit, toKeyframes;
fitCurve = require('fit-curve');
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
fit = function(func, options){
  var ref$, ox, oy, dy, count, segments, i$, to$, x, y, points, segIdx, seg, cur, j$, step$, to1$, py, keyframes, len$, ps, curves, len1$, curve, x1, x2, y1, y2, ncurve, k$, j;
  options == null && (options = {});
  options = import$({
    precision: 0.0001,
    sampleCount: 5,
    errorThreshold: 0.1,
    start: 0,
    end: 1
  }, options);
  ref$ = [options.start, 0, 1, 0, []], ox = ref$[0], oy = ref$[1], dy = ref$[2], count = ref$[3], segments = ref$[4];
  for (i$ = options.start, to$ = options.end; i$ <= to$; i$ += 0.0001) {
    x = i$;
    y = func(x);
    if (count > 2 && Math.sign(y - oy) * Math.sign(dy) < 0) {
      segments.push([ox, x]);
      ox = x;
    }
    dy = y - oy;
    oy = y;
    count = count + 1;
  }
  segments.push([ox, options.end]);
  points = [];
  for (i$ = 0, to$ = segments.length; i$ < to$; ++i$) {
    segIdx = i$;
    seg = segments[segIdx];
    cur = [];
    for (j$ = seg[0], to1$ = seg[1], step$ = (seg[1] - seg[0]) / options.sampleCount; step$ < 0 ? j$ >= to1$ : j$ <= to1$; j$ += step$) {
      x = j$;
      y = Math.round(func(x) * 1000) / 1000;
      cur.push([Math.round(1000 * x) * 0.001, Math.round(1000 * y) * 0.001]);
    }
    points.push(cur);
  }
  py = NaN;
  keyframes = [];
  for (i$ = 0, len$ = points.length; i$ < len$; ++i$) {
    ps = points[i$];
    curves = fitCurve(ps, options.errorThreshold);
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
        ncurve.push([Math.round(((curve[j][0] - x1) / (x2 - x1)) / options.precision) * options.precision, Math.round(((curve[j][1] - y1) / (y2 - y1)) / options.precision) * options.precision]);
      }
      keyframes.push({
        percent: round(x1 * 100),
        value: y1,
        cubicBezier: [ncurve[1][0], ncurve[1][1], ncurve[2][0], ncurve[2][1]].map(fn$)
      });
    }
  }
  keyframes.push({
    percent: options.end * 100,
    value: y2
  });
  return keyframes;
  function fn$(it){
    return round(it);
  }
};
toKeyframes = function(keyframes, options){
  var str, i$, len$, keyframe;
  options == null && (options = {});
  options = import$({
    propFunc: function(it){
      return ["content: \"" + it.value + "\" "];
    },
    name: null,
    format: 'stylus'
  }, options || {});
  str = options.name
    ? ["@keyframes " + options.name]
    : [];
  if (options.format === 'css') {
    str = str.concat("{");
    for (i$ = 0, len$ = keyframes.length; i$ < len$; ++i$) {
      keyframe = keyframes[i$];
      str = str.concat(["  " + keyframe.percent + "% {", keyframe.cubicBezier ? "    animation-timing-function: cubic-bezier(" + keyframe.cubicBezier.join(',') + ")" : void 8].filter(fn$).concat(options.propFunc(keyframe).map(fn1$)), ["  }"]);
    }
    str = str.concat("}");
    str = str.join('\n');
  } else {
    for (i$ = 0, len$ = keyframes.length; i$ < len$; ++i$) {
      keyframe = keyframes[i$];
      str = str.concat(["  " + keyframe.percent + "%", keyframe.cubicBezier ? "    animation-timing-function: cubic-bezier(" + keyframe.cubicBezier.join(',') + ")" : void 8].filter(fn2$).concat(options.propFunc(keyframe).map(fn3$)));
    }
    str = str.join('\n');
  }
  return str;
  function fn$(it){
    return it;
  }
  function fn1$(it){
    return "    " + it;
  }
  function fn2$(it){
    return it;
  }
  function fn3$(it){
    return "    " + it;
  }
};
module.exports = {
  fit: fit,
  toKeyframes: toKeyframes,
  sampleFunc: sampleFunc,
  round: round
};
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
