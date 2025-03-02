const express = require('express')
const pgp = require('pg-promise')();
const cors = require('cors');

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

// CORS, fixes it for dev.
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

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

// Fetch user info for id. Can use to pull info about the time for timer.
app.post('/api/fetchuserbyid', async (req, res) => {
    const { userid } = req.body;
    try {
        const user = await db.one('SELECT * FROM Users Where UserID = $1', [userid]);
        res.status(201).json({ user: user });
    } catch (error) {
        console.error('Error fetching user info by id:', error);
        res.status(500).json({ error: "Failed to fetch user info by id."});
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
        res.status(500).json({ error: 'Failed to fetch user info from login.' });
    }
});

// Add a task for a user.
app.post('/api/addtask', async (req, res) => {
    const { userid, taskname, taskdescription, taskcompletion } = req.body;
    try {
        const task = await db.one(
            'INSERT INTO Tasks (UserID, TaskName, TaskDescription, TaskCompletion) VALUES ($1, $2, $3, $4) RETURNING *',
            [userid, taskname, taskdescription, taskcompletion]
        );
        res.status(201).json({task: task});
    } catch (error) {
        console.error('Error inserting task:', error);
        res.status(500).json({ error: 'Failed to insert task.'});
    }
});

app.post('/api/deletetask', async (req, res) => {
    const { taskid } = req.body;
    try {
        const task = await db.none('DELETE FROM Tasks WHERE TaskID = $1', [taskid]);
        res.status(201).json({task: 'Task successfully deleted.'})
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Task failed to delete.'});
    }
});

app.post('/api/modifytask', async (req, res) => {
    const { taskid, taskname, taskdescription, taskcompletion, userid } = req.body;
    try {
        const updatedtask = await db.none('UPDATE Tasks SET TaskName = $2, SET TaskDescription = $3, SET TaskCompletion = $4 WHERE TaskID = $1', [taskid, taskname, taskdescription, taskcompletion]);
        const taskslist = await db.any('SELECT * FROM Tasks WHERE UserID = $1', [userid]);
        res.status(201).json({tasks: taskslist});
    } catch (error) {
        console.error('Error modifying task:', error);
        res.status(500).json({ error: 'Task failed to modify.'});
    }
});

// Fetch tasks for a specified user id.
app.post('/api/fetchtasks', async (req, res) => {
    const { userid } = req.body;
    try {
        const tasks = await db.any('SELECT * FROM Tasks WHERE UserID = $1', [userid]);
        res.status(201).json({tasks: tasks});
    } catch (error) {
        console.error('Error fetching tasks for specified user:', error);
        res.status(500).json({ error: 'Failed to fetch task by user.' });
    }
});

app.post('/api/fetchtaskbyid', async (req, res) => {
    const { taskid } = req.body;
    try {
        const task = await db.one('SELECT * FROM Tasks WHERE TaskID = $1', [taskid]);
        res.status(201).json({task: task});
    } catch (error) {
        console.error('Error fetching task for specified id:', error);
        res.status(500).json({ error: 'Failed to fetch task by id.'});
    }
});

// Create a card deck.
app.post('/api/createcarddeck', async (req, res) => {
    const { userid, deckname, deckdescription } = req.body;
    try {
        const deck = await db.one('INSERT INTO CardDecks (UserID, DeckName, DeckDescription) VALUES ($1, $2, $3) RETURNING *', [userid, deckname, deckdescription]);
        res.status(201).json({deck: deck});
    } catch (error) {
        console.error('Error inserting into CardDecks:', error);
        res.status(500).json({ error: 'Failed to insert CardDeck.'})
    }
});

// Fetch card decks for a specified userid.
app.post('/api/fetchcarddecks', async (req, res) => {
    const { userid } = req.body;
    try {
        const decks = await db.any('SELECT * FROM CardDecks WHERE UserID = $1', [userid]);
        res.status(201).json({decks: decks});
    } catch (error) {
        console.error('Error fetching decks for specified user:', error);
        res.status(500).json({ error: 'Failed to fetch decks.' });
    }
});

// Create a question for a specified carddeckid.
app.post('/api/createcarddeckquestion', async (req, res) => {
    const { carddeckid, question } = req.body;
    try {
        const question = await db.one('INSERT INTO DeckQuestions (CardDeckID, Question) VALUES ($1, $2) RETURNING *', [carddeckid, question]);
        res.status(201).json({question: question});
    } catch (error) {
        console.error('Error inserting questions for specified deck:', error);
        res.status(500).json({ error: 'Failed to insert question.' });
    }
});

// Fetch questions for a specified deck.
app.post('/api/fetchcarddeckquestions', async (req, res) => {
    const { carddeckid } = req.body;
    try {
        const questions = await db.any('SELECT * FROM DeckQuestions WHERE CardDeckID = $1', [carddeckid]);
        res.status(201).json({questions: questions});
    } catch (error) {
        console.error('Error fetching questions for specified deck:', error);
        res.status(500).json({ error: 'Failed to fetch questions.' });
    }
});

// Create a answer for a specified questionid.
app.post('/api/createcarddeckanswer', async (req, res) => {
    const { deckquestionid, answer } = req.body;
    try {
        const answer = await db.one('INSERT INTO DeckAnswers (DeckQuestionID, Answer) VALUES ($1, $2) RETURNING *', [deckquestionid, answer]);
        res.status(201).json({answer: answer});
    } catch (error) {
        console.error('Error inserting answer for specified question:', error);
        res.status(500).json({ error: 'Failed to insert answer.' });
    }
});

// Fetch answers for a specified deckquestionid.
app.post('/api/fetchcarddeckanswers', async (req, res) => {
    const { deckquestionid } = req.body;
    try {
        const answers = await db.any('SELECT * FROM DeckAnswers WHERE DeckQuestionID = $1', [deckquestionid]);
        res.status(201).json({answers: answers});
    } catch (error) {
        console.error('Error fetching answers for specified questions:', error);
        res.status(500).json({ error: 'Failed to fetch answers.' });
    }
});

// Below this comment is my attempt at timering. It will probably be adjacent to a crime against humanity.
app.post('/api/checktimer', async (req, res) => {
    const { userid } = req.body;
    try {
        const isTimerActiveAndStillGood = await db.oneOrNone('SELECT * FROM Users WHERE TimerActive = TRUE ANDUserID = $1 AND (TimerStartTime + TimerLength) >= NOW()', [userid]);
        
        // If above returned a row, there is an active timer that is not yet stale.
        if(isTimerActiveAndStillGood) {
            const timer = await db.one('SELECT TimerActive, TimerStartTime, TimerLength FROM Users WHERE UserID = $1', [userid]);
            res.json({timer: timer});
        } 
        else {
            // reset timer
            const resetTimer = db.none('UPDATE Users SET TimerStartTime = NULL, TimerActive = FALSE, SET TimerLength = NULL WHERE UserID = $1', [userid]);
            res.json({ message: "timer reset" })
        }
    } catch (error) {
        console.error('Error checking timer:', error);
        res.status(500).json({ error: 'Failed to check or reset timer.' });
    }
});

// app.post('/api/newtimer', async (req, res) => {
//     const { userid, timerlength} = req.body
//     try {
//         const setTimer = db.none('UPDATE Users SET TimerStartTime = NOW(), SET')
//     }
// });

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
