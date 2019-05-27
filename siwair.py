from flask import Flask
from flask import render_template
from flask import Response
from flask import jsonify
from flask import request
import json
import sys
import atexit
from plc_master_manager import PlcMasterManager
from config_parser import parseConfig
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

plcmngr = None

app = Flask(__name__)

def cleanup(thisplc):
    thisplc.stop()

@app.before_first_request
def setup():
    global plcmngr
    master_plc_ip, tx_port, rx_port = parseConfig("serverconfig.json")
    plcmngr = PlcMasterManager(master_plc_ip, tx_port, rx_port)
    plcmngr.start()
    atexit.register(lambda: cleanup(plcmngr))

@app.route("/getstatus", methods = ["get"])
def getStatus():
    data = plcmngr.getStatuses()
    resp = Response(json.dumps(data), status=200, mimetype="application/json")
    return resp

@app.route("/getcurrentorder", methods = ["get"])
def getCurrentOrder():
    data = plcmngr.getCurrentOrder()
    resp = Response(json.dumps(data), status=200, mimetype="application/json")
    return resp

@app.route("/getorderqueue", methods = ["get"])
def getOrderQueue():
    data = plcmngr.getOrderBracket()
    resp = Response(json.dumps(data), status=200, mimetype="application/json")
    return resp

@app.route('/')
def root():
    with open("static/contents.json", encoding='utf-8') as fd:
        contents = json.load(fd)
    return render_template('index.html',
                           bootstrap_folder="startbootstrap-freelancer",
                           contents=contents)

@app.route('/setorder', methods=['POST'])
def setOrder():
    content = request.get_json()
    plcmngr.addOrder(content)
    return 'JSON posted'

@app.route('/deleteorder', methods=['POST'])
def deleteorder():
    id = request.get_json()
    plcmngr.removeOrder(id)
    return 'JSON posted'

if __name__ == "__main__":
    app.run(host="0.0.0.0")
