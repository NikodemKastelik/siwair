#!/bin/bash

cd "$(dirname "$0")"
source venv/bin/activate
export FLASK_APP=siwair.py
export FLASK_ENV=development
cd .. && flask run --host=0.0.0.0
