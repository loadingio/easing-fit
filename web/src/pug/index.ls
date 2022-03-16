f = (t) -> Math.abs(Math.sin(Math.pow(3 * t + 1.77, 2)) / ( Math.pow(3 * t + 2, 5 * t) + 1))
f = (t) -> t
ret = easingfit.to-keyframes f
console.log ret
console.log ret.length
window.ret = ret

f = (t) ->
  r = 100
  t = Math.PI * 2 * t
  x = (r * Math.cos(t)).toFixed(0)
  y = (r * Math.sin(t)).toFixed(0)
  [1, 0, 0, 1, x, y]

ret = ""
for i from 0 to 100 by 1 =>
  mat = f(i/100)
  ret += "#i% { transform: matrix(#{mat.join(',')})} "
ret = "@keyframes round { #ret } .circle { animation: round 20s linear infinite }"
style = document.createElement("style")
style.setAttribute \type, \text/css
style.textContent = ret
document.body.appendChild style
console.log ret.length
