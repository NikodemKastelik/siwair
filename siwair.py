from flask import Flask
from flask import render_template
import json
import sys

sys.path.insert(0, "scripts/")
from plc_master_manager import PlcMasterManager

app = Flask(__name__)

@app.before_first_request
def setup():
    plcmngr = PlcMasterManager("localhost", 4000)
    plcmngr.start()

@app.route('/')
def root():
    with open("static/contents.json") as fd:
        contents = json.load(fd)
    return render_template('index.html',
                           bootstrap_folder="startbootstrap-freelancer",
                           contents=contents)

