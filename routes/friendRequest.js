const express = require('express');
const verifyFirebaseToken = require('../Middleeare/verifyFirebaseToken');

const friendRequest = (friendRequestCollection, conversationCollection) => {
    const router = express.Router();

    router.post("/", verifyFirebaseToken, async (req, res) => {
        try {
            const data = req.body;
            console.log(data);
            const result = await friendRequestCollection.insertOne(data);
            res.status(200).send({
                message: "your friendRequest is successfully",
                data: result
            })
        } catch (error) {
            res.status(500).send({
                message: "your friendRequest is failed",
            })
        }
    });

    router.get("/:id", verifyFirebaseToken, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await friendRequestCollection
                .find({ "participants.1": id })
                .toArray();

            res.status(200).send(result);
        } catch (error) {
            console.error("Error fetching friend requests:", error);
            res.status(500).send({ message: "Failed to fetch friend requests" });
        }
    });

    router.get("/me/:id", verifyFirebaseToken, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await friendRequestCollection
                .find({ "participants.0": id })
                .toArray();
            res.status(200).send(result);
        } catch (error) {
            console.error("Error fetching friend requests:", error);
            res.status(500).send({ message: "Failed to fetch friend requests" });
        }
    });

    router.delete("/:id", verifyFirebaseToken, async (req, res) => {
        try {
            const { id } = req.params;
            console.log(id)
            const result = await friendRequestCollection
                .deleteOne({ "participants.0": id })
            res.status(200).send(result);

        } catch (error) {
            console.error("Error fetching friend requests:", error);
            res.status(500).send({ message: "Failed to fetch friend delete" });
        }

    })



    return router;
}

module.exports = friendRequest;