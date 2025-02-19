import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

function BookForm({ user, handleLogout, fetchData }) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [year, setYear] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await fetch('/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, author, year, username: user.username })
        });

        if (response.ok) {
            setTitle('');
            setAuthor('');
            setYear('');
            fetchData(); // Fetch the updated list of books
        } else {
            alert('Error adding book');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <TextField
                label="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
            />
            <TextField
                label="Year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" color="primary">Add Book</Button>
                <Button type="button" onClick={handleLogout} variant="contained" color="secondary">Logout</Button>
            </Box>
        </Box>
    );
}

export default BookForm;
