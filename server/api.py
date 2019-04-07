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

STREAMD_COMMENTS_INIT = '__STREAMD_COMMENTS_INIT__'

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
        "js":url_for('static', filename='scripts/ui.js'),
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


comments_db = {}
# Also send thread in URL so that I can dump json from POST and don't
# have to parse it to know which thread is and then remove that field
# so that it won't be stored redundantly
@app.route('/api/v1/comments/<remote_id>/<thread>', methods=['POST'])
def add_comment(remote_id, thread):
    repo_dir = f'{REPO_LOCAL_BASE}/{remote_id}'

    # Sanity checks to ensure correctness
    try:
        payload = request.get_json();
    except KeyError:
        # You must provide those form parameters
        return jsonify(**{ 'error': True, 'message': 'Mal-formed message' })

    username = payload['username']

    # Verify if repo already exists
    repo = Repo(repo_dir)
    if repo.bare:
        # There is no such repo you silly boy
        return jsonify(**{ 'error': True, 'message': 'Could not find repo' })


    # Verify if there are already a thread
    message_folder = f'{repo_dir}/{thread}'
    if not os.path.exists(message_folder):
        os.makedirs(message_folder)

    # Timestamp new messages to provide order in files
    timestamp = time.time()

    message_file = f'{message_folder}/{timestamp}'

    with open(message_file,'w+') as f:
        f.write(json.dumps(payload))

    # Commit changes to messages-branch
    repo.git.checkout('streamd-comments')
    repo.git.add(message_file)
    repo.git.commit(m=f'add {username} message')
    repo.git.push('origin', 'streamd-comments')

    # in-memory comment storage
    if remote_id not in comments_db:
        comments_db[remote_id] = {}
    if thread not in comments_db[remote_id]:
        comments_db[remote_id][thread] = {}
    comments_db[remote_id][thread][timestamp] = payload

    return jsonify(**{ 'error': False, 'message': 'Message Stored' })


@app.route('/api/v1/comments/<repo_id>')
def get_comments(repo_id):
    return comments_db[repo_id]


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

    print(repo_path)

    repo = Repo.clone_from(repo_path, os.path.join(REPO_LOCAL_BASE, repo_id))

    try:
        repo.git.checkout(orphan='streamd-comments')
    except git.exc.GitCommandError:  # the branch exists
        repo.git.checkout('streamd-comments')

    try:
        streamd_init = os.path.join(repo.working_tree_dir,
                                    STREAMD_COMMENTS_INIT)
        open(streamd_init, 'a').close()
        repo.git.add(streamd_init)
        repo.git.commit(m='streamd: initial commit')
        repo.git.push('origin', 'streamd-comments')
    except git.exc.GitCommandError:  # the branch exists
        pass

    return repo_id


if __name__ == '__main__':
    app.run(host=SERVER_HOST, port=SERVER_PORT, debug=True)
