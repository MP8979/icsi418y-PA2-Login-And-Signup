require("dotenv").config();
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

async function connectDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}
connectDatabase();


app.get("/", (req, res) => {
    res.json({
        message: "Server is running"
    });
});

const db = client.db("pa2");
const users = db.collection("users");

app.post("/signup", async (req, res) => {
    const {username, userPass, firstName, secondName} = req.body;
    if(!username || !userPass || !firstName || !secondName){
        return res.status(400).json({
            message: "Required information is missing"
        });
    }
    const result = await users.findOne({
        username: username
    });
    if(result){
        return res.status(409).json({
            message: "Username already exists"
        });
    } else {
        await users.insertOne({
            username: username,
            userPass: userPass
        });
        res.status(201).json({
            message: "User created successfully"
        });
    }

});

app.post("/login", async (req, res) => {
    const {username, userPass} = req.body;
    const userResult = await users.findOne({
        username: username
    });
    if(!userResult){
        return res.status(401).json({
            message: "Username or Password don't work."
        });
    } else {
        if(userResult.userPass != userPass){
            return res.status(401).json({
                message: "Username or Password don't work."
            });
        } else {
            return res.status(200).json({
                message: "Successfully logged in."
            });
        }
    }
    
});
app.listen(9000, () => {
    console.log("Server running on port 9000");
});
