#/bin/bash

# now update the release version
scriptpath=$(realpath "$0")
scriptdir=$(dirname $scriptpath)
basedir=$(dirname $scriptdir)
cd $basedir/src/js

uglifyjs -o fdatepicker.min.js fdatepicker.js
