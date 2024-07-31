const { MongoClient } = require('mongodb'); //this is third party library in order to connect to MongoDB server

const url = 'mongodb://localhost:27017';
const databaseName = 'blog';

let database; // we can't just export this and be used in other places
// even tho it already has the value of database because it might cause errors when establishing a connection fails
//therefore, a separate function is created to ensure everything works properly before using this to other places

async function connect() {
    try {
        const client = await MongoClient.connect(url); //we are establishing connection to MongoDB server
        database = client.db(databaseName); //we are accessing the database and store it in the database variable
    } catch (error) {
        console.error(`Database connection failed: ${error}`);
        throw new Error('Database connection failed!');
    }
 
}

function getDatabase() {
    if (!database) {
        throw {message: 'Database connection not established!' };
    }

    return database; // if everything's going well, return the database instance to whomever called this function
}

module.exports = {
    connectToDatabase: connect,
    getDb: getDatabase,
};
