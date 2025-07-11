#/bin/bash

old_release=$1
release=$2
if [ -z "$release" ]; then
       echo "Usage: $0 <old version number> <new version number>"
       exit
fi       

# Set up paths
scriptpath=$(realpath "$0")
scriptdir=$(dirname $scriptpath)
basedir=$(dirname $scriptdir)

# Update/minify CSS and JS
$scriptdir/update_css.sh
$scriptdir/fdatepicker_minify.sh

# Update version file, JS header, and package.json
echo $release >$basedir/VERSION
sed -i "s/VERSION = '$old_release'/VERSION = '$release'/" $basedir/src/js/fdatepicker.js

# --- NPM: update version and publish ---
##if [ -f "$basedir/package.json" ]; then
##    # Update package.json version (no git tag, since we'll handle it manually)
##    npm version $release --no-git-tag-version
##
##    # Publish to npm (scoped package, so --access public)
##    npm publish --access public
##fi

# --- GitHub release steps as before ---
# Create a zip of the new release for GitHub (but not for npm)
cd $basedir/..
pwd
zip -r fdatepicker.zip fdatepicker -x '*.git*' '*.less' -x 'fdatepicker/dist*' -x 'fdatepicker/script*' -x 'fdatepicker/*json' -x 'fdatepicker/.npmignore'
mv fdatepicker.zip $basedir/dist/

cd $basedir
git add VERSION fdatepicker.min.js package.json
git commit -m "release $release" -a
git push
gh release create "v${release}" --generate-notes ./dist/*.zip
