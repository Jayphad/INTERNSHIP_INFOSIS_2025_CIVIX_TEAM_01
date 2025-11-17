//1AtljLQIlhws2FRY    jayphad580_db_user
//mongodb+srv://jayphad580_db_user:1AtljLQIlhws2FRY@cluster0.awqanzh.mongodb.net/
//mongodb+srv://jayphad580_db_user:<db_password>@cluster0.awqanzh.mongodb.net/

//2nd try 
//3QRl3ePguB4yOrxI  jayphad580_db_user

const mongoose = require('mongoose');
const mongo_url = process.env.MONGO_CONN;
mongoose.connect(mongo_url)
.then(() => {
    console.log("Connected to MongoDB"); 
}).catch((err) => {
    console.log("MongoDB connecting Error", err);
});