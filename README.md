# easing-fit

Fit any easing function with keyframes and cubic-bezier timing function.

For example, assume we have an equation for a bouncing ball's height:

```
    Math.abs(Math.sin(Math.pow(3 * t + 1.77, 2)) / ( Math.pow(3 * t + 2, 5 * t) + 1))
```


instead of simply sampling it with fixed interval of t, easing-fit breaks it into pieces of cubic bezier spline:

```
    @keyframes bouncing {
      0% {
        animation-timing-function: cubic-bezier(0,0.5,1,0.6);
        transform: translate(0.4px);
      }
      11.5% {
        animation-timing-function: cubic-bezier(0.7,0.2,0.8,0.7);
        transform: translate(36.9px);
      }
      24.6% {
        animation-timing-function: cubic-bezier(0.2,0.3,0.3,0.9);
        transform: translate(0px);
      }
      32.3% {
        animation-timing-function: cubic-bezier(0.5,0.2,0.7,0.6);
        transform: translate(13.8px);
      }
      43.3% {
        animation-timing-function: cubic-bezier(0.3,0.5,0.6,0.8);
        transform: translate(0px);
      }
      49.6% {
        animation-timing-function: cubic-bezier(0.4,0.1,0.7,0.6);
        transform: translate(4px);
      }
      59.2% {
        animation-timing-function: cubic-bezier(0.3,0.5,0.7,0.8);
        transform: translate(0px);
      }
      64.6% {
        animation-timing-function: cubic-bezier(0.3,0.2,0.7,0.7);
        transform: translate(1.1px);
      }
      73.1% {
        animation-timing-function: cubic-bezier(0.3,0.5,0.7,1);
        transform: translate(0px);
      }
      100% {
        transform: translate(0px);
      }
    }
```


# Usage

First, import easing-fit and use it to create a keyframes object for our customized easing function:

```
    easingFit = require("easing-fit");
    customFunc = function(t) {
      return Math.sin(t * Math.PI * 2);
    };
    keyframes = easingFit.fit(customFunc, {});
```

The keyframes object contains all information needed. Then, convert it to CSS keyframe string with this help function:

```
    var result = easingFit.toKeyframes(keyframes, {
      format: "css",
      propFunc: function(keyframe) { return ["transform: translate(" + keyframe.value + ")"] },
      name: "sine"
    });
    /* result is the result CSS content */
```

Be sure to add your own propFunc for converting value into CSS property. You can also check sample.ls for more detail.


## LICENSE

MIT
