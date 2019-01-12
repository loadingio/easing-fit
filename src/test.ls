require! <[./index ./cubic]>


console.log "Test finding roots for Random Cubic Function ..."
for i from 0 til 10 =>
  [a,b,c,d] = [0 to 3].map -> Math.random! * 10
  func = new cubic.Func a,b,c,d
  roots = func.root!
  [a,b,c,d] = [a,b,c,d].map -> index.round it
  roots = roots.map -> index.round it
  console.log "Roots for #a * x^3 + #b * x^2 + #c * x + #d = 0: "
  console.log "  #{roots.join(' / ')}"
  console.log "  calc value from root 1(#{roots.0}) = #{index.round(func.calc(roots.0))} ( should ~ 0)"

console.log " ---------- " * 4

# our cubic-bezier parameters
p = [0.5, 0.5, 0.5, 0.5]                # straight line
p = [0.455, 0.03, 0.515, 0.955]         # ease-in-out-quad

# object corresponding to the equation
cobj = new cubic.Bezier p

# finding t for each x

console.log "Retriving points from cubic-bezier(#{p.join(',')})"
for i from 0 til 1 by 0.1 =>
  [x,y] = [cobj.x(i), cobj.y(i)]
  t = cobj.t(x)
  [i,x,y,t] = [i,x,y,t].map -> index.round it
  console.log "t=#i:"
  console.log "  x(t) = #x" 
  console.log "  y(t) = #y"
  console.log "  t ( reversed from x(t) ) = #t ( should = #i )"
