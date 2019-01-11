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
fit = (func, options = {}) ->
  options = {precision: 0.0001, sample-count: 5, error-threshold: 0.1, start: 0, end: 1} <<< options
  [ox, oy, dy, count, segments] = [options.start, 0, 1, 0, []]

  # segment function according to its direction
  for x from options.start to options.end by 0.0001 =>
    y = func(x)
    if count > 2 and Math.sign(y - oy) * Math.sign(dy) < 0 =>
      segments.push [ox, x]
      ox = x
    dy = y - oy
    oy = y
    count = count + 1
  segments.push [ox, options.end]

  # now, sample each segment 
  points = [] # sampled points for each segment.
  for seg-idx from 0 til segments.length =>
    seg = segments[seg-idx]
    cur = []
    for x from seg.0 til seg.1 by (seg.1 - seg.0) / options.sample-count =>
      y = Math.round(func(x) * 1000) / 1000
      cur.push [Math.round(1000 * x) * 0.001 ,Math.round(1000 * y) * 0.001]
    y = Math.round(func(seg.1) * 1000) / 1000
    cur.push [Math.round(1000 * seg.1) * 0.001 ,Math.round(1000 * y) * 0.001]

    points.push cur

  # for each segment, calculate spline
  py = NaN
  keyframes = []
  for ps in points =>
    curves = fit-curve ps, options.error-threshold
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
          Math.round(((curve[j].0 - x1) / (x2 - x1)) / options.precision) * options.precision,
          Math.round(((curve[j].1 - y1) / (y2 - y1)) / options.precision) * options.precision
        ]
      keyframes.push do
        percent: round(x1 * 100)
        value: y1
        cubic-bezier: [ncurve.1.0, ncurve.1.1, ncurve.2.0, ncurve.2.1].map -> round(it)

  keyframes.push do
    percent: options.end * 100
    value: y2
  return keyframes

# Convert keyframes array to string
# parameters:
#   keyframes: output of fit function
#   name: keyframe name. omit for naked keyframes.
#   prop-func: for customizing css properties to animate.
#     input: keyframe object, such as {percent: 0, value: 1, cubic-bezier: [...]}
#     output:  array of string.
#   format: one of following: "css", "stylus"
to-keyframes = (keyframes, options = {}) ->
  options = {
    prop-func: -> ["""content: "#{it.value}" """]
    name: null
    format: \stylus
  } <<< (options or {})
  str = if options.name => ["@keyframes #{options.name}"] else []
  if options.format == \css =>
    str ++= "{"
    for i from 0 til keyframes.length =>
      keyframe = keyframes[i]
      str ++= ([
      "  #{keyframe.percent}% {"
      "    animation-timing-function: cubic-bezier(#{keyframe.cubic-bezier.join(',')});" if keyframe.cubic-bezier
      ].filter(->it) ++ (options.prop-func(keyframe,i).map(-> "    #it;"))) ++ ["  }"]
    str ++= "}"
    str = str.join('\n')
  else
    for i from 0 til keyframes.length =>
      keyframe = keyframes[i]
      str ++= ([
      "  #{keyframe.percent}%"
      "    animation-timing-function: cubic-bezier(#{keyframe.cubic-bezier.join(',')})" if keyframe.cubic-bezier
      ].filter(->it) ++ (options.prop-func(keyframe,i).map(-> "    #it")))
    str = str.join('\n')
  return str


sample-svg = "M0,50c0,0,2,0.5,6.7,0c5.6-0.6,3.5-18.1,7.1-18.1s4.2,25.6,8.9,25.6s6.8-10.3,8.4-14c1.9-4.4,7.9-5.4,10.9,0.1C46.7,52.3,100,50,100,50"

search-svg-path = (p, x, len, err = 0.01, r=[0, 1], lv = 20) ->
  m = (r.0 + r.1) * 0.5
  ptr = p.getPointAtLength(m * len)
  ptr = {x: ptr.x * 0.01, y: ptr.y * 0.01}
  if Math.abs(ptr.x - x) < err or lv <= 0 => return (0.5 - ptr.y) * 2
  if ptr.x > x => search-svg-path p, x, len, err, [r.0, (r.0 + r.1) * 0.5], lv - 1
  else if ptr.x < x => search-svg-path p, x, len, err, [(r.0 + r.1) * 0.5, r.1], lv - 1
  else return (0.5 - ptr.y) * 2

from-svg = (pathd, options = {}) ->
  step = step-from-svg pathd
  fit step, options

step-from-svg = (pathd) ->
  p = svg-path-properties.svg-path-properties pathd
  len = p.getTotalLength!
  return step = (t) -> search-svg-path p, t, len, 0.001


module.exports = {
  round,
  sample-func, sample-svg,
  fit, from-svg, step-from-svg, to-keyframes
}
