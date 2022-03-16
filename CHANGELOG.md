# Change Logs

## v0.0.3

 - rename project to `easingfit`.
 - refactor code structure:
   - `easing-fit.fit` now is `easingfit`.
   - `easing-fit.to-keyframes` now is `easingfit._to-keyframes`.
   - `easing-fit.fit-to-keyframes` now is `easingfit.to-keyframes.
   - remove `easing-fit.round`, which can simply be done by `Number.toFixed`.
 - (TODO)
   - support multi value ( but fitting is impossible? )

## v0.0.2

 - rename `easing-fit.js`, `easing-fit.min.js` to `index.js` and `index.min.js`
 - upgrade modules
 - release with compact directory structure
 - add `main` and `browser` field in `package.json`.
 - further minimize generated js file with mangling and compression

