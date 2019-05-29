#!/usr/bin/env sh

# Manually create and update the content from the `gh-pages` branch

# abort on errors
set -e

# build and copy gh-pages
gulp gh-pages

# navigate into the build output directory
cd dist

#touch .nojekyll

# init git stuff
git init
git add --all
git commit -m 'Hey server, this content is for you! [skip ci]'

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:Modernizr/modernizr-neue.git master:gh-pages

# go back
cd -
