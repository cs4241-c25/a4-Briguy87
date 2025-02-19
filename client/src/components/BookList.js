import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box } from '@mui/material';

function BookList({ user, books, fetchData }) {
    const [editBook, setEditBook] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        await fetch(`/delete/${id}?username=${user.username}`, {
            method: 'DELETE'
        });
        fetchData();
    };

    const handleEdit = (book) => {
        setEditBook(book);
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        const { _id, title, author, year } = editBook;
        await fetch(`/update/${_id}?username=${user.username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, author, year })
        });
        setEditBook(null);
        fetchData();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setEditBook({ ...editBook, [name]: value });
    };

    return (
        <div>
            {editBook && (
                <Box component="form" onSubmit={handleUpdate} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Title"
                        name="title"
                        value={editBook.title}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="Author"
                        name="author"
                        value={editBook.author}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="Year"
                        name="year"
                        type="number"
                        value={editBook.year}
                        onChange={handleChange}
                        required
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button type="submit" variant="contained" color="primary">Update</Button>
                        <Button type="button" onClick={() => setEditBook(null)} variant="contained" color="secondary">Cancel</Button>
                    </Box>
                </Box>
            )}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Author</TableCell>
                            <TableCell>Year</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {books.filter(book => book.title).map((book) => (
                            <TableRow key={book._id}>
                                <TableCell>{book.title}</TableCell>
                                <TableCell>{book.author}</TableCell>
                                <TableCell>{book.year}</TableCell>
                                <TableCell>{book.age}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button variant="contained" color="primary" onClick={() => handleEdit(book)}>Edit</Button>
                                        <Button variant="contained" color="secondary" onClick={() => handleDelete(book._id)}>Delete</Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default BookList;
