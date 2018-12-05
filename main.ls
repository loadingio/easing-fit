require! <[fit-curve]>

func = (t) -> 
  Math.abs(Math.sin(Math.pow(3 * t + 1.77, 2)) / ( Math.pow(3 * t + 2, 5 * t) + 1))

round = (n, d = 5) ->
  p = Math.pow(10, d)
  ret = "#{Math.round(n * p ) / p}".split(".")
  +(ret.0 + (if ret.1 => "." + ret.1.substring(0,d) else ""))

func-ptrs = []
cur = []
oy = 0
ox = 0
dy = 1
count = 0
segments = []
for x from 0.0 to 1 by 0.0001 =>
  y = func(x)
  if count>2 and Math.sign(y - oy) * Math.sign(dy) < 0 =>
    segments.push [ox, x]
    ox = x
  dy = y - oy
  oy = y
  count++
segments.push [ox, 1]
console.log segments

points = []
prec = 10
for seg-idx from 0 til segments.length =>
  seg = segments[seg-idx]
  cur = []
  for x from seg.0 to seg.1 by (seg.1 - seg.0) * 0.2 =>
    y = Math.round(func(x) * 1000) / 1000
    cur.push [Math.round(1000 * x) * 0.001 ,Math.round(1000 * y) * 0.001]
  points.push cur

console.log points

py = NaN
for ps in points =>
  curves = fit-curve ps, 0.1
  for curve in curves 
    x1 = curve.0.0
    x2 = curve.3.0
    y1 = curve.0.1
    y2 = curve.3.1
    ncurve = []
    #console.log py, y1, y2
    #if Math.round(100 * y2) - Math.round(100 * y1) == 0 => continue
    if Math.abs(y1 - py) < 0.5 * 0.01 => continue
    py = y1
    for j from 0 til 4 =>
      ncurve.push [
        Math.round(prec * (curve[j].0 - x1) / (x2 - x1)) / prec,
        Math.round(prec * (curve[j].1 - y1) / (y2 - y1)) / prec
      ]
    console.log(
    """
      #{round(x1 * 100)}%
        animation-timing-function: cubic-bezier(#{ncurve.1.0},#{ncurve.1.1},#{ncurve.2.0},#{ncurve.2.1})
        transform: translate(#{round(y1 * 100)}px)
    """
    )
console.log """
100%
  transform: translate(#{y2 * 100}px)
"""
