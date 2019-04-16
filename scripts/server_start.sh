#!/bin/bash

cd "$(dirname "$0")"

if [[ "$OSTYPE" == "linux-gnu" ]]; then
    source ./venv/bin/activate
else
    source ./venv/Scripts/activate
fi

export FLASK_APP=siwair.py
export FLASK_ENV=development
export PYTHONUNBUFFERED=1
cd .. && flask run --host=0.0.0.0
