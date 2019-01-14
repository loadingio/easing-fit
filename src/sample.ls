easing-fit = require "./index.ls"

func = easing-fit.sample-func

options = do
  prop-func: (f,i,c) -> {"transform": "translate(0,#{easing-fit.round(f.value * 100)}px)"}
  name: "bounce"
  format: "css"

ret = easing-fit.fit func, {}
css = easing-fit.to-keyframes ret, options
css = easing-fit.fit-to-keyframes func, options

console.log css

/* from waveform */
waveform = "M0,50c0,0,2,0.5,6.7,0c5.6-0.6,3.5-18.1,7.1-18.1s4.2,25.6,8.9,25.6s6.8-10.3,8.4-14c1.9-4.4,7.9-5.4,10.9,0.1C46.7,52.3,100,50,100,50"

ret = easing-fit.from-svg waveform
css = easing-fit.to-keyframes ret, options

console.log css
