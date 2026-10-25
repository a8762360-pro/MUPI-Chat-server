const express = require('express');
const { ObjectId } = require('mongodb');
const verifyFirebaseToken = require('../Middleeare/verifyFirebaseToken');
const router = express.Router();

module.exports = (allgroup) => {
    // POST /groups
    router.post("/", verifyFirebaseToken, async (req, res) => {
        try {
            const data = req.body;
            const result = await allgroup.insertOne(data);
            res.status(201).send(result);
        } catch (error) {
            res.status(500).send({ message: "Error inserting group", error });
        }
    });

    // GET /groups 
    router.get("/", verifyFirebaseToken, async (req, res) => {
        try {
            const result = await allgroup.find().toArray();
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send({ message: "Error fetching groups", error });
        }
    });

    //  check the user connects groups
    router.get("/user/:email", verifyFirebaseToken, async (req, res) => {
        try {
            const userEmail = req.params.email;

            const groups = await allgroup.find({ "members.email": userEmail }).toArray();

            res.status(200).send(groups);
        } catch (error) {
            console.error("Failed to fetch user groups:", error);
            res.status(500).send({ message: "Internal server error" });
        }
    });


    //  get a groupe members list
    router.get("/:groupId/members", verifyFirebaseToken, async (req, res) => {
        try {
            const id = decodeURIComponent(req.params.groupId);
            const result = await allgroup.findOne({ groupId: id });
            if (!result) {
                return res.status(404).send({ message: "Group not found" });
            }
            res.send(result.members);
        } catch (error) {
            res.status(500).send({ message: "Error fetching members", error });
        }
    });


    // PATCH /allGroups/:name/bg-image -
    router.patch('/:groupId/bgImage', verifyFirebaseToken, async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const { bgImage } = req.body;

            const result = await allgroup.updateOne(
                { groupId: groupId },
                { $set: { themeImage: bgImage } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).send({ message: "Group not found" });
            }

            res.status(200).send({ message: "Theme image updated successfully", result });
        } catch (error) {
            res.status(500).send({ message: "Failed to update theme image", error: error.message });
        }
    });

    //  get group the id
    router.get('/:groupId', verifyFirebaseToken, async (req, res) => {
        try {
            const id = req.params.groupId;
            const result = await allgroup.findOne({ groupId: id });
            if (!result) {
                return res.status(404).send({ message: "The group is not found" });
            }
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // add image a group
    router.post('/:groupId/messages', verifyFirebaseToken, async (req, res) => {
        try {
            const id = decodeURIComponent(req.params.groupId);
            const newMessage = req.body;
            const filter = { groupId: id };
            const updateDoc = {
                $push: {
                    messages: newMessage
                }
            };
            const result = await allgroup.updateOne(filter, updateDoc);
            if (result.matchedCount === 0) {
                return res.status(404).send({ message: "Group not found to add message" });
            }
            res.status(200).send({ message: "Message added successfully", result });
        } catch (error) {
            res.status(500).send({ message: "Failed to send message", error: error.message });
        }
    });

    // update groupe photo
    router.patch('/:groupId/photo', verifyFirebaseToken, async (req, res) => {
        try {
            const id = decodeURIComponent(req.params.groupId);
            const { photoUrl } = req.body;
            if (!photoUrl) {
                return res.status(400).send({ message: "photoUrl is required" });
            }

            const result = await allgroup.updateOne(
                { groupId: id },
                {
                    $set: {
                        photo: photoUrl,
                        imageName: photoUrl
                    }
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).send({ message: "Group not found" });
            }

            res.status(200).send({
                message: "Group photo updated successfully",
                result
            });
        } catch (error) {
            console.error("Failed to update group photo:", error);
            res.status(500).send({
                message: "Failed to update group photo",
                error: error.message
            });
        }
    });

    // POST /allGroups/:name/members 
    router.post("/:groupId/members", verifyFirebaseToken, async (req, res) => {
        try {
            const id = decodeURIComponent(req.params.groupId);
            const { newMember } = req.body;
            if (!newMember) {
                return res.status(400).send({ message: "New member data is required" });
            }
            const filter = { groupId: id };
            const updateDoc = {
                $addToSet: {
                    members: newMember
                }
            };

            const result = await allgroup.updateOne(filter, updateDoc);
            if (result.matchedCount === 0) {
                return res.status(404).send({ message: "Group not found to add member" });
            }

            res.status(200).send({ message: "Member added successfully", result });

        } catch (error) {
            console.error("Failed to add member:", error);
            res.status(500).send({
                message: "Failed to add member",
                error: error.message
            });
        }
    });

    // Remove member from group (Admin only)
    router.delete('/:groupId/members/:email', verifyFirebaseToken, async (req, res) => {
        try {
            const groupId = decodeURIComponent(req.params.groupId);
            const memberEmail = req.params.email;
            console.log(groupId, memberEmail)

            const result = await allgroup.updateOne(
                { groupId: groupId }, // অথবা আপনার আইডি ফিল্ড অনুযায়ী _id হলে ObjectId ব্যবহার করবেন
                { $pull: { members: { email: memberEmail } } }
            );

            res.send(result);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    return router;
};