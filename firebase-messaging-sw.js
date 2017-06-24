importScripts('./bower_components/firebase/firebase-app.js')
importScripts('./bower_components/firebase/firebase-messaging.js')

var config = {
    apiKey: "AIzaSyD_1N-jVH2y53ego7kzc_PlmGW0_LqavEc",
    authDomain: "hackathon-46ef4.firebaseapp.com",
    databaseURL: "https://hackathon-46ef4.firebaseio.com",
    projectId: "hackathon-46ef4",
    storageBucket: "hackathon-46ef4.appspot.com",
    messagingSenderId: "177551575442"
};
firebase.initializeApp(config)
const messaging = firebase.messaging()