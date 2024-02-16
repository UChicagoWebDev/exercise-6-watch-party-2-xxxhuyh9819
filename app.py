import sqlite3
import string
import random
from datetime import datetime
from flask import *
from functools import wraps

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0


def get_db():
    db = getattr(g, '_database', None)

    if db is None:
        db = g._database = sqlite3.connect('db/watchparty.sqlite3')
        db.row_factory = sqlite3.Row
        setattr(g, '_database', db)
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    rows = cursor.fetchall()
    db.commit()
    cursor.close()
    if rows:
        if one:
            return rows[0]
        return rows
    return None


def new_user():
    name = "Unnamed User #" + ''.join(random.choices(string.digits, k=6))
    password = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
    api_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=40))
    u = query_db('insert into users (name, password, api_key) ' +
                 'values (?, ?, ?) returning id, name, password, api_key',
                 (name, password, api_key),
                 one=True)
    return u


# TODO: If your app sends users to any other routes, include them here.
#       (This should not be necessary).
@app.route('/')
@app.route('/profile')
@app.route('/login')
@app.route('/room')
@app.route('/room/<chat_id>')
def index(chat_id=None):
    return app.send_static_file('index.html')


@app.errorhandler(404)
def page_not_found(e):
    return app.send_static_file('404.html'), 404


# -------------------------------- API ROUTES ----------------------------------

# TODO: Create the API

@app.route('/api/signup', methods=['POST'])
def signUp():
    newUser = new_user()
    return jsonify({
        "user_id": newUser["id"],
        "user_name": newUser["name"],
        "password": newUser["password"],
        "api_key": newUser["api_key"],
    }), 200


@app.route('/api/login', methods=['POST'])
def login():
    if not request.json:
        return jsonify(["Empty input"]), 400
    user_name = request.json.get('user_name')
    password = request.json.get('password')
    query = "select * from users where name = ? AND password = ?"
    user = query_db(query, (user_name, password), one=True)
    if not user:
        return jsonify(["User not found!"]), 403
    return jsonify({
        "user_id": user["id"],
        'user_name': user["name"],
        'password': user["password"],
        'api_key': user["api_key"],
    }), 200


# @app.route('/api/user/name', methods=['POST'])
# def update_username():
#     api_key = request.headers.get('API_Key')
#     if not api_key:
#         print("No API key!")
#         return {}, 403
#     query = "select * from users where api_key = ?"
#     user = query_db(query, api_key, one=True)
#     user_id = user["id"]
#     new_name = request.json.get('user_name')
#     query = 'update users set name = ? where id = ?'
#     query_db(query, (new_name, user_id), one=True)
#     return jsonify({'message': f"Username: {new_user['name']} updated successfully"}), 200


@app.route('/api/user/name', methods=['POST'])
def update_username():
    api_key = request.headers.get('API-Key')
    if not api_key:
        return jsonify({"API Key not found!"}), 403
    query = "select * from users where api_key = ?"
    user = query_db(query, [api_key], one=True)

    if not request.json:
        return jsonify(["Empty input"]), 400

    user_id = user["id"]
    user_name = request.json.get("user_name")
    query = "update users set name = ? where id = ?"
    query_db(query, (user_name, user_id), one=True)
    return {}, 200


@app.route('/api/user/password', methods=['POST'])
def update_password():
    api_key = request.headers.get('API-Key')
    if not api_key:
        return jsonify({"API Key not found!"}), 403
    query = "select * from users where api_key = ?"
    user = query_db(query, [api_key], one=True)

    if not request.json:
        return jsonify(["Empty input"]), 400
    user_id = user["id"]
    password = request.json.get("password")
    query = "update users set password = ? where id = ?"
    query_db(query, (password, user_id), one=True)
    return {}, 200
