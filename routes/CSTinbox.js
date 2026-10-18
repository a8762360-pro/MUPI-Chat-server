const express = require('express');
const router = express.Router();

module.exports = (cstGroupe) => {

    router.post("/", async (req, res) => {
        try {
            const data = req.body;
            const result = await cstGroupe.insertOne(data);
            res.status(201).send(result);
        } catch (error) {
            res.status(500).send({ "message": "error", error });
        }
    })

    router.get("/", async (req, res) => {
        try {
            const result = await cstGroupe.find().toArray();
            res.status(200).send(result);
        } catch (error) {
            console.error("CST Fetch Error:", error);
            res.status(500).send({ message: "Failed to fetch messages", error: error.message });
        }

    })

    return router;
}