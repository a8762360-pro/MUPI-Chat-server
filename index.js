const express = require('express');
const cors = require('cors');
require('dotenv').config();
// const { connectToMongoDB } = require('./db/db'); 

const app = express();
const port = process.env.PORT || 3000;


const admin = require("firebase-admin");
const serviceAccount = require("./admin.json");
const { connectToMongoDB } = require('./db/db');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('running my server');
});

async function startServer() {
    await connectToMongoDB(app); // এখানে app পাস করে দেওয়া হলো যাতে রাউটগুলো রেজিস্টার হতে পারে
    app.listen(port, () => {
        console.log(`server is running on port ${port}`);
    });
}

startServer();
