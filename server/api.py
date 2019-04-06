import json
import os
import os.path
import random
import string
import subprocess
import tempfile
import time
from pathlib import Path

import flask
import git
from flask import Flask, jsonify, request
from flask_cors import CORS
from git import Repo

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

REPO_BASE = os.path.join(Path.home(), 'streamd')
REPO_LOCAL_BASE = os.path.join(Path.home(), 'streamd-local')
REPO_ID_LENGTH = 6  # use 6 characters for repo ids


# Also send thread in URL so that I can dump json from POST and don't
# have to parse it to know which thread is and then remove that field
# so that it won't be stored redundantly
@app.route('/api/v1/comments/<remote_id>/<thread>', methods=['POST'])
def routes(remote_id, thread):
    homedir = os.path.expanduser('~')
    repo_dir = f'{homedir}/streamd/{remote_id}'

    # Sanity checks to ensure correctness
    try:
        payload = request.get_json();
    except KeyError:
        # You must provide those form parameters
        return jsonify(**{ 'error': True, 'message': 'Mal-formed message' })

    username = payload['username']
    text = payload['text']

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
    branch_name = repo.active_branch.name
    if branch_name != 'streamd-comments':
        repo.git.checkout('streamd-comments')
    repo.git.add('.')
    repo.git.commit(m=f'add {username} message')

    return jsonify(**{ 'error': False, 'message': 'Message Stored' })

@app.route('/new/repo', methods=['POST'])
def new_repository():
    bundle_f = flask.request.files.get('bundle')

    # generate a random id for this repo
    while True:
        repo_id = ''.join(random.choices(string.ascii_letters + string.digits,
                                         k=REPO_ID_LENGTH))

        repo_path = os.path.join(REPO_BASE, repo_id+'.git')

        try:
            repo = Repo(os.path.join(repo_path))
        except git.exc.NoSuchPathError:
            break

    if bundle_f is not None:
        h,bundle = tempfile.mkstemp(suffix='.bundle')
        bundle_f.save(bundle)

        subprocess.run(['git', 'clone', '--bare', bundle, repo_id],
                       cwd=REPO_BASE)

        os.remove(bundle)
    else:
        repo = Repo.init(os.path.join(repo_path), bare=True)

    open(os.path.join(repo_path, 'git-daemon-export-ok'), 'w').close()

    print(repo_path)

    repo = Repo.clone_from(repo_path, os.path.join(REPO_LOCAL_BASE, repo_id))

    repo.git.checkout(b='master')
    repo.git.checkout(orphan='streamd-comments')

    return repo_id


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=1337, debug=True)
