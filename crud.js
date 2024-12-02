const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));


const db = new sqlite3.Database('./crud_system.db');


db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, role TEXT)');

 
app.post('/signup', (req, res) => {
    const { username, password, role } = req.body;

    // Hash the password before storing
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send({ message: 'Error hashing password' });
        }

        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], function(err) {
            if (err) {
                return res.status(500).send({ message: 'Error adding user' });
            }
            res.status(200).send({ message: 'User signed up successfully' });
        });
    });
});

// API to login user (check password with hash)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err || !row) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }

        // Compare the hashed password
        bcrypt.compare(password, row.password, (err, result) => {
            if (result) {
                res.status(200).send({ message: 'Login successful', user: row });
            } else {
                res.status(401).send({ message: 'Invalid credentials' });
            }
        });
    });
});

// API to get user profile (Read)
app.get('/profile', (req, res) => {
    const userId = req.query.userId;  // This will be passed from the client after login

    db.get('SELECT id, username, role FROM users WHERE id = ?', [userId], (err, row) => {
        if (err || !row) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send(row);
    });
});

// API to update user profile (Update)
app.put('/profile', (req, res) => {
    const userId = req.body.userId;  // This will be passed from the client
    const { username, password, role } = req.body;

    // Hash the new password if provided
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send({ message: 'Error hashing password' });
        }

        db.run('UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?', 
            [username, hashedPassword, role, userId], function(err) {
            if (err) {
                return res.status(500).send({ message: 'Error updating profile' });
            }
            res.status(200).send({ message: 'Profile updated successfully' });
        });
    });
});

// API to delete user profile (Delete)
app.delete('/profile', (req, res) => {
    const userId = req.body.userId;  // This will be passed from the client

    db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
        if (err) {
            return res.status(500).send({ message: 'Error deleting profile' });
        }
        res.status(200).send({ message: 'Profile deleted successfully' });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
