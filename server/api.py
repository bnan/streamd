import os.path
import json
import time

from flask import Flask, jsonify, request
from flask_cors import CORS

from git import Repo

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})


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
    repo.git.checkout('streamd-comments')
    repo.git.add('.')
    repo.git.commit(m=f'add {username} message')
    repo.git.checkout('master')

    return jsonify(**{ 'error': False, 'message': 'Message Stored' })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=1337, debug=True)
