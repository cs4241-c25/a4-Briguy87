import React, { useState, useEffect } from 'react';

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
                <form onSubmit={handleUpdate}>
                    <label>
                        Title:
                        <input
                            type="text"
                            name="title"
                            value={editBook.title}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Author:
                        <input
                            type="text"
                            name="author"
                            value={editBook.author}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Year:
                        <input
                            type="number"
                            name="year"
                            value={editBook.year}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <button type="submit">Update</button>
                    <button type="button" onClick={() => setEditBook(null)}>Cancel</button>
                </form>
            )}
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Year</th>
                        <th>Age</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {books.filter(book => book.title).map((book) => (
                        <tr key={book._id}>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.year}</td>
                            <td>{book.age}</td>
                            <td className="button-group">
                                <button className="edit-button" onClick={() => handleEdit(book)}>Edit</button>
                                <button className="delete-button" onClick={() => handleDelete(book._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default BookList;
