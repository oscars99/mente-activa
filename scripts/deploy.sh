#!/bin/sh
# Builds the app for GitHub Pages and publishes dist/ to the gh-pages branch.
set -e
cd "$(dirname "$0")/.."
npm test
BASE_PATH=/mente-activa/ npm run build
touch dist/.nojekyll
cd dist
git init -q -b gh-pages
git add -A
git commit -q -m "Publicar $(date '+%Y-%m-%d %H:%M')"
git push -f -q "$(git -C .. remote get-url origin)" gh-pages
rm -rf .git
echo "Publicado: https://oscars99.github.io/mente-activa/"
