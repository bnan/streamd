from flask import Flask, jsonify
from flask_cors import CORS


app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})


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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=1337)
