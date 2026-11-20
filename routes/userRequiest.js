const express = require("express");
const { ObjectId } = require("mongodb");
const admin = require("firebase-admin");
const verifyFirebaseToken = require("../Middleeare/verifyFirebaseToken");

const userRequest = (userRequiestCollection,usercollection) => {
    const router = express.Router();

    // নতুন ইউজার রিকোয়েস্ট তৈরি করা (User তখনও তৈরি হবে না)
    router.post("/", async (req, res) => {
        try {
            const { email } = req.body;

            const existingUser = await usercollection.findOne({ email });
            if (existingUser) {
                return res.status(409).send({
                    success: false,
                    message: "এই email দিয়ে ইতিমধ্যে account আছে।",
                });
            }

            const existingRequest = await userRequiestCollection.findOne({ email });
            if (existingRequest) {
                return res.status(409).send({
                    success: false,
                    message: "এই email-এর request ইতিমধ্যে pending আছে।",
                });
            }

            const newRequest = {
                ...req.body,
                status: "pending",
                createdAt: new Date().toISOString(),
            };

            const result = await userRequiestCollection.insertOne(newRequest);
            res.status(201).send(result);
        } catch (error) {
            console.error("Error creating user request:", error);
            res.status(500).send({
                success: false,
                message: "User request failed",
            });
        }
    });

    // সব ইউজার রিকোয়েস্ট দেখা
    router.get("/", verifyFirebaseToken, async (req, res) => {
        try {
            const result = await userRequiestCollection.find().toArray();
            res.status(200).send(result);
        } catch (error) {
            console.error("Error fetching user requests:", error);
            res.status(500).send({
                success: false,
                message: "Failed to fetch user requests",
            });
        }
    });

    // ACCEPT Request: Firebase-এ user তৈরি + usersCollection-এ রাখা + request ডিলিট
    router.post("/approve/:id", verifyFirebaseToken, async (req, res) => {
        try {
            const id = req.params.id;
            console.log(id)
            if (!ObjectId.isValid(id)) {
                return res.status(400).send({ success: false, message: "Invalid request ID" });
            }

            const query = { _id: new ObjectId(id) };
            const userReq = await userRequiestCollection.findOne(query);

            if (!userReq) {
                return res.status(404).send({ success: false, message: "User request not found" });
            }

            const {
                name,
                email,
                password,
                role,
                idCard,
                imageName,
                department,
                semester,
            } = userReq;

            // Step 1: Firebase User তৈরি বা বিদ্যমান ইউজার খোঁজা
            let firebaseUser;
            try {
                firebaseUser = await admin.auth().createUser({
                    email,
                    password,
                    displayName: name,
                    photoURL: imageName || undefined,
                });
            } catch (authError) {
                if (authError.code === "auth/email-already-exists") {
                    firebaseUser = await admin.auth().getUserByEmail(email);
                } else {
                    throw authError;
                }
            }


            // Step 2: নতুন ইউজার অবজেক্ট তৈরি (password বাদ দিয়ে)
            const newUser = {
                name,
                email,
                role: role || "student",
                idCard,
                imageName: imageName || "",
                department,
                semester: role === "student" ? semester || "" : "",
                firebaseUid: firebaseUser.uid,
                status: "approved",
                createdAt: new Date().toISOString()           
            };

            // Step 3: usersCollection-এ সেভ এবং pending request ডিলিট করা
            await usercollection.insertOne(newUser);
            await userRequiestCollection.deleteOne(query);

            res.status(201).send({
                success: true,
                message: "User created in Firebase and approved successfully!",
                uid: firebaseUser.uid,
            });
        } catch (err) {
            console.error("Error approving user request:", err);
            res.status(500).send({
                success: false,
                message: "Error processing approval",
                error: err.message,
            });
        }
    });

    // REJECT Request: শুধু request কালেকশন থেকে ডিলিট হবে, user তৈরি হবে না
    router.delete("/reject/:id", verifyFirebaseToken, async (req, res) => {
        try {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).send({ success: false, message: "Invalid request ID" });
            }

            const query = { _id: new ObjectId(id) };
            const result = await userRequiestCollection.deleteOne(query);

            if (result.deletedCount === 0) {
                return res.status(404).send({ success: false, message: "Request not found" });
            }

            res.status(200).send(result);
        } catch (error) {
            console.error("Error rejecting user request:", error);
            res.status(500).send({
                success: false,
                message: "Failed to reject request",
                error: error.message,
            });
        }
    });

    return router;
};

module.exports = userRequest;