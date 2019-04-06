from flask import Flask
from flask import render_template
import json

app = Flask(__name__)

@app.route('/')
def root():
    with open("static/contents.json") as fd:
        contents = json.load(fd)
    return render_template('index.html',
                           bootstrap_folder="startbootstrap-freelancer",
                           contents=contents)

