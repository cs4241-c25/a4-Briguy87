import React, { useState } from 'react';

function LoginForm({ setUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            setUser({ username, password });
        } else {
            const registerResponse = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (registerResponse.ok) {
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                setUser({ username, password });
            } else {
                alert('Error logging in or registering');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Username:</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit">Login/Register</button>
        </form>
    );
}

export default LoginForm;
