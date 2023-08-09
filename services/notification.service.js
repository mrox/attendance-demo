var admin = require("firebase-admin");
var serviceAccount = require("../school-d93ee-firebase-adminsdk-xr16u-7949671ef9.json");
const { classList } = require("./teacher.service");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const sendNotificationToTopic = async (topic, title, body, data, url) => {
    if(topic == "" || !topic) return;
    // if(!classList.includes(topic)) return;
    try {

        const messagePayload = {
            notification: {
                title: title,
                body: body,
       
            },
        }
        const messageOptions = {
            priority: 'high',
            timeToLive: 60 * 60 * 24
        }
        console.log("------------ Send noti to topic: ", topic );
        const response = await admin.messaging().sendToTopic(topic, messagePayload, messageOptions);
        return response
    } catch (error) {
        console.log('Error sending message to topic:', topic);
        console.log(error);
    }
}

const addTokenToTopic = async (token, topic) => {
    try {
        const response = await admin.messaging().subscribeToTopic(token, topic);
        console.log(response);
        return response
    } catch (error) {
        
        console.log(error);
    }
}

const removeTokenFromTopic = async (token, topic) => {
    try {
        const response = await admin.messaging().unsubscribeFromTopic(token, topic);
        console.log(response);
        return response
    } catch (error) {
        console.log(error);
    }
}


const sendNotificationToDevice = async (token, title, body, data, url) => {
    console.log("sendNotificationToDevice");
    // const message = {
    //     notification: {
    //         title: title,
    //         body: body,
    //         // sound: 'default',
    //     },
    //     // data: data,
    //     token: token
    // }
    // if(url) message.webpush = {
    //     fcmOptions: {
    //         link: url
    //     }
    // }
    // try {
        
    //     const response = await admin.messaging().send(message);
    //     console.log(response);
    //     return response
    // } catch (error) {
    //     console.log('Error sending message:', message);
    //     console.log(error);
    // }
}
module.exports = {
    sendNotificationToDevice,
    sendNotificationToTopic,
    addTokenToTopic,
    removeTokenFromTopic
}