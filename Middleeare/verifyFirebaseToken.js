// middleware/verifyFirebaseToken.js
const admin = require("firebase-admin");

const verifyFirebaseToken = async (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ message: 'Unauthorized access: No token provided' });
    }
    const token = authorization.split(' ')[ 1 ];
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized access: Invalid token format' });
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.patient_email = decodedToken.email;
        next();
    } catch (error) {
        console.error('Invalid Token:', error);
        return res.status(401).send({ message: "Unauthorized access: Invalid token" });
    }
};

module.exports = verifyFirebaseToken;