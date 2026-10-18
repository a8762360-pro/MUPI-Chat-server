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

    // GET /groups/:name 
    router.get('/:name', async (req, res) => {
        try {
            const groupName = req.params.name;
            const result = await allgroup.findOne({ name: groupName });
            if (!result) {
                return res.status(404).send({ message: "The group is not found" });
            }
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // 🟢 POST /allGroups/:name/messages -> নাম অনুযায়ী নির্দিষ্ট গ্রুপে মেসেজ যোগ করা
    router.post('/:name/messages', async (req, res) => {
        try {
            const groupName = req.params.name;
            const newMessage = req.body; // ফ্রন্টএন্ড থেকে আসা মেসেজ অবজেক্ট
            // $push অপারেটর ব্যবহার করে messages এরেতে নতুন মেসেজ যুক্ত করা
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
            const rawGroupName = req.params.name;
            console.log(rawGroupName)

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

    })


    // add memner group
    // POST /allGroups/:name/members -> গ্রুপে নতুন মেম্বার যোগ করা
    router.post("/:name/members", async (req, res) => {
        try {
            const groupName = decodeURIComponent(req.params.name);
            const { newMember } = req.body; 
    
            if (!newMember) {
                return res.status(400).send({ message: "New member data is required" });
            }
    
            const filter = { name: groupName };
            // $addToSet ব্যবহার করায় একই মেম্বার বারবার যুক্ত হয়ে ডুপ্লিকেট হবে না
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

    // get member
    router.get("/:name/members", async (req, res) => {
        const name = req.params.name;
        const result = await allgroup.findOne({name: name})
        res.send(result.members)
    })


    return router;
};