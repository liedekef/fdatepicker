#!/bin/bash

scriptpath=$(realpath "$0")
scriptdir=$(dirname $scriptpath)
basedir=$(dirname $scriptdir)
cd $basedir/src/css

uglifycss fdatepicker.css > fdatepicker.min.css
