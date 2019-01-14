require! <[fit-curve svg-path-properties]>

round = (n, d = 5) ->
  p = Math.pow(10, d)
  ret = "#{Math.round(n * p ) / p}".split(".")
  +(ret.0 + (if ret.1 => "." + ret.1.substring(0,d) else ""))

sample-func = (t) -> 
  Math.abs(Math.sin(Math.pow(3 * t + 1.77, 2)) / ( Math.pow(3 * t + 2, 5 * t) + 1))

# fitting function
# Parameters:
#   func: timing function func(t), t = 0 ~ 1
#   options:
#     precision: output value will be rounded to this precision
#     sample-count: how many points to sample for each segment
#     error-threshold: max error between a spline and target function
fit = (func, opt = {}) ->
  opt = {
    seg-sample-count: 100, precision: 0.0001, sample-count: 5, error-threshold: 0.1, start: 0, end: 1
  } <<< opt
  [ox, oy, dy, count, segments] = [opt.start, 0, 1, 0, []]

  # segment function according to its direction
  for x from opt.start to opt.end by 1/opt.seg-sample-count =>
    y = func(x)
    if count > 2 and Math.sign(y - oy) * Math.sign(dy) < 0 =>
      segments.push [ox, x]
      ox = x
    dy = y - oy
    oy = y
    count = count + 1
  segments.push [ox, opt.end]

  # now, sample each segment 
  points = [] # sampled points for each segment.
  for seg-idx from 0 til segments.length =>
    seg = segments[seg-idx]
    cur = []
    for x from seg.0 til seg.1 by (seg.1 - seg.0) / opt.sample-count =>
      y = Math.round(func(x) * 1000) / 1000
      cur.push [Math.round(1000 * x) * 0.001 ,Math.round(1000 * y) * 0.001]
    y = Math.round(func(seg.1) * 1000) / 1000
    cur.push [Math.round(1000 * seg.1) * 0.001 ,Math.round(1000 * y) * 0.001]

    points.push cur

  # for each segment, calculate spline
  py = NaN
  keyframes = []
  for ps in points =>
    curves = fit-curve ps, opt.error-threshold
    # for each spline, normalize and prepare the outpue array
    for curve in curves 
      x1 = curve.0.0
      x2 = curve.3.0
      y1 = curve.0.1
      y2 = curve.3.1
      ncurve = []
      if Math.abs(y1 - py) < 0.5 * 0.01 => continue
      py = y1
      for j from 0 til 4 =>
        ncurve.push [
          Math.round(((curve[j].0 - x1) / (x2 - x1)) / opt.precision) * opt.precision,
          Math.round(((curve[j].1 - y1) / (y2 - y1)) / opt.precision) * opt.precision
        ]
      keyframes.push do
        percent: round(x1 * 100)
        value: y1
        cubic-bezier: [ncurve.1.0, ncurve.1.1, ncurve.2.0, ncurve.2.1].map -> round(it)

  keyframes.push do
    percent: opt.end * 100
    value: y2
  return keyframes

# Convert keyframes array to string
# parameters:
#   keyframes: output of fit function
#   name: keyframe name. omit for naked keyframes.
#   prop-func: for customizing css properties to animate.
#     input:
#       f - keyframe object, such as {percent: 0, value: 1, cubic-bezier: [...]}
#       i - index of frame.
#       c - customized config for used in prop-func. defined by user.
#     output:  array of string.
#   format: one of following: "css", "stylus"
#   config: customized config for used in prop-func. defined by user.
to-keyframes = (keyframes, opt = {}) ->
  opt = {
    prop-func: (f, c)-> { content: "\"#{f.value}\"" }
    name: null
    format: \stylus
    config: {}
  } <<< (opt or {})
  str = if opt.name => ["@keyframes #{opt.name}"] else []
  if opt.format == \css =>
    str ++= "{"
    for i from 0 til keyframes.length =>
      keyframe = keyframes[i]
      props = [[k,v] for k,v of opt.prop-func(keyframe, i, opt.cfg)].map -> "    #{it.0}: #{it.1};"
      str ++= ([
      "  #{keyframe.percent}% {"
      "    animation-timing-function: cubic-bezier(#{keyframe.cubic-bezier.join(',')});" if keyframe.cubic-bezier
      ] ++ props ++ ["  }"]).filter(->it)
    str ++= "}"
    str = str.join('\n')
  else
    for i from 0 til keyframes.length =>
      keyframe = keyframes[i]
      props = [[k,v] for k,v of opt.prop-func(keyframe, i, opt.cfg)].map -> "    #{it.0}: #{it.1}"
      str ++= ([
      "  #{keyframe.percent}%"
      "    animation-timing-function: cubic-bezier(#{keyframe.cubic-bezier.join(',')})" if keyframe.cubic-bezier
      ] ++ props).filter(->it)
    str = str.join('\n')
  return str

# Shorthand for fit -> to-keyframes.
# options:  ( fit + tokeyframes options )
# /* fit options */
#   precision: output value will be rounded to this precision
#   sample-count: how many points to sample for each segment
#   error-threshold: max error between a spline and target function
# /* keyframes options */
#   name: keyframe name. omit for naked keyframes.
#   prop-func: for customizing css properties to animate.
#   format: one of following: "css", "stylus"
#   config: customized config for used in prop-func. defined by user.
fit-to-keyframes = (step, opt={}) ->
  ret = fit step, opt
  ret = to-keyframes ret, {prop-func: (->{}), format: \css} <<< opt{name, prop-func, format, config}
  return ret

sample-svg = "M0,50c0,0,2,0.5,6.7,0c5.6-0.6,3.5-18.1,7.1-18.1s4.2,25.6,8.9,25.6s6.8-10.3,8.4-14c1.9-4.4,7.9-5.4,10.9,0.1C46.7,52.3,100,50,100,50"

search-svg-path = (p, x, len, err = 0.01, r=[0, 1], lv = 20) ->
  m = (r.0 + r.1) * 0.5
  ptr = p.getPointAtLength(m * len)
  ptr = {x: ptr.x * 0.01, y: ptr.y * 0.01}
  if Math.abs(ptr.x - x) < err or lv <= 0 => return (0.5 - ptr.y) * 2
  if ptr.x > x => search-svg-path p, x, len, err, [r.0, (r.0 + r.1) * 0.5], lv - 1
  else if ptr.x < x => search-svg-path p, x, len, err, [(r.0 + r.1) * 0.5, r.1], lv - 1
  else return (0.5 - ptr.y) * 2

# d: <path d>
from-svg = (d, opt = {}) ->
  step = step-from-svg d
  fit step, opt

# if opt.presampling = true, enable presampling with opt.sample-count
step-from-svg = (pathd, opt  = {}) ->
  p = svg-path-properties.svg-path-properties pathd
  len = p.getTotalLength!
  step = (t) -> search-svg-path p, t, len, 0.001
  if !opt.presampling => return step
  pts = for i from 0 to 1 by 1/opt.sample-count => step i
  return (t) ->
    t = t * pts.length
    idx = Math.floor(t)
    if idx == pts.length - 1 => return pts[idx]
    return (pts[idx + 1] - pts[idx]) * (t -idx)

module.exports = {
  round,
  sample-func, sample-svg, fit-to-keyframes
  fit, from-svg, step-from-svg, to-keyframes
}
