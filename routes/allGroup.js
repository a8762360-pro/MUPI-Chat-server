const express = require('express');
const router = express.Router();

module.exports = (allgroup) => {
    // POST /groups
    router.post("/", async (req, res) => {
        try {
            const data = req.body;
            const result = await allgroup.insertOne(data);
            res.status(201).send(result);
        } catch (error) {
            res.status(500).send({ message: "Error inserting group", error });
        }
    });

    // GET /groups 
    router.get("/", async (req, res) => {
        try {
            const result = await allgroup.find().toArray();
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send({ message: "Error fetching groups", error });
        }
    });

    // 🟢 user/email রাউট সরাসরি হ্যান্ডেল করার জন্য
    router.get("/user/:email", async (req, res) => {
        try {
            const userEmail = req.params.email;

            // MongoDB-তে খোঁজ করা যে এই ইমেলটি কোন কোন গ্রুপের members অ্যারেতে আছে
            const groups = await allgroup.find({ "members.email": userEmail }).toArray();

            res.status(200).send(groups);
        } catch (error) {
            console.error("Failed to fetch user groups:", error);
            res.status(500).send({ message: "Internal server error" });
        }
    });

    
    //  ২. নির্দিষ্ট গ্রুপের মেম্বার লিস্ট আনা
    router.get("/:name/members", async (req, res) => {
        try {
            const name = decodeURIComponent(req.params.name);
            const result = await allgroup.findOne({ name: name });
            if (!result) {
                return res.status(404).send({ message: "Group not found" });
            }
            res.send(result.members);
        } catch (error) {
            res.status(500).send({ message: "Error fetching members", error });
        }
    });

    // 🟢 ৩. জেনেরিক নাম দিয়ে গ্রুপ খোঁজা (এটি সবসময় নির্দিষ্ট রাউটগুলোর নিচে থাকবে)
    router.get('/:name', async (req, res) => {
        try {
            const groupName = decodeURIComponent(req.params.name);
            const result = await allgroup.findOne({ name: groupName });
            if (!result) {
                return res.status(404).send({ message: "The group is not found" });
            }
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // POST /allGroups/:name/messages -> মেসেজ যোগ করা
    router.post('/:name/messages', async (req, res) => {
        try {
            const groupName = decodeURIComponent(req.params.name);
            const newMessage = req.body;
            const filter = { name: groupName };
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
    router.patch('/:name/photo', async (req, res) => {
        try {
            const rawGroupName = decodeURIComponent(req.params.name);
            const { photoUrl } = req.body;
            if (!photoUrl) {
                return res.status(400).send({ message: "photoUrl is required" });
            }

            const result = await allgroup.updateOne(
                { name: rawGroupName },
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

    // POST /allGroups/:name/members -> গ্রুপে নতুন মেম্বার যোগ করা
    router.post("/:name/members", async (req, res) => {
        try {
            const groupName = decodeURIComponent(req.params.name);
            const { newMember } = req.body;

            if (!newMember) {
                return res.status(400).send({ message: "New member data is required" });
            }

            const filter = { name: groupName };
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

    return router;
};