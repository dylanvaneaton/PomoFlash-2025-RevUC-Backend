-- Table: Users
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    UserFirst VARCHAR(25),
    UserLogin VARCHAR(25),
    TimerActive BOOLEAN,
    TimerStartTime TIMESTAMP,
    TimerLength INTERVAL,
    CurrentTaskID INT
);

-- Table: TimerConfigurations
CREATE TABLE TimerConfigurations (
    TCID SERIAL PRIMARY KEY,
    UserID INT REFERENCES Users(UserID),
    Name VARCHAR(100)
);

-- Table: NodeType
CREATE TABLE NodeType (
    NodeTypeID SERIAL PRIMARY KEY,
    NodeTypeName VARCHAR(25)
);

-- Table: TCItem
CREATE TABLE TCItem (
    TCID INT REFERENCES TimerConfigurations(TCID),
    TCItemID SERIAL PRIMARY KEY,
    NodeTypeID INT REFERENCES NodeType(NodeTypeID),
    Duration INTERVAL
);

-- Table: Tasks
CREATE TABLE Tasks (
    TaskID SERIAL PRIMARY KEY,
    UserID INT REFERENCES Users(UserID),
    TaskName VARCHAR(100),
    TaskDescription VARCHAR(100),
    TaskCompletion BOOLEAN
);

-- Table: CardDecks
CREATE TABLE CardDecks (
    CardDeckID SERIAL PRIMARY KEY,
    UserID INT REFERENCES Users(UserID),
    DeckName VARCHAR(100),
    DeckDescription VARCHAR(255)
);

-- Table: QuestionTypes
CREATE TABLE QuestionTypes (
    QuestionTypeID SERIAL PRIMARY KEY,
    QuestionTypeName VARCHAR(25)
);

-- Table: DeckQuestions
CREATE TABLE DeckQuestions (
    DeckQuestionID SERIAL PRIMARY KEY,
    CardDeckID INT REFERENCES CardDecks(CardDeckID),
    Question VARCHAR(255),
    QuestionTypeID INT REFERENCES QuestionTypes(QuestionTypeID)
);

-- Table: DeckAnswers
CREATE TABLE DeckAnswers (
    DeckAnswerID SERIAL PRIMARY KEY,
    DeckQuestionID INT REFERENCES DeckQuestions(DeckQuestionID),
    Answer VARCHAR(255)
);

