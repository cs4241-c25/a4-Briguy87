// FRONT-END (CLIENT) JAVASCRIPT HERE
let editId = null;

document.addEventListener("DOMContentLoaded", () => {
    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");

    if (storedUsername && storedPassword) {
        autoLogin(storedUsername, storedPassword);
    } else {
        checkGitHubLogin();
    }

    const loginForm = document.querySelector("#login-form");
    const bookForm = document.querySelector("#book-form");
    const logoutButton = document.querySelector("#logout-button");
    const githubLoginButton = document.querySelector("#github-login-button");

    if (loginForm) {
        loginForm.addEventListener("submit", loginOrRegisterUser);
    }
    if (bookForm) {
        bookForm.addEventListener("submit", addBook);
    }
    if (logoutButton) {
        logoutButton.addEventListener("click", logoutUser);
    }
    if (githubLoginButton) {
        githubLoginButton.addEventListener("click", () => {
            window.location.href = "/auth/github";
        });
    }
});

const checkGitHubLogin = async function () {
    const response = await fetch("/session");
    if (response.ok) {
        const sessionData = await response.json();
        console.log('Session data:', sessionData); // Debugging print statement
        if (sessionData.username && sessionData.password) {
            localStorage.setItem("username", sessionData.username);
            localStorage.setItem("password", sessionData.password);
            updateUI(sessionData.username, sessionData.password);
        }
    } else {
        console.error('Failed to fetch session data'); // Debugging print statement
    }
};

const autoLogin = async function (username, password) {
    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        alert("Auto login successful");
        updateUI(username, password);
    } else {
        alert("Auto login failed");
        localStorage.removeItem("username");
        localStorage.removeItem("password");
    }
};

const updateUI = function (username, password) {
    const mainContent = document.querySelector("#main-content");
    const loginForm = document.querySelector("#login-form");
    const bookForm = document.querySelector("#book-form");
    const logoutButton = document.querySelector("#logout-button");
    if (mainContent && loginForm && bookForm && logoutButton) {
        mainContent.style.display = "block";
        loginForm.style.display = "none";
        bookForm.style.display = "block";
        logoutButton.style.display = "block";
    }
    fetchData();
};

const loginOrRegisterUser = async function (event) {
    event.preventDefault();
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        alert("Login successful");
        updateUI(username, password);
    } else if (response.status === 401) {
        const registerResponse = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (registerResponse.ok) {
            localStorage.setItem("username", username);
            localStorage.setItem("password", password);
            alert("User registered successfully");
            updateUI(username, password);
        } else if (registerResponse.status === 400) {
            alert("Username already exists");
        } else {
            alert("Error registering user");
        }
    } else {
        alert("Error logging in");
    }
};

const logoutUser = function () {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    const mainContent = document.querySelector("#main-content");
    const loginForm = document.querySelector("#login-form");
    const bookForm = document.querySelector("#book-form");
    const logoutButton = document.querySelector("#logout-button");
    if (mainContent && loginForm && bookForm && logoutButton) {
        mainContent.style.display = "none";
        loginForm.style.display = "block";
        bookForm.style.display = "none";
        logoutButton.style.display = "none";
    }
};

const addBook = async function (event) {
    event.preventDefault();
    const title = document.querySelector("#title").value;
    const author = document.querySelector("#author").value;
    const year = document.querySelector("#year").value;
    const username = localStorage.getItem("username");

    const response = await fetch("/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, author, year, username })
    });

    if (response.ok) {
        await fetchData();
        document.querySelector("#book-form").reset();
    } else {
        alert("Error adding book");
    }
};

const fetchData = async function () {
    const username = localStorage.getItem("username");
    const response = await fetch(`/data?username=${username}`);
    const data = await response.json();
    const resultsTable = document.getElementById("results").getElementsByTagName("tbody")[0];
    resultsTable.innerHTML = "";

    data.forEach((item) => {
        const row = resultsTable.insertRow();
        row.insertCell(0).innerText = item.username; // Display the username
        row.insertCell(1).innerText = item.title;
        row.insertCell(2).innerText = item.author;
        row.insertCell(3).innerText = item.year;
        row.insertCell(4).innerText = item.age;
        const actionCell = row.insertCell(5);

        const editButton = document.createElement("button");
        editButton.innerText = "Edit";
        editButton.className = "mui-btn mui-btn--small mui-btn--primary";
        editButton.onclick = function () {
            document.querySelector("#title").value = item.title;
            document.querySelector("#author").value = item.author;
            document.querySelector("#year").value = item.year;
            editId = item._id;
        };
        actionCell.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";
        deleteButton.className = "mui-btn mui-btn--small mui-btn--danger";
        deleteButton.onclick = async function () {
            await fetch(`/delete/${item._id}?username=${username}`, {
                method: "DELETE"
            });
            await fetchData();
        };
        actionCell.appendChild(deleteButton);
    });
};