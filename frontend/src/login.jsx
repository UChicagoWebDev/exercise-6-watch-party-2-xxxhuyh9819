import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/login.css';

const baseUrl = "http://127.0.0.1:5000"
function Login({ LoginCredentials }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const baseUrl = 'http://127.0.0.1:5000'
   function handleLogin(e) {
      e.preventDefault();

      let url = baseUrl + '/api/login'
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "username": username,
          "password": password,
        }),
      }).then(response => {
          if (response.ok) {
              return response.json()
          } else {
              console.log("Error: " + response.status)
              return null
          }
      }).then(data => {
         if (data.code === 200) {
            localStorage.setItem('user_name', data.user.user_name);
            localStorage.setItem('user_id', data.user.user_id);
            localStorage.setItem(`yunhaohu_belay_api_key`, data.user.api_key);
            LoginCredentials(localStorage.getItem("user_id"));

            alert("Login Successfully! Navigating to Home page...")
            navigate('/home');
         } else {
             alert(data.msg)
         }
      }).catch(error => {
          console.log(error)
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
                <button type="submit" className="btn-login" onClick={handleLogin}>Login</button>
                <div className="signup-link">
                    <p>Don't have an account? <span onClick={() => navigate('/signup')}>Create one!</span></p>
                </div>
            </form>
        </div>
    </div>;
}

export default Login;
