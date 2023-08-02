var admin = require("firebase-admin");
var serviceAccount = require("../school-d93ee-firebase-adminsdk-xr16u-7949671ef9.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const sendNotificationToDevice = async (token, title, body, data) => {
    const message = {
        notification: {
            title: title,
            body: body
        },
        data: data,
        token: token
    }
    const response = await admin.messaging().send(message);
    console.log(response);
}

module.exports = {
    sendNotificationToDevice
}