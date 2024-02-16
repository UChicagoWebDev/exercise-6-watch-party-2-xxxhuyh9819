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
