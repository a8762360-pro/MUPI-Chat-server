const express = require('express');
const router = express.Router();

module.exports = (departments) => {

    // POST /departments
    router.post('/', async (req, res) => {
        try {
            const data = req.body;
            const result = await departments.insertMany(data);
            res.status(201).send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    });

    // GET /departments
    router.get('/', async (req, res) => {
        try {
            const result = await departments.find().toArray();
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    return router;
};