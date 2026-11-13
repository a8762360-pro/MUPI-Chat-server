const express = require('express');
const verifyFirebaseToken = require('../Middleeare/verifyFirebaseToken');

const createConversationRouter = (conversationCollection,usercollection) => {
    const router = express.Router();

    // POST: নতুন কনভার্সেশন বা চ্যাট রুম তৈরি করার জন্য
    router.post("/", verifyFirebaseToken, async (req, res) => {
        try {
            const data = req.body;

            // ডাবল চেক: এই chatId বা দুইজনের চ্যাট আগে থেকেই আছে কি না চেক করা ভালো
            const existingChat = await conversationCollection.findOne({ chatId: data.chatId });
            if (existingChat) {
                return res.status(200).send({ message: "Chat already exists", insertedId: existingChat._id, existing: true });
            }

            const result = await conversationCollection.insertOne(data);
            res.status(200).send(result);
        } catch (error) {
            console.error("Error creating conversation:", error);
            res.status(500).send({ message: "Internal server error" });
        }
    });

    // 2. নির্দিষ্ট ইউজারের সাথে জড়িত সমস্ত চ্যাট বা ইনবক্স লিস্ট ফেচ করা
    router.get("/:idCard", verifyFirebaseToken, async (req, res) => {
        try {
            const idCard = req.params.idCard;
            const result = await conversationCollection.find({ participants: idCard }).toArray();
            res.status(200).send(result);
        } catch (error) {
            console.error("Error fetching user conversations:", error);
            res.status(500).send({ message: "Internal server error" });
        }
    });


    // 2. নির্দিষ্ট ইউজারের সাথে জড়িত সমস্ত চ্যাট বা ইনবক্স লিস্ট ফেচ করা
    router.get("/:chatId", verifyFirebaseToken, async (req, res) => {
        try {
            const id = req.params.chatId;
            const result = await conversationCollection.findOne({chatId: id}).toArray()
            res.status(200).send(result);
        } catch (error) {
            console.error("Error fetching user conversations:", error);
            res.status(500).send({ message: "Internal server error" });
        }
    });

    // GET: নির্দিষ্ট কোনো চ্যাটের মেসেজগুলো ফেচ করার জন্য
    router.get("/user/:chatId", verifyFirebaseToken, async (req, res) => {
        try {
            const chatId = req.params.chatId;
            const chat = await conversationCollection.findOne({ chatId });
            res.status(200).send(chat || { messages: [] });
        } catch (error) {
            res.status(500).send({ message: "Error fetching messages" });
        }
    });

    // POST: নির্দিষ্ট চ্যাটে নতুন মেসেজ যুক্ত (Push) করার জন্য
    router.post("/:chatId/messages", verifyFirebaseToken, async (req, res) => {
        try {
            const chatId = req.params.chatId;
            const messageData = req.body; // { senderEmail, sms, timestamp, ... }

            const result = await conversationCollection.updateOne(
                { chatId: chatId },
                { $push: { messages: messageData } }
            );

            res.status(200).send(result);
        } catch (error) {
            res.status(500).send({ message: "Error sending message" });
        }
    });

    return router;
};

module.exports = createConversationRouter;