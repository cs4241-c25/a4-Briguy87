import React, { useState } from 'react';

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
        <form onSubmit={handleSubmit} className="book-form">
            <div>
                <label>Title:</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
                <label>Author:</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required />
            </div>
            <div>
                <label>Year:</label>
                <input type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
            </div>
            <div className="button-group">
                <button type="submit">Add Book</button>
                <button type="button" onClick={handleLogout}>Logout</button>
            </div>
        </form>
    );
}

export default BookForm;
