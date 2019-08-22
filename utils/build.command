# build esm
rollup source/b8r.js --file dist/b8r.js --format esm --inlineDynamicImports true
uglifyjs dist/b8r.js -c -m -cmo dist/b8r.min.js --source-map url=dist/b8r.min.js.map

# build cjs
rollup source/b8r.js --file dist/b8r.cjs.js --format cjs
uglifyjs dist/b8r.cjs.js -c -m -cmo dist/b8r.cjs.min.js --source-map url=dist/b8r.cjs.min.js.map
