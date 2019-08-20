#!/bin/bash

case $1 in
  --prep)
    echo
    echo "---> Building Victims"
    npm run buildprep -- --prod
    ;;
  *)
    echo
    echo "---> Building Victims"
    npm run buildprod -- --prod
    ;;
esac
