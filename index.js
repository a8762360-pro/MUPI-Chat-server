const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

// get router
const createUsersRouter = require('./routes/usersRouter');
// const departmentsRouter = require('./routes/departments');
// const registerRequestRouter = require('./routes/RegisterRequest')
// const ComputerSmsRouter = require('./routes/CSTinbox')
const createGroupRouter = require('./routes/allGroup')

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection URI & Client Creation
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-tnfghrx-shard-00-00.i4vs1nh.mongodb.net:27017,ac-tnfghrx-shard-00-01.i4vs1nh.mongodb.net:27017,ac-tnfghrx-shard-00-02.i4vs1nh.mongodb.net:27017/?ssl=true&replicaSet=atlas-pgcyip-shard-0&authSource=admin&appName=Cluster0`;
// console.log(process.env.DB_PASS)
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        await client.connect();
        const db = client.db("mupiChat");

        // database collection
        const usercollection = db.collection("users");
        // const departmentsCollection = db.collection("departments")
        // const registerRequestCollection = db.collection("registerRequest")
        // const computerSMSCollection = db.collection("CSTinbox");
        const allGroupCollection = db.collection("allGroups")



        // 
        // 
        app.use("/users", createUsersRouter(usercollection));
        // app.use("/departments", departmentsRouter(departmentsCollection));
        // app.use("/registerRequest", registerRequestRouter(registerRequestCollection));
        // app.use("/cstinbox", ComputerSmsRouter(computerSMSCollection));
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

// আগে ডাটাবেজ কানেক্ট হবে, তারপর সার্ভার লিসেন করবে
async function startServer() {
    await connectToMongoDB();
    app.listen(port, () => {
        console.log(`server is running on port ${port}`);
    });
}

startServer();

// CommonJS অনুযায়ী এক্সপোর্ট
module.exports = { connectToMongoDB, disconnectFromMongoDB };