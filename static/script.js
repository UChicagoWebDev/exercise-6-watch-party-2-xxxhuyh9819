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
  const url = "/api/login"
  fetch(url, {
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
  // src: https://phppot.com/javascript/javascript-confirm/
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


function updateUsername() {
  let user_name = document.getElementById("update-username-input").value;

  const url = "/api/user/name"
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': API_KEY
    },
    body: JSON.stringify({
      "user_name": user_name
    }),
  }).then(response => {
    return response.json()
  }).then(() => {
    localStorage.setItem('user_name', user_name);
    alert("Username Updated Successfully!")
    showUsername()
  }).catch(error => {
    console.log(`Error: ${error}`)
  })
}

const API_KEY = localStorage.getItem('api_key');

function updatePassword() {
  const API_KEY = localStorage.getItem('api_key');
  let password = document.getElementById("update-password-input").value;
  const url = "/api/user/password"
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': API_KEY
    },
    body: JSON.stringify({
      "password": password
    }),
  }).then(response => {
    return response.json()
  }).then(() => {
    alert("Password Updated Successfully!")
    showUsername()
  }).catch(error => {
    console.log(`Error: ${error}`)
  })
}

function createRoom() {
  const url = "/api/rooms/new-room"
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': API_KEY
    },
  }).then(response => {
    return response.json()
  }).then(room => {
    alert("Room Created Successfully! Navigating to the room...")
    let room_name = document.getElementById("room-name")
    const inviteLink = document.querySelector(".invite")
    let text = inviteLink.textContent
    room_name.innerHTML = room.name
    inviteLink.textContent = text + String(room.id)
    CURRENT_ROOM = room.id
    history.pushState({path: `/rooms/${CURRENT_ROOM}`}, '', `/rooms/${CURRENT_ROOM}`);
    window.dispatchEvent(new Event('popstate'));
    getMessage()
  }).catch(error => {
    console.log(`Error: ${error}`)
  })
}

function showRooms() {
  const url = "/api/rooms"
  let roomList = document.body.querySelector(".roomList");
  let zeroRoomDiv = document.body.querySelector(".noRooms");
  roomList.innerHTML = '';

  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(response => {
    return response.json()
  }).then(data => {
    roomList.innerHTML = ""
    zeroRoomDiv.classList.add("hide")
    if (data.length === 0) {
      zeroRoomDiv.classList.remove("hide")
    }
    data.forEach(room => {
      anchor = renderRoom(room)
      roomList.appendChild(anchor)
    })

  }).catch(error => {
    console.log(`Error: ${error}`)
  })
}

function gotoRoom(room_id) {
  history.pushState({path: `/rooms/${room_id}`}, '', `/rooms/${room_id}`);
  window.dispatchEvent(new Event('popstate'));
}

function renderRoom(room) {
  const newRoomAnchor = document.createElement("a")
  newRoomAnchor.textContent = room.id + room.name
  newRoomAnchor.addEventListener("click", (event) => {
    gotoRoom(room.id)
  })
  return newRoomAnchor
}

function renderMessages(msg, container) {
    const messageElement = document.createElement("message");
    const authorElement = document.createElement("author")
    const contentElement = document.createElement("content")
    contentElement.textContent = msg["body"]
    authorElement.textContent = msg["name"]
    messageElement.appendChild(contentElement)
    messageElement.appendChild(authorElement)
    container.appendChild(messageElement);
}

function getMessage() {
    const inviteLink = document.querySelector(".invite")
    // src: https://stackoverflow.com/questions/10539299/getting-link-text-within-a-div
    const text = inviteLink
                   .getElementsByTagName('a')[0].innerHTML
    const room_id = Number(text.slice(text.length - 1))
    const url = `/api/rooms/${room_id}/messages`
    fetch(url, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'API-Key': API_KEY
        }
    }).then(response => response.json())
        .then(msgs => {
            const container = document.querySelector(".messages");
            container.innerHTML = "";
            msgs.forEach(msg => {
              renderMessages(msg, container)
            });
        })
        .catch(error => console.log(`Error: ${error}`))
}

window.addEventListener("DOMContentLoaded", () => {
  route()
  showUsername()
  showRooms()
})

window.addEventListener("popstate", route)