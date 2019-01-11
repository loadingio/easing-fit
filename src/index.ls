require! <[fit-curve]>

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
    for x from seg.0 to seg.1 by (seg.1 - seg.0) / options.sample-count =>
      y = Math.round(func(x) * 1000) / 1000
      cur.push [Math.round(1000 * x) * 0.001 ,Math.round(1000 * y) * 0.001]
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
    for keyframe in keyframes =>
      str ++= ([
      "  #{keyframe.percent}% {"
      "    animation-timing-function: cubic-bezier(#{keyframe.cubic-bezier.join(',')});" if keyframe.cubic-bezier
      ].filter(->it) ++ (options.prop-func(keyframe).map(-> "    #it;"))) ++ ["  }"]
    str ++= "}"
    str = str.join('\n')
  else
    for keyframe in keyframes =>
      str ++= ([
      "  #{keyframe.percent}%"
      "    animation-timing-function: cubic-bezier(#{keyframe.cubic-bezier.join(',')})" if keyframe.cubic-bezier
      ].filter(->it) ++ (options.prop-func(keyframe).map(-> "    #it")))
    str = str.join('\n')
  return str

module.exports = {fit, to-keyframes, sample-func, round}
