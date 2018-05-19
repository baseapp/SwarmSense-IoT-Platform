#!/usr/bin/env bash

echo "Creating SwarmSense Release Package"
rm -r dist
rm -r release
python3 setup.py sdist

mkdir -p release/script/configs
mkdir -p release/frontend

if [ ! -f swarmsense-ui/dist/swarmsense-ui.tar.bz2 ]; then
    echo "Frontend build not found"
    exit
fi

cp swarmsense-ui/dist/swarmsense-ui.tar.bz2 release/frontend/swarmsense-ui.tar.bz2
cp script/setup.sh release/script/
cp script/configs/* release/script/configs/
cp requirements.txt release/
cp snms-production.fcgi release/
cp dist/snms*.tar.gz release/snms.tar.gz
rm snms.zip
zip snms.zip -r release/*
echo "Release package is ready in snms.zip"