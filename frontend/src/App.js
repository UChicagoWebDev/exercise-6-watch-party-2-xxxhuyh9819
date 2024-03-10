import { BrowserRouter, Route, Routes, Navigate} from 'react-router-dom';
import Home from ".//Home";
import Login from "./login";
import {useState} from "react";
import SignUp from "./signUp";
import Profile from "./profile";

function App() {
  const [loginStatus, setLoginStatus] =
      useState(localStorage.getItem("user_id") === null ? null : localStorage.getItem("user_id"))

    // respond to the child prop (login/signup has been successful)
    // let App check if there is corresponding user info in localStorage
    function handleLoginStatus() {
        setLoginStatus(localStorage.getItem("user_id") === null ? null : localStorage.getItem("user_id"))
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route exact path="*" element={loginStatus ? <Navigate replace to={"/home"}/>
                    : <Navigate replace to="/login" />} />
                {/*if logged in, go to home page, else go to login page */}
                <Route exact path="/" element={<Navigate replace to={loginStatus ? "/home" : "/login"}/>}/>
                <Route exact path="/login" element={loginStatus ? <Navigate replace to={"/home"}/>
                    : <Login LoginCredentials={handleLoginStatus}/>}/>

                {/*src: https://dev.to/salehmubashar/conditional-routing-with-react-router-v6-229g */}
                <Route exact path="/signup" element={loginStatus ? <Navigate replace to={"/home"}/>
                    : <SignUp LoginCredentials={handleLoginStatus}/>}/>

                <Route exact path="/home" element={loginStatus ? <Home LoginCredentials={handleLoginStatus}/>
                    : <Navigate replace to={"/login"}/>}/>

                <Route exact path="/profile" element={loginStatus ? <Profile LoginCredentials={handleLoginStatus}/>
                    : <Navigate replace to={"/login"} />}/>

                <Route exact path="/channel/:channelId" element={loginStatus ? <Home LoginCredentials={handleLoginStatus}/>
                    : <Navigate replace to={"/login"}/>} />

                {/*<Route exact path="/channel/:channelId" element={loginStatus ? <Home LoginStatus={handleLoginStatus}/>*/}
                {/*    : <Navigate replace to="/login" />} />*/}




            </Routes>
        </BrowserRouter>
    );

}

export default App;
