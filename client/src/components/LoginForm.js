import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';

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

    const handleGitHubLogin = () => {
        window.location.href = '/auth/github';
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <Button type="submit" variant="contained" color="primary">Login/Register</Button>
            <Button type="button" onClick={handleGitHubLogin} variant="contained" color="secondary">Login with GitHub</Button>
        </Box>
    );
}

export default LoginForm;
