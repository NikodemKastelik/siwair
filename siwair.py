from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
def root():
    return render_template('index.html', bootstrap_path="static/startbootstrap-freelancer")

