easing-fit = require "./index.ls"

func = easing-fit.sample-func

options = do
  prop-func: -> ["transform: translate(0,#{easing-fit.round(it.value * 100)}px)"]
  name: "bounce"
  format: "css"

ret = easing-fit.fit func, {}
easing-fit.to-keyframes ret, options
  .then -> console.log it
