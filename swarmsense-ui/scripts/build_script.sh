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
cd build ; # change directory to build
rm service-worker.js ; # removing unwanted file
echo "Build completed."
echo "Building archive : dist/${npm_package_config_pack_name}.tar.bz2"
tar cvfj ../dist/${npm_package_config_pack_name}.tar.bz2 * ; # archiving using the pack_name defined in config(package.json)
cd .. ; # change directory to ..
echo "Archive built."
if test $npm_package_config_scp_on = "on" # if scp_on(package.json) is on, then transfer the built using scp to the production server
then
  if test $npm_package_config_ps_user -a $npm_package_config_ps_remote_address -a $npm_package_config_ps_remote_directory # checking if the username@raddress:rdir will work
  then
    echo "Using configuration to transfer files from build/ to ${npm_package_config_ps_user}@${npm_package_config_ps_remote_address}:${npm_package_config_ps_remote_directory}"
    if scp -r ./build/* ${npm_package_config_ps_user}@${npm_package_config_ps_remote_address}:${npm_package_config_ps_remote_directory} # copying content, will prompt for password of the remote server
    then
      echo "successfully transferred"
    else
      echo "scp failed."
    fi
  else
    echo "username/remote-address/remote-directory not set" # fail to transfer since config is not set
  fi
fi
