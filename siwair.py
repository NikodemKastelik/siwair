from flask import Flask
from flask import render_template
from flask import Response
from flask import jsonify
import json
import sys

sys.path.insert(0, "scripts/")
from plc_master_manager import PlcMasterManager

plcmngr = None
app = Flask(__name__)

@app.before_first_request
def setup():
    global plcmngr
    plcmngr = PlcMasterManager("localhost", 4000)
    plcmngr.start()

@app.route("/getstatus", methods = ["get"])
def get_status():
    data = plcmngr.getStatuses()
    resp = Response(json.dumps(data), status=200, mimetype="application/json")
    return resp

@app.route('/')
def root():
    with open("static/contents.json") as fd:
        contents = json.load(fd)
    return render_template('index.html',
                           bootstrap_folder="startbootstrap-freelancer",
                           contents=contents)

