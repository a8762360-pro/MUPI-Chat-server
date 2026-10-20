const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

// get router
const createUsersRouter = require('./routes/usersRouter');
const createGroupRouter = require('./routes/allGroup')

const app = express();
const port = process.env.PORT || 3000;



/// fire base admin connect 
const admin = require("firebase-admin");
const serviceAccount = require("./admin.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});



// middleware
app.use(cors())
app.use(express.json())




// MongoDB Connection URI & Client Creation
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-tnfghrx-shard-00-00.i4vs1nh.mongodb.net:27017,ac-tnfghrx-shard-00-01.i4vs1nh.mongodb.net:27017,ac-tnfghrx-shard-00-02.i4vs1nh.mongodb.net:27017/?ssl=true&replicaSet=atlas-pgcyip-shard-0&authSource=admin&appName=Cluster0`;
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        await client.connect();
        const db = client.db("mupiChat");

        // database collection
        const usercollection = db.collection("users");
        const allGroupCollection = db.collection("allGroups")


        // all users
        app.use("/users", createUsersRouter(usercollection));
        // all group
        app.use("/allGroups", createGroupRouter(allGroupCollection, usercollection))


        console.log("mongodb connected successfully");
        return client;
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
    }
}

// Disconnect from MongoDB
async function disconnectFromMongoDB() {
    await client.close();
}

app.get('/', (req, res) => {
    res.send('running my server');
});

async function startServer() {
    await connectToMongoDB();
    app.listen(port, () => {
        console.log(`server is running on port ${port}`);
    });
}

startServer();

// module.exports = { connectToMongoDB, disconnectFromMongoDB, verifyFirebaseToken };