import json
import os
import os.path
import random
import string
import subprocess
import tempfile
import threading
import time
from pathlib import Path

import flask
import git
from flask import Flask, jsonify, request, render_template, url_for
from flask_cors import CORS
from git import Repo


SERVER_HOST = '127.0.0.1'
SERVER_PORT = 1337

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

REPO_BASE = os.path.join(Path.home(), 'streamd')
REPO_LOCAL_BASE = os.path.join(Path.home(), 'streamd-local')
REPO_ID_LENGTH = 6  # use 6 characters for repo ids

os.makedirs(REPO_BASE, exist_ok=True)
os.makedirs(REPO_LOCAL_BASE, exist_ok=True)

@app.route('/', methods=['GET'])
def index():
    list_available = os.listdir(REPO_LOCAL_BASE);
    context = [{"code": x, "url": f'http://{SERVER_HOST}:{SERVER_PORT}/stream/{x}'} for x in list_available]
    return render_template('index.html', streams=context)

@app.route('/stream/<stream_code>', methods=['GET'])
def stream(stream_code):
    context = {
        "prismcss":url_for('static', filename='styles/prism.css'),
        "prismjs":url_for('static', filename='scripts/prism.js'),
        "css":url_for('static', filename='styles/style.css'),
        "main":url_for('static', filename='scripts/main.js'),
        "stream_code": stream_code,
        "id": stream_code,
    }

    return render_template('stream.html', context=context)


@app.route('/api/v1/streams', methods=['GET'])
def list_available_streams():
    list_available = os.listdir(REPO_LOCAL_BASE);
    list_details = [{"name":"não sei o que ","text":"poderia estar aqui"}
            for i in enumerate(list_available)]
    d = dict(zip(list_available, list_details))

    return jsonify(d)

@app.route('/new/repo', methods=['POST'])
def new_repository():
    bundle_f = flask.request.files.get('bundle')

    # generate a random id for this repo
    while True:
        repo_id = ''.join(random.choices(string.ascii_letters + string.digits,
                                         k=REPO_ID_LENGTH))

        repo_path = os.path.join(REPO_BASE, repo_id+'.git')

        try:
            repo = Repo(repo_path)
        except git.exc.NoSuchPathError:
            break

    if bundle_f is not None:
        h,bundle = tempfile.mkstemp(suffix='.bundle')
        bundle_f.save(bundle)

        subprocess.run(['git', 'clone', '--bare', bundle, repo_path])

        os.remove(bundle)
    else:
        Repo.init(repo_path, bare=True)

    open(os.path.join(repo_path, 'git-daemon-export-ok'), 'w').close()

    repo = Repo.clone_from(repo_path, os.path.join(REPO_LOCAL_BASE, repo_id))

    return repo_id


if __name__ == '__main__':
    app.run(host=SERVER_HOST, port=SERVER_PORT, debug=True)
