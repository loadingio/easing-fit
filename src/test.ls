require! <[./cubic]>

for i from 0 til 10 =>
  [a,b,c,d] = [0 to 3].map -> Math.random! * 10
  func = new cubic a,b,c,d
  roots = func.root!
  console.log Math.floor(func.calc(roots.0) * 1000) * 0.001

