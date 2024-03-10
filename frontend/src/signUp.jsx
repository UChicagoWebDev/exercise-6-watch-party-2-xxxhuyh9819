import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/signUp.css';

const baseUrl = "http://127.0.0.1:5000"
const regex = /^(?=.*[A-Za-z]).{8,}$/;

function SignUp({ LoginCredentials }) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

     function handleSignUp(event) {
        event.preventDefault();

        if (username === "") {
            alert("Username can not be empty!")
            return
        }

        if (password === "") {
            alert("Password can not be empty!")
            return
        }

        //
        // if (!regex.test(password)) {
        //     alert("Password should be at least 8 characters long with at least 1 English letter!")
        //     return
        // }

        let url = baseUrl + "/api/signup"

         fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": process.env.REACT_APP_API_URL,
                "Access-Control-Request-Headers": 'Content-Type, Authorization'
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        }).then(response => {
             return response.json()
        }).then(data => {
            if (data.code === 200) {
                localStorage.setItem('user_name', data.user.user_name);
                localStorage.setItem('user_id', data.user.user_id);
                localStorage.setItem(`yunhaohu_belay_api_key`, data.user.api_key);
                LoginCredentials(localStorage.getItem("user_id"));

                alert("Account created successfully! Navigating to Home page...")
                 // src: https://remix.run/docs/en/main/hooks/use-navigate
                 navigate('/home');
            } else {
                alert(data.msg)
                setUsername("")
                setPassword("")
            }
        }).catch(error => {
            console.log(`Unexpected Error: ${error}`)
        })
    }

    return <div>
        <div className="login-box">
            <h2>Welcome to Belay!</h2>
            <form>
                <div className="form-group">
                    <label>Username</label>
                    <input type="text"
                           id="username"
                           name="username"
                           placeholder="Enter username"
                           value={username}
                           onChange={(e) => {
                               setUsername(e.target.value)
                           }}
                           required/>
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password"
                           id="password"
                           name="password"
                           placeholder="Enter password"
                           value={password}
                           onChange={(e) => {
                               setPassword(e.target.value)
                           }}
                           required/>
                </div>
                <button type="submit" className="btn-login" onClick={handleSignUp}>Sign Up</button>
                <div className="signup-link">
                    <p>Already have an account? <span onClick={() => navigate('/login')}>Login</span></p>
                </div>
            </form>
        </div>
    </div>;
}

export default SignUp