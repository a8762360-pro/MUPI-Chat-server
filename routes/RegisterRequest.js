const express = require('express');
const router = express.Router();

module.exports = (registerRequest) => {
    router.post("/", async (req, res) => {
        try {
            const data = req.body;
            const result = await registerRequest.insertOne(data);
            res.status(201).send(result)
        } catch (error) {
            res.status(500).send({ message: "error" })
            console.log(error)
        }
    });

    // get 
    router.get("/", async (req, res) => {
        try {
            const result = await registerRequest.find().toArray();
            res.status(200).send(result)
        } catch (error) {
            console.log(error)
            res.status(500).send({ message: "Failed to fetch register requests", error: error.message });
        }
    })

    return router
}