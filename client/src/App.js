import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import BookForm from './components/BookForm';
import BookList from './components/BookList';

function App() {
    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedPassword = localStorage.getItem('password');
        if (storedUsername && storedPassword) {
            autoLogin(storedUsername, storedPassword);
        } else {
            checkGitHubLogin();
        }
    }, []);

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

    const updateUI = function (username, password) {
        setUser({ username, password });
        fetchData();
    };

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        setUser(null);
    };

    const fetchData = async () => {
        if (user) {
            const response = await fetch(`/data?username=${user.username}`);
            const data = await response.json();
            setBooks(data);
        }
    };

    return (
        <div className="App">
            {user ? (
                <>
                    <BookForm user={user} handleLogout={handleLogout} fetchData={fetchData} />
                    <BookList user={user} books={books} fetchData={fetchData} />
                </>
            ) : (
                <LoginForm setUser={setUser} />
            )}
        </div>
    );
}

export default App;
