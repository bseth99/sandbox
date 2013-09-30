#!/bin/sh

jekyll build

cp -R _site/* ../bseth99.github.com

cd ../bseth99.github.com

touch .nojekyll

git add .
git commit -am "Updates"
git push origin master

cd ../sandbox
