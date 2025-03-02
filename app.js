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

// Truncate (wipe) user table. Will probably be useful.
app.post('/api/wipeusers', async (req, res) => {
    try {
        const result = await db.none('TRUNCATE TABLE Users CASCADE');
        res.status(201).json({result: 'Success truncating users table.'});
    } catch (error) {
        console.error('Error truncating table:', error);
        res.status(500).json({ error: 'Failed to truncate table.' })
    }
});

// Add user to DB
app.post('/api/adduser', async (req, res) => {
    const { userfirst, userlogin } = req.body;
    try {
        const result = await db.one(
            'INSERT INTO Users (UserFirst, UserLogin) VALUES ($1, $2) RETURNING *',
            [userfirst, userlogin]
        ); // $1, $2 are parameterized queries, allows for sanatized safe input.
        res.status(201).json({user: result});
    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).json({ error: 'Failed to insert user.'});
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

// Add a task for a user.
app.post('/api/addtask', async (req, res) => {
    const { userid, taskname, taskdescription, taskcompletion } = req.body;
    try {
        const result = await db.one(
            'INSERT INTO Tasks (UserID, TaskName, TaskDescription, TaskCompletion) VALUES ($1, $2, $3, $4) RETURNING *',
            [userid, taskname, taskdescription, taskcompletion]
        );
        res.status(201).json({task: result});
    } catch (error) {
        console.error('Error inserting task:', error);
        res.status(500).json({ error: 'Failed to insert task.'});
    }
});

// Fetch tasks for a specified user id.
app.post('/api/fetchtasks', async (req, res) => {
    const { userid } = req.body;
    try {
        const tasks = await db.any('SELECT * FROM Tasks WHERE UserID = $1', [ userid ]);
        res.status(201).json({tasks: result});
    } catch (error) {
        console.error('Error fetching tasks for specified user:', error);
        res.status(500).json({ error: 'Failed to fetch tasks.' });
    }
});

// Fetch all users, will be removed after testing
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
const port = process.env.EXPRESS_PORT;
app.listen(port, () => {
    console.log('Server running')
});
