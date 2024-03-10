import React, { useState } from 'react';
import {NavLink} from 'react-router-dom';
import './styles/profile.css';
import TopBar from "./topBar";


const baseUrl = "http://127.0.0.1:5000"
const regex = /^(?=.*[A-Za-z]).{8,}$/;

function Profile({LoginCredentials}) {

    const api_key = localStorage.getItem("yunhaohu_belay_api_key")

    const [username, setUsername] = useState(localStorage.getItem("user_name"));
    const [shownUsername, setShownUsername] = useState(localStorage.getItem("user_name"));
    const [password, setPassword] = useState('');

    let shownName = localStorage.getItem("user_name")

    function handleUpdateUsername(e) {
        e.preventDefault();
        if (username === "") {
            alert("Username can not be empty!")
          return;
        }
        let url = baseUrl + "/api/update_username"
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': api_key
            },
            body: JSON.stringify({
                api_key: api_key,
                new_name: username,
            })
        }).then(response => {
            return response.json()
        }).then(data => {
            if (data.code === 200) {
                localStorage.setItem('user_name', username);
                setShownUsername(localStorage.getItem("user_name"))
            }
            alert(data.msg);
        }).catch(error => {
             console.error('Unknown error:', error);
        })
    }
    function handleUpdatePassword(e) {
        e.preventDefault();
        if (password === "") {
            alert("Username can not be empty!")
          return;
        }
        let url = baseUrl + "/api/update_password"
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': api_key
            },
            body: JSON.stringify({
                "api_key": api_key,
                "new_password": password,
            })
        }).then(response => {
            return response.json()
        }).then(data => {
            // if (data.code === 200) {
            //     localStorage.setItem('user_name', username);
            //     setShownUsername(localStorage.getItem("user_name"))
            // }
            if (data) {
                alert(data.msg);
            }
        }).catch(error => {
             console.error('Unknown error:', error);
        })
    }

    return <div className="home">
        <TopBar LoginCredentials={LoginCredentials} username={shownUsername}/>

        <div className="contents">
            <div className="login-box">
                <h2>Update user info</h2>
                <div>
                    <div className="form-group">
                        <label>New username</label>
                        <input type="text"
                               id="username"
                               name="username"
                               placeholder="Enter new username"
                               value={username}
                               onChange={(e) => {
                                   setUsername(e.target.value)
                               }}
                               required/>
                        <button type="submit" className="btn-login" onClick={handleUpdateUsername}>Update Username
                        </button>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">New password</label>
                        <input type="password"
                               id="password"
                               name="password"
                               placeholder="Enter new password"
                               value={password}
                               onChange={(e) => {
                                   setPassword(e.target.value)
                               }}
                               required/>
                        <button type="submit" className="btn-login" onClick={handleUpdatePassword}>Update Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default Profile