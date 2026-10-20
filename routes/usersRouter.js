const express = require('express');
const verifyFirebaseToken = require('../Middleeare/verifyFirebaseToken');
const router = express.Router();

module.exports = (userscollection) => {

    // 1. POST /users 
    router.post('/', async (req, res) => {
        try {
            const newUser = req.body;
            if (!newUser.group) {
                newUser.group = [];
            }
            const result = await userscollection.insertOne(newUser);
            res.status(201).send(result);
        } catch (error) {
            res.status(500).send({ message: "Failed to create user", error: error.message });
        }
    });

    // 2. get users 
    router.get('/', verifyFirebaseToken, async (req, res) => {
        try {
            const result = await userscollection
                .find({}, {
                    projection: {
                        name: 1,
                        email: 1,
                        imageName: 1,
                    }
                })
                .toArray(); res.status(200).send(result);
        } catch (error) {
            res.status(500).send({ message: "Failed to fetch users", error: error.message });
        }
    });

    // 3. GET /users/:email 
    router.get('/:email', async (req, res) => {
        try {
            const email = req.params.email;
            const result = await userscollection.findOne({ email: email });

            if (!result) {
                return res.status(404).send({ message: "User not found" });
            }
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send({ message: "Error fetching user profile", error: error.message });
        }
    });

    // 4. PATCH /users/join-group 
    router.patch('/join-group', async (req, res) => {
        try {
            const { email, groupName } = req.body;

            if (!email || !groupName) {
                return res.status(400).send({ message: "Email and groupName are required" });
            }

            const result = await userscollection.updateOne(
                { email: email },
                {
                    $addToSet: {
                        group: { name: groupName }
                    }
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).send({ message: "User not found" });
            }

            res.status(200).send({
                message: "Successfully joined the group",
                result
            });
        } catch (error) {
            console.error("Error joining group:", error);
            res.status(500).send({ message: "Failed to join group", error: error.message });
        }
    });

    return router;
};