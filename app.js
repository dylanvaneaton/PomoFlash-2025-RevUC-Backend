const express = require('express')
const pgp = require('pg-promise')();

// DB Connection Info (From environment in compose)
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.POSTGRES_DB || 'pomoflashdb',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
};
// Create instance of db
const db = pgp(dbConfig);


const app = express();
app.use(express.json()); // Honestly don't quite understand this yet.

// Test DB connection
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await db.one('SELECT NOW() AS current_time');
        res.json({message: 'Database connected.', time: result.current_time});
    } catch (error) {
        console.error('Problem connecting to DB.', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Add user to DB
app.post('/api/useradd', async (req, res) => {
    const { firstname, userlogin } = req.body;
    try {
        const result = await db.one(
            'INSERT INTO Users (UserFirst, UserLogin) VALUES ($1, $2) RETURNING *',
            [firstname, userlogin]
        ); // $1, $2 are parameterized queries, allows for sanatized safe input.
        res.status(201).json({user: result});
    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).json({ error: 'Failed to insert user.'});
    }
});

// Truncate user table. Will probably be useful.
app.post('/api/wipeusers', async (req, res) => {
    try {
        const result = await db.none('TRUNCATE TABLE Users CASCADE');
        res.status(201).json({result: 'Success truncating users table.'});
    } catch (error) {
        console.error('Error truncating table:', error);
        res.status(500).json({ error: 'Failed to truncate table.' })
    }
});

// Login. Very simple, no security for simplicity. It's a hack after all.
app.post('/api/login', async (req, res) => {
    const { userlogin } = req.body;
    try {
        const result = await db.one('SELECT * FROM Users WHERE UserLogin = $1', [ userlogin ]);
        res.status(201).json({ user: result });
    } catch (error) {
        console.error('Error fetching user info from login:', error);
        res.status(500).json({ error: 'Failed to fetch user info.' });
    }
});

// Fetch all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await db.any('SELECT * FROM Users');
        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error)
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Start server
const port = process.env.EXPRESS_PORT || 3001;
app.listen(port, () => {
    console.log('Server running')
});
