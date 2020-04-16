import 'firebase/firestore'
import Firebase from 'firebase'

// firebase init goes here
const config = {
    apiKey: "AIzaSyApAWOwV3BKHA6QKbaypWrv2qXAgo5Gypo",
    authDomain: "myawsomeproject-21913.firebaseapp.com",
    databaseURL: "https://myawsomeproject-21913.firebaseio.com",
    projectId: "myawsomeproject-21913",
    storageBucket: "myawsomeproject-21913.appspot.com",
    messagingSenderId: "137661802318",
    appId: "1:137661802318:web:2b9b17fa46601fe8b2201f"
};
let app = Firebase.initializeApp(config)
let db = app.database()
let citiesRef = db.ref('cities');
export const fbObj = { citiesRef, Firebase };
// firebase.initializeApp(config)

// firebase utils
// const db = firebase.firestore()
// const auth = firebase.auth()
// console.log('******* firebase auth*****', auth);
// const currentUser = auth.currentUser

// // date issue fix according to firebase
// const settings = {
//     timestampsInSnapshots: true
// }
// db.settings(settings)

// // firebase collections
// const postsCollection = db.collection('posts')

// export default {
//     db,
//     auth,
//     postsCollection,
// }