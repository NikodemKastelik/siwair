#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

cd "$(dirname "$0")"

python3 -m pip install virtualenv
python3 -m virtualenv --python=python3 venv
source venv/bin/activate
python3 -m pip install -r requirements.txt
