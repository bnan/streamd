from flask import Flask, jsonify
from flask_cors import CORS

from git import Repo

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})


@app.route('/api/v1/comments/<remote_id>', methods=['POST'])
def routes(remote_id):
    repo_dir = f'~/streamd/{remote_id}'

    try:
        username = request.form['username']
        text     = request.form['text']
    except KeyError:
        # You must provide those form parameters
        return jsonify(**{ 'error': True, 'message': 'Mal-formed message' })


    repo = Repo(repo_dir)
    if repo.bare:
        # There is no such repo you silly boy
        return jsonify(**{ 'error': True, 'message': 'Could not find repo' })


    with open(


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=1337, debug=True)
