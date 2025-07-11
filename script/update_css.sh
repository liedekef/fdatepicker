#!/bin/bash

# npm install less -g
# npm install less-plugin-clean-css -g

scriptpath=$(realpath "$0")
scriptdir=$(dirname $scriptpath)
basedir=$(dirname $scriptdir)
cd $basedir/src/css

$scriptdir/uglifycss fdatepicker.css > fdatepicker.min.css
