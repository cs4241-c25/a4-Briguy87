import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import BookForm from './components/BookForm';
import BookList from './components/BookList';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedPassword = localStorage.getItem('password');
        if (storedUsername && storedPassword) {
            autoLogin(storedUsername, storedPassword);
        }
    }, []);

    const autoLogin = async (username, password) => {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            setUser({ username, password });
        } else {
            localStorage.removeItem('username');
            localStorage.removeItem('password');
        }
    };

    return (
        <div className="App">
            {user ? (
                <>
                    <BookForm user={user} />
                    <BookList user={user} />
                </>
            ) : (
                <LoginForm setUser={setUser} />
            )}
        </div>
    );
}

export default App;
