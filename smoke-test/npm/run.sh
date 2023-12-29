#!/bin/sh
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$DIR"

npm update
npm ci

# build dist
npx esbuild "js/index.js" --bundle --minify --outfile=js/index.min.js
