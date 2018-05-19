#!/bin/bash
if test $npm_package_config_build_docs = "on"
then
  echo "Generating api documentation ..."
  [ -f docs/API.md ] && rm docs/API.md ;
  if documentation build src/index.js -f md -o docs/API.md # updating documentation, if any.
  then
    echo "Api documentation updated. Building all the documentation."
    cd docs ; make clean; make html ;[ -d ../public/docs ] && rm -rf ../public/docs ; mv _build/html ../public/docs ; cd .. ; # building developer documentation html and putting it to public/docs
  else
    echo "documetation could not be updated. Please check if documetationJS is properly installed."
  fi
fi
echo "starting to build ..."
react-scripts build ; # building optimized production code

if [ ! -d "dist" ]; then
  mkdir dist
fi

cd build ; # change directory to build
rm service-worker.js ; # removing unwanted file
echo "Build completed."
echo "Building archive : dist/${npm_package_config_pack_name}.tar.bz2"
tar cvfj ../dist/${npm_package_config_pack_name}.tar.bz2 * ; # archiving using the pack_name defined in config(package.json)
cd .. ; # change directory to ..
echo "Archive built."
