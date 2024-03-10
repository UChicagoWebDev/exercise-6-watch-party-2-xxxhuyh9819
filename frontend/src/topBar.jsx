import React, { useState } from 'react';
import {NavLink} from 'react-router-dom';
import './styles/topBar.css';

function TopBar({LoginCredentials, username}) {

    function handleLogOut() {
        if (window.confirm("Do you really want to leave?")) {
            localStorage.clear()
            LoginCredentials(null)
        }
    }

    return <nav className="topbar">
        <span className="current-user">CURRENT USER: {username}</span>
        <h2>Belay</h2>
        <ul>
            <li>
                <NavLink to="/home">HOME</NavLink>
            </li>
            <li>
                <NavLink to="/profile">PROFILE</NavLink>
            </li>
            <li>
                <NavLink onClick={handleLogOut} to="/login">LOG OUT</NavLink>
            </li>
        </ul>
    </nav>
}

export default TopBar