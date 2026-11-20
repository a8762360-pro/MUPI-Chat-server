const express = require('express');
const verifyFirebaseToken = require('../Middleeare/verifyFirebaseToken');
const router = express.Router();
const bcrypt = require('bcrypt');
const userRequest = require('./userRequiest');

module.exports = (userscollection) => {

    // 1. POST /users 
    router.post('/', async (req, res) => {
        try {
            const userFullData = req.body;

            if (userFullData.password) {
                const hashedPassword = await bcrypt.hash(userFullData.password, 10);
                userFullData.password = hashedPassword;
            }

            const result = await userscollection.insertOne(userFullData);
            res.status(201).send(result);
        } catch (error) {
            console.error("Error creating user:", error);
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
                        idCard: 1
                    }
                })
                .toArray()
                ; res.status(200).send(result);
        } catch (error) {
            res.status(500).send({ message: "Failed to fetch users", error: error.message });
        }
    });

    // // 4. PATCH /users/join-group 
    // router.patch('/join-group', verifyFirebaseToken, async (req, res) => {
    //     try {
    //         const { email, groupName, groupID } = req.body;
    //         console.log(email, groupID, groupName)

    //         if (!email || !groupName) {
    //             return res.status(400).send({ message: "Email and groupName are required" });
    //         }

    //         const result = await userscollection.updateOne(
    //             { email: email },
    //             {
    //                 $addToSet: {
    //                     groups: { name: groupName, groupId: groupID }
    //                 }
    //             }
    //         );

    //         if (result.matchedCount === 0) {
    //             return res.status(404).send({ message: "User not found" });
    //         }

    //         res.status(200).send({
    //             message: "Successfully joined the group",
    //             result
    //         });
    //     } catch (error) {
    //         console.error("Error joining group:", error);
    //         res.status(500).send({ message: "Failed to join group", error: error.message });
    //     }
    // });

    // // 4. GET /users/:email 
    router.get('/:email', verifyFirebaseToken, async (req, res) => {
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


    // get user from idcard idCard
    router.get('/friend/:idCard', verifyFirebaseToken, async (req, res) => {
        try {
            const idCard = req.params.idCard;
            console.log(idCard)
            const result = await userscollection.findOne({ idCard: idCard });

            if (!result) {
                return res.status(404).send({ message: "User not found" });
            }
            res.status(200).send(result);
            // console.log("get friend data")
        } catch (error) {
            res.status(500).send({ message: "Error fetching user profile", error: error.message });
        }
    });


    return router;
};

