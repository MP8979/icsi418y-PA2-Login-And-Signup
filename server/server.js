require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
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
const projects = db.collection("projects");
const projectMemberships = db.collection("projectMemberships");

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

app.get("/users", async(req, res) => {
    try{
        const allUsers = await users.find({}).toArray();
        res.status(200).json(allUsers);
    } catch(error){
        res.status(500).json("Failed to gather users");
    }
});

app.get("/projects", async(req, res) => {
    try{
        const allProjects = await projects.find({}).toArray();
        res.status(200).json(allProjects);
    } catch(error){
        res.status(500).json("Failed to gather projects");
    }
});

app.get("/members", async(req, res) => {
    try{
        const allMembers = await projectMemberships.find({}).toArray();
        res.status(200).json(allMembers);
    } catch(error){
        res.status(500).json("Failed to gather members");
    }
});

app.post("/project", async (req, res) => {
    const {projectName, description, status, selectedLead} = req.body;
    if(!projectName || !description || !status || !selectedLead){
        return res.status(400).json({
            message: "Required information is not given."
        });
    } else {
        if(!ObjectId.isValid(selectedLead)){
            return res.status(401).json({
                message: "Selected an invalid leader (Wrong ID)."
            });
        }
        const leader = await users.findOne({
            _id: new ObjectId(selectedLead)
        });

        const projectRes = await projects.insertOne({
            projectName: projectName,
            description: description,
            status: status,
            selectedLead: leader.username
        });

        await projectMemberships.insertOne({
            project_id: projectRes.insertedId,
            user_id: leader._id
        });

        return res.status(201).json({
            message: "Project created successfully."
        });
    }
});

app.post("/addMember", async (req, res) => {
    const {selectedMember, projectId} = req.body;
    if(!selectedMember){
        return res.status(400).json({
            message: "Missing member selection."
        });
    }

    const memberObjectID = new ObjectId(selectedMember);
    const projObjectID = new ObjectId(projectId);

    const result = await projectMemberships.findOne({
        project_id: projObjectID,
        user_id: memberObjectID
    });
    if(result){
        return res.status(409).json({
            message: "Member is already in this project."
        });
    } else {
        await projectMemberships.insertOne({
            project_id: projObjectID,
            user_id: memberObjectID
        })
        res.status(201).json({
            message: "Member added successfully"
        });
    }
});

app.delete("/deleteMember", async (req, res) => {
    const {projectId, memberId} = req.body;
    try{
        const projObjectId = new ObjectId(projectId);
        const memObjectId = new ObjectId(memberId);
    
        const project = await projects.findOne({
            _id: projObjectId
        });

        const member = await users.findOne({
            _id: memObjectId
        })

        if(project.selectedLead === member.username){
            return res.status(403).json({
                message: "Cannot delete a leader of a team"
            })
        }

        await projectMemberships.deleteOne({
            project_id: projObjectId,
            user_id: memObjectId
        });
        return res.status(200).json({
            message: "Deleted member from team"
        });
    } catch(error) {
        return res.status(500).json({
            message: "Failed to delete member from team"
        });
    }
});

app.listen(9000, () => {
    console.log("Server running on port 9000");
});
