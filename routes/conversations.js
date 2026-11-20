const express = require('express');
const verifyFirebaseToken = require('../Middleeare/verifyFirebaseToken');

const createConversationRouter = (conversationCollection, friendRequestCollection) => {
    const router = express.Router();

    // POST: নতুন কনভার্সেশন বা চ্যাট রুম তৈরি করার জন্য
    router.post("/", verifyFirebaseToken, async (req, res) => {
        try {
            const { chatId, participants, messages } = req.body;
    
            if (!chatId || !Array.isArray(participants) || participants.length < 2) {
                return res.status(400).send({
                    success: false,
                    message: "chatId এবং অন্তত দুজন participants প্রয়োজন।"
                });
            }
    
            // আগে থেকেই এই chatId বা participants দিয়ে conversation আছে কি না চেক
            const existingChat = await conversationCollection.findOne({
                $or: [
                    { chatId: chatId },
                    { participants: { $all: participants } }
                ]
            });
    
            if (existingChat) {
                // chat already থাকলে pending friend request থাকলে সেটাও পরিষ্কার করে রাখা ভালো
                if (friendRequestCollection) {
                    await friendRequestCollection.deleteOne({
                        participants: { $all: participants }
                    });
                }
    
                return res.status(200).send({
                    message: "Chat already exists",
                    chatId: existingChat.chatId,
                    insertedId: existingChat._id,
                    existing: true
                });
            }
    
            const newConvers = {
                chatId,
                participants,
                messages: Array.isArray(messages) ? messages : [],
                createdAt: new Date().toISOString()
            };
    
            // friendRequestCollection থেকে ওই দুইজনের request মুছে ফেলা
            if (friendRequestCollection) {
                await friendRequestCollection.deleteOne({
                    participants: { $all: participants }
                });
            }
    
            const result = await conversationCollection.insertOne(newConvers);
            res.status(201).send(result);
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

    // কনভার্সেশন থেকে নির্দিষ্ট মেসেজ ডিলিট করার রাউট
    router.delete('/:chatId/messages/:timestamp', verifyFirebaseToken, async (req, res) => {
        try {
            const chatId = decodeURIComponent(req.params.chatId);
            const timestamp = req.params.timestamp;
            const { sms } = req.query;
            console.log("jfa", chatId, timestamp)

            const filter = { chatId: chatId };
            const updateDoc = {
                $pull: {
                    messages: {
                        timestamp: timestamp
                    }
                }
            };

            const result = await conversationCollection.updateOne(filter, updateDoc);

            if (result.modifiedCount === 0) {
                return res.status(404).send({ message: "Message not found or already deleted" });
            }

            res.status(200).send({ message: "Message deleted successfully", result });
        } catch (error) {
            res.status(500).send({ message: "Failed to delete message", error: error.message });
        }
    });


    // 2. নির্দিষ্ট ইউজারের সাথে জড়িত সমস্ত চ্যাট বা ইনবক্স লিস্ট ফেচ করা
    router.get("/:chatId", verifyFirebaseToken, async (req, res) => {
        try {
            const id = req.params.chatId;
            const result = await conversationCollection.findOne({ chatId: id }).toArray()
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