from flask import Flask
from flask import render_template
from flask import Response
from flask import jsonify
from flask import request
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
    with open("static/contents.json", encoding='utf-8') as fd:
        contents = json.load(fd)
    return render_template('index.html',
                           bootstrap_folder="startbootstrap-freelancer",
                           contents=contents)

@app.route('/getorder', methods=['POST'])
def getorder():
    print (request.is_json)
    content = request.get_json()
    print (content)
    return 'JSON posted'
