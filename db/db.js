const { MongoClient } = require('mongodb');
require('dotenv').config();

const createUsersRouter = require('../routes/users');
const createGroupRouter = require('../routes/allGroup');
const createConversationRouter = require('../routes/conversations');
const createUserReuiestRouter = require('../routes/userRequiest')
const friendRequestRouter = require('../routes/friendRequest')

const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri);

async function connectToMongoDB(app) {
    try {
        await client.connect();
        const db = client.db("mupiChat");

        const usercollection = db.collection("users");
        const allGroupCollection = db.collection("allGroups");
        const conversationCollection = db.collection("conversations");
        const userRequiestCollection = db.collection("userRequiests");
        const friendRequestCollection = db.collection("friendRequests");


        app.use("/users", createUsersRouter(usercollection));
        app.use("/allGroups", createGroupRouter(allGroupCollection));
        app.use("/conversations", createConversationRouter(conversationCollection,friendRequestCollection));
        app.use("/userRequiest", createUserReuiestRouter(userRequiestCollection,usercollection));
        app.use("/friendRequest", friendRequestRouter(friendRequestCollection, conversationCollection))


        console.log("mongodb connected successfully");
        return client;
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
    }
}


module.exports = { connectToMongoDB };