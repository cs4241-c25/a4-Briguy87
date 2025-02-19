const express = require('express');
const session = require('express-session');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const path = require('path');

const port = 3000;

const app = express();
app.use(bodyParser.json());

const mongoUrl = 'mongodb://localhost:27017/';
const dbName = 'a4';
let collection;

async function connectToDatabase() {
    const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to database');
    const db = client.db(dbName);
    collection = db.collection('users');
}

connectToDatabase();

app.use(session({ secret: 'your secret', resave: false, saveUninitialized: true }));
app.use(express.static('public'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

passport.use(new GitHubStrategy({
    clientID: 'Ov23ctRmiXeXnDnlKpYU',
    clientSecret: 'c22a4a1d34161a0941173507410cc1745e069fa6',
    callbackURL: 'http://localhost:3000/auth/github/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await collection.findOne({ githubId: profile.id });
            if (!user) {
                const result = await collection.insertOne({ username: profile.username, githubId: profile.id });
                user = result.ops[0];
            }
            console.log('GitHub user:', user);
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

passport.serializeUser((user, done) => {
    if (user && user._id) {
        console.log('Serializing user:', user._id);
        done(null, user._id);
    } else {
        console.error('Failed to serialize user:', user);
        done(new Error('Failed to serialize user'));
    }
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await collection.findOne({ _id: new ObjectId(id) });
        done(null, user);
    } catch (err) {
        done(err);
    }
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/github',
    passport.authenticate('github'));

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        // Store the GitHub username and GitHub ID in the session
        req.session.username = req.user.username;
        req.session.password = req.user.githubId;
        console.log('GitHub callback session:', req.session); // Debugging print statement
        res.redirect('/');
    });

app.get('/session', (req, res) => {
    console.log('Session check:', req.session); // Debugging print statement
    if (req.isAuthenticated()) {
        res.json({ username: req.user.username, password: req.user.githubId });
    } else {
        res.status(401).send('No session data');
    }
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!collection) {
        console.error('Database not initialized');
        return res.status(500).send('Database not initialized');
    }
    try {
        // Check if the username already exists
        const existingUser = await collection.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }
        const result = await collection.insertOne({ username, password });
        const user = result.ops[0];
        req.login(user, (err) => {
            if (err) {
                return res.status(500).send('Registration failed');
            }
            return res.json({ success: true });
        });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password }); // Debugging print statement
    if (!collection) {
        console.error('Database not initialized');
        return res.status(500).send('Database not initialized');
    }
    try {
        const user = await collection.findOne({
            username,
            $or: [
                { password },
                { githubId: password }
            ]
        }); if (user) {
            req.login(user, (err) => {
                if (err) {
                    return res.status(500).send('Login failed');
                }
                console.log('Login successful:', user); // Debugging print statement
                return res.json({ success: true });
            });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).send('Error logging in user');
    }
});

app.post('/add', async (req, res) => {
    const { title, author, year, username } = req.body;
    if (!collection) {
        console.error('Database not initialized');
        return res.status(500).send('Database not initialized');
    }
    try {
        const currentYear = new Date().getFullYear();
        const age = currentYear - year;
        const result = await collection.insertOne({ title, author, year, age, username });
        res.json(result.ops[0]);
    } catch (err) {
        console.error('Error adding book:', err);
        res.status(500).send('Error adding book');
    }
});

app.get('/data', async (req, res) => {
    const { username } = req.query;
    if (!collection) {
        console.error('Database not initialized');
        return res.status(500).send('Database not initialized');
    }
    try {
        const books = await collection.find({ username }).toArray();
        res.json(books);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
    }
});

app.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const { username } = req.query;
    if (!collection) {
        console.error('Database not initialized');
        return res.status(500).send('Database not initialized');
    }
    try {
        await collection.deleteOne({ _id: new ObjectId(id), username });
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting book:', err);
        res.status(500).send('Error deleting book');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
