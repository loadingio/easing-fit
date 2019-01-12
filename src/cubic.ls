# Cubic ( x ^ 3 ) functions, based on Sheng Jin Formula ( 盛金公式 )
#   ref: https://zh.wikipedia.org/wiki/%E4%B8%89%E6%AC%A1%E6%96%B9%E7%A8%8B
# calculate f(x), or finding roots for f(x) = y

CubicFunc = (a, b, c, d) -> @ <<< {a, b, c, d}; return @
CubicFunc.prototype = Object.create(Object.prototype) <<< do
  calc: (x, a = @a, b = @b, c = @c, d = @d) ->
    return a * (x ** 3) + b * (x ** 2) + c * (x) + d
  root: (y = 0, a = @a, b = @b, c = @c, d = @d) ->
    d = d - y
    A = b * b - 3 * a * c
    B = b * c - 9 * a * d
    C = c * c - 3 * b * d
    delta = B * B - 4 * A * C
    if A == B and B == 0 => return [-b / (3 * a), -c / b, -3 * d / c]
    if delta > 0 =>
      y1 = A * b + 3 * a * ( -B + Math.sqrt( B * B - 4 * A * C )) / 2
      y2 = A * b + 3 * a * ( -B - Math.sqrt( B * B - 4 * A * C )) / 2
      x1 = (-b - (Math.cbrt(y1) + Math.cbrt(y2))) / ( 3 * a)
      return [x1]
    if delta == 0 =>
      k = B/A
      return [(-b / a) + k, -k/2, -k/2 ]
    if delta < 0 =>
      t = (2 * A * b - 3 * a * B) / (2 * A * Math.sqrt(A))
      theta = Math.acos t
      x1 = (-b - 2 * Math.sqrt(A) * Math.cos(theta / 3)) / (3 * a)
      x2 = (-b + Math.sqrt(A) * ( Math.cos(theta / 3) + Math.sqrt(3) * Math.sin(theta / 3))) / (3 * a)
      x3 = (-b + Math.sqrt(A) * ( Math.cos(theta / 3) - Math.sqrt(3) * Math.sin(theta / 3))) / (3 * a)
      return [x1, x2, x3]

CubicFunc.glsl = """
float cubic(float x, vec4 p) {
  return p.x * x * x * x + p.y * x * x + p.z * x + p.w;
}
float cubicRoot(float y, vec4 p) {
  float a,b,c,d;
  /* to be implement */
}
"""

module.exports = CubicFunc
