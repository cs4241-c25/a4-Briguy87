import React, { useState, useEffect } from 'react';

function BookList({ user }) {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const response = await fetch(`/data?username=${user.username}`);
        const data = await response.json();
        setBooks(data);
    };

    const handleDelete = async (id) => {
        await fetch(`/delete/${id}?username=${user.username}`, {
            method: 'DELETE'
        });
        fetchData();
    };

    return (
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
                {books.map((book) => (
                    <tr key={book._id}>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.year}</td>
                        <td>{book.age}</td>
                        <td>
                            <button onClick={() => handleDelete(book._id)}>Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default BookList;
