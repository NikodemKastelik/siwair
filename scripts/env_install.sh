#!/bin/bash

cd "$(dirname "$0")"

python3 -m pip install virtualenv --user
python3 -m virtualenv --python=python3 venv

if [[ "$OSTYPE" == "linux-gnu" ]]; then
    source ./venv/bin/activate
else
    source ./venv/Scripts/activate
fi

if [ ! $? -eq 0 ];
then
    echo "Could not activate virtualenv."
    exit
fi

python3 -m pip install -r requirements.txt
deactivate
