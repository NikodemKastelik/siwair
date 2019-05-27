#!/bin/bash

cd "$(dirname "$0")"

if [[ "$OSTYPE" == "linux-gnu" ]]; then
    source ./venv/bin/activate
else
    source ./venv/Scripts/activate
fi

cd ..

rm -rf bundle
mkdir bundle
pyinstaller -F --dist bundle/ siwair.py
cp -r templates bundle/
cp -r static bundle/
cd -
