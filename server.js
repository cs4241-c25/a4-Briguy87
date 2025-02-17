const express = require('express');
const session = require('express-session');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

const port = 3000;

const app = express();
app.use(bodyParser.json());

const mongoUrl = 'mongodb://localhost:27017/';
const dbName = 'a4';
let collection;


async function connectToDatabase() {
    try {
        const client = await MongoClient.connect(mongoUrl);
        const db = client.db(dbName);
        collection = db.collection('a_test');
        console.log('Connected to the database');

        // Perform database operations here
        // Example: const docs = await collection.find({}).toArray();
        // console.log(docs);

    } catch (err) {
        console.error('Failed to connect to the database. Error:', err);
        process.exit(1);
    }
}

connectToDatabase();

app.use(session({ secret: 'your secret', resave: false, saveUninitialized: true }));
app.use(express.static('public'));
app.use(express.json());



passport.use(new GitHubStrategy({
    clientID: 'Ov23ctRmiXeXnDnlKpYU',
    clientSecret: 'c22a4a1d34161a0941173507410cc1745e069fa6',
    callbackURL: 'http://localhost:3000/auth/github/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await collection.findOne({ githubId: profile.id });
            if (!user) {
                user = await collection.insertOne({ username: profile.username, githubId: profile.id });
            }
            console.log('GitHub user:', user);
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

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
        res.redirect('/');
    });

app.get('/session', (req, res) => {
    if (req.session.username && req.session.password) {
        res.json({ username: req.session.username, password: req.session.password });
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
        const newUser = { username, password };
        await collection.insertOne(newUser);
        res.status(201).send('User registered');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

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
            req.session.user = user;
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in');
    }
});



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/data', async (req, res) => {
    const username = req.query.username;
    if (!collection) {
        console.error('Database not initialized');
        return res.status(500).send('Database not initialized');
    }
    try {
        const userData = await collection.find({ username }).toArray();
        // Filter out objects with a password field
        const filteredData = userData.filter(item => !item.password);
        res.json(filteredData);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
    }
});

app.post('/add', async (req, res) => {
    const newData = req.body;
    const currentYear = new Date().getFullYear();
    newData.age = currentYear - newData.year;
    if (!collection) {
        console.error('Database not initialized');
        return res.status(500).send('Database not initialized');
    }
    try {
        // Insert new data
        await collection.insertOne(newData);
        const userData = await collection.find({ username: newData.username }).toArray();
        // Filter out objects with a password field
        const filteredData = userData.filter(item => !item.password);
        res.status(200).json(filteredData);
    } catch (err) {
        console.error('Error adding data:', err);
        res.status(500).send('Error adding data');
    }
});

app.put('/update/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    const currentYear = new Date().getFullYear();
    updatedData.age = currentYear - updatedData.year;
    if (!collection) {
        console.error('Database not initialized');
        return res.status(500).send('Database not initialized');
    }
    try {
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
        const userData = await collection.find({ username: updatedData.username, password: updatedData.password }).toArray();
        res.status(200).json(userData);
    } catch (err) {
        console.error('Error updating data:', err);
        res.status(500).send('Error updating data');
    }
});

app.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;
    const username = req.query.username;
    const password = req.query.password;
    if (!collection) {
        console.error('Database not initialized');
        return res.status(500).send('Database not initialized');
    }
    try {
        await collection.deleteOne({ _id: new ObjectId(id), username, password });
        const userData = await collection.find({ username, password }).toArray();
        res.status(200).json(userData);
    } catch (err) {
        console.error('Error deleting data:', err);
        res.status(500).send('Error deleting data');
    }
});

app.get('/data', async (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    if (!collection) {
        console.error('Database not initialized');
        return res.status(500).send('Database not initialized');
    }
    try {
        const userData = await collection.find({ username, password }).toArray();
        res.json(userData);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
