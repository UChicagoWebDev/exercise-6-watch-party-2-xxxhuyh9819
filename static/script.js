// Constants to easily refer to pages
const SPLASH = document.querySelector(".splash");
const PROFILE = document.querySelector(".profile");
const LOGIN = document.querySelector(".login");
const ROOM = document.querySelector(".room");
const failedMsg = document.getElementById("failed-login-msg")

// Custom validation on the password reset fields
const passwordField = document.querySelector(".profile input[name=password]");
const repeatPasswordField = document.querySelector(".profile input[name=repeatPassword]");
const repeatPasswordMatches = () => {
  const p = document.querySelector(".profile input[name=password]").value;
  const r = repeatPassword.value;
  return p == r;
};

const checkPasswordRepeat = () => {
  const passwordField = document.querySelector(".profile input[name=password]");
  if(passwordField.value == repeatPasswordField.value) {
    repeatPasswordField.setCustomValidity("");
    return;
  } else {
    repeatPasswordField.setCustomValidity("Password doesn't match");
  }
}

passwordField.addEventListener("input", checkPasswordRepeat);
repeatPasswordField.addEventListener("input", checkPasswordRepeat);

// TODO:  On page load, read the path and whether the user has valid credentials:
//        - If they ask for the splash page ("/"), display it
//        - If they ask for the login page ("/login") and don't have credentials, display it
//        - If they ask for the login page ("/login") and have credentials, send them to "/"
//        - If they ask for any other valid page ("/profile" or "/room") and do have credentials,
//          show it to them
//        - If they ask for any other valid page ("/profile" or "/room") and don't have
//          credentials, send them to "/login", but remember where they were trying to go. If they
//          login successfully, send them to their original destination
//        - Hide all other pages

let CURRENT_ROOM = 0

// A function to show a particular page according to the path
let showOnly = (element) => {
    PROFILE.classList.add("hide")
    SPLASH.classList.add("hide")
    LOGIN.classList.add("hide")
    ROOM.classList.add("hide")
    element.classList.remove("hide")
}

// the router that directs to different views using showOnly
let route = () => {
  const path = window.location.pathname
  if (path === "/") {
    showOnly(SPLASH)
    hideOrShowElements()

  } else if (path === "/profile") {
    showOnly(PROFILE)
  } else if (path === "/login") {
    showOnly(LOGIN)
    failedMsg.classList.add("hide")
  } else if (path.startsWith("/rooms/")) {
    showOnly(ROOM)
  } else {
    console.log("Error!")
  }
}

// update username in views
function showUsername() {
  let username = localStorage.getItem("user_name")
  if (!username) {
    username = "Guest"
  }
  document.querySelectorAll(".username").forEach(name => {
      name.textContent = username;
  })
}

// a function to hide the signup button to logged in users
function hideOrShowElements() {
  let signupBtn = document.getElementById("signup-button")
  let homeLoginBtn = document.getElementById("home-login")
  let createRoomBtn = document.getElementById("create-room-button")
  if (localStorage.getItem("api_key")) {
    signupBtn.classList.add("hide")
    homeLoginBtn.classList.add("hide")
  } else {
    createRoomBtn.classList.add("hide")
  }
}

function signup() {
  const url = "/api/signup"
  fetch(url, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    return response.json()
  }).then(user => {
    localStorage.setItem("user_id", user.user_id)
    localStorage.setItem("user_name", user.user_name)
    localStorage.setItem("api_key", user.api_key)

    // update username on views once account is created
    showUsername()
    // once account is created, it's logged in, hence hiding corresponding button on home page
    hideOrShowElements()

    alert("Account Created Successfully! Navigating to home page...")
    history.pushState({ path: "/" }, "", "/")
    window.dispatchEvent(new Event("popstate"))
  }).catch((error) => {
    console.log(`Error: ${error}`)
  })
}

function login() {
  let user_name = document.getElementById("username-input").value
  let password = document.getElementById("password-input").value
  fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "user_name": user_name,
      "password": password
    }),
  }).then(response => {
    return response.json()
  }).then(user => {
    if (user.api_key) {
      localStorage.setItem("user_id", user.user_id)
      localStorage.setItem('user_name', user.user_name);
      localStorage.setItem('api_key', user.api_key);

      // Once logged in, there is api_key in Localstorage, hence hiding corresponding button on home page
      hideOrShowElements()
      alert("Logged In Successfully! Navigating to home page...")
      failedMsg.classList.add("hide");
      history.pushState({path: "/"}, "", "/")
      showUsername()
      window.dispatchEvent(new Event("popstate"))
    } else {
      failedMsg.classList.remove("hide");
    }
  }).catch(error => {
    console.log(`Error: ${error}`)
  })
}

// logout: clear Localstorage, go to home page, and update username on the view
function logout() {

  // if canceled, nothing happens
  if (!confirm("Are you sure to log out?")) {
    return
  }
  // if confirmed, do the job
  localStorage.removeItem("user_id")
  localStorage.removeItem("user_name")
  localStorage.removeItem("api_key")
  history.pushState({ path: "/" }, "", "/")
  alert("Logged Out Successfully! Navigating to home page...")
  route()
  showUsername()
  hideOrShowElements()
}

window.addEventListener("DOMContentLoaded", () => {
  route()
  showUsername()
})

window.addEventListener("popstate", route)


// TODO:  When  displaying a page, update the DOM to show the appropriate content for any element
//        that currently contains a {{ }} placeholder. You do not have to parse variable names out
//        of the curly  braces—they are for illustration only. You can just replace the contents
//        of the parent element (and in fact can remove the {{}} from index.html if you want).

// TODO:  Handle clicks on the UI elements.
//        - Send API requests with fetch where appropriate.
//        - Parse the results and update the page.
//        - When the user goes to a new "page" ("/", "/login", "/profile", or "/room"), push it to
//          History

// TODO:  When a user enters a room, start a process that queries for new chat messages every 0.1
//        seconds. When the user leaves the room, cancel that process.
//        (Hint: https://developer.mozilla.org/en-US/docs/Web/API/setInterval#return_value)

// On page load, show the appropriate page and hide the others
