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


@app.route('/api/rooms/new-room', methods=['POST'])
def create_room():
    api_key = request.headers.get('API-Key')
    if not api_key:
        return jsonify({"API Key not found!"}), 403

    room_name = "Unnamed Room #" + ''.join(random.choices(string.digits, k=6))
    query = "insert into rooms (name) values (?) returning id, name"
    room = query_db(query, [room_name], one=True)
    if not room:
        return {}, 403
    return jsonify({
        'id': room['id'],
        'name': room['name'],
    }), 200

@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    query = "select id, name from rooms"
    rooms = query_db(query)
    if not rooms:
        return jsonify([]), 200
    return jsonify([dict(r) for r in rooms]), 200



@app.route('/api/rooms/<int:room_id>/messages', methods=['GET'])
def get_all_messages(room_id):
    api_key = request.headers.get('API-Key')
    if not api_key:
        return jsonify({"API Key not found!"}), 403
    query = "select * from users where api_key = ?"
    user = query_db(query, [api_key], one=True)
    if user is None:
        return {}, 403
    query = "select messages.id as message_id, user_id, name, room_id, body from messages left join main.users u on u.id = messages.user_id where room_id =?"
    messages = query_db(query, [room_id])
    # returns an empty json list if there is no message
    if messages is None:
        return jsonify([]), 403
    return jsonify([dict(m) for m in messages]), 200
