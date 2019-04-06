import os
import random
import string
import subprocess
import tempfile

from pathlib import Path

import flask
import git
from git import Repo
from flask import Flask, jsonify
from flask_cors import CORS


app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

REPO_BASE = os.path.join(Path.home(), 'streamd')
REPO_ID_LENGTH = 6  # use 6 characters for repo ids


@app.route('/api/v1/routes/<lat>/<lng>/', methods=['GET'])
def routes(lat, lng):
    try:
        results = [
            { 'lat': -8.6721462, 'lng': 41.165162 },
            { 'lat': -8.684325, 'lng': 41.1735278 },
            { 'lat': -8.6882191, 'lng': 41.1734336 },
            { 'lat': -8.6131861, 'lng': 41.1718621 }
        ]

        return jsonify(**{'error': False, 'message': f'Successfully computed routes for ({lat}, {lng})', 'results': results })
    except Exception as e:
        raise e
        return jsonify(**{ 'error': True, 'message': str(e), 'results': [] })


@app.route('/new/repo', methods=['POST'])
def new_repository():
    bundle_f = flask.request.files.get('bundle')

    # generate a random id for this repo
    while True:
        repo_id = ''.join(random.choices(string.ascii_letters + string.digits,
                                         k=REPO_ID_LENGTH))

        repo_path = os.path.join(REPO_BASE, repo_id)

        try:
            repo = Repo(os.path.join(repo_path))
        except git.exc.NoSuchPathError:
            break

    if bundle_f is not None:
        h,bundle = tempfile.mkstemp(suffix='.bundle')
        bundle_f.save(bundle)

        subprocess.run(['git', 'clone', '-b', 'master', bundle, repo_id],
                       cwd=REPO_BASE)

        os.remove(bundle)
    else:
        Repo.init(os.path.join(repo_path))

    open(os.path.join(repo_path, '.git', 'git-daemon-export-ok'), 'w').close()

    return repo_id


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=1337)
