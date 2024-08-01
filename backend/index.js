require('dotenv').config();

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

const User = require("./models/user.model");
const Task = require("./models/task.model");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the API" });
});

// Create Account
app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const isUser = await User.findOne({ email });

    if (isUser) {
        return res.status(400).json({ error: true, message: "Employee already exists" });
    }

    const user = new User({ fullName, email, password });
    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30s" });

    res.json({ error: false, user, accessToken, message: "Registration Successful" });
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const userInfo = await User.findOne({ email });

    if (!userInfo || userInfo.password !== password) {
        return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "36000s" });

    res.json({ error: false, message: "Login Successful", email, accessToken });
});

// Get Employee
app.get("/employee", authenticateToken, async (req, res) => {
    const { user } = req.user;
    const isUser = await User.findById(user._id);

    if (!isUser) {
        return res.status(400).json({ message: "Employee not found" });
    }

    res.json({ user: { fullName: isUser.fullName, email: isUser.email, _id: isUser._id, createdOn: isUser.createdOn }, message: "" });
});

// Add Task
app.post("/add-task", authenticateToken, async (req, res) => {
    const { title, companyName, companyNumber, content, tags } = req.body;
    const { user } = req.user;

    if (!title || !content) {
        return res.status(400).json({ error: true, message: "Title and content are required" });
    }

    try {
        const task = new Task({ title,companyName, companyNumber, content, tags: tags || [], userId: user._id });
        await task.save();
        res.json({ error: false, task, message: "Intervention added successfully" });
    } catch (error) {
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Edit Task
app.put("/edit-task/:taskId", authenticateToken, async (req, res) => {
    const taskId = req.params.taskId;
    const { title, companyName, companyNumber, content, tags, isPinned } = req.body;
    const { user } = req.user;

    if (!title && !companyName && !companyNumber && !content && !tags) {
        return res.status(400).json({ error: true, message: "At least one field is required" });
    }

    try {
        const task = await Task.findOne({ _id: taskId, userId: user._id });

        if (!task) {
            return res.status(404).json({ message: "Intervention not found" });
        }

        if (title) task.title = title;
        if (companyName) task.companyName = companyName;
        if (companyNumber) task.companyNumber = companyNumber;
        if (content) task.content = content;
        if (tags) task.tags = tags;
        if (isPinned !== undefined) task.isPinned = isPinned;

        await task.save();
        res.json({ error: false, task, message: "Intervention updated successfully" });
    } catch (error) {
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Get all Tasks
app.get("/get-all-tasks", authenticateToken, async (req, res) => {
    const { user } = req.user;

    try {
        const tasks = await Task.find({ userId: user._id }).sort({ isPinned: -1 });
        res.json({ error: false, tasks, message: "All Interventions retrieved successfully" });
    } catch (error) {
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Delete a Task
app.delete("/delete-task/:taskId", authenticateToken, async (req, res) => {
    const taskId = req.params.taskId;
    const { user } = req.user;

    try {
        const task = await Task.findOne({ _id: taskId, userId: user._id });

        if (!task) {
            return res.status(404).json({ error: true, message: 'Task not found' });
        }

        await Task.deleteOne({ _id: taskId, userId: user._id });
        res.json({ error: false, message: "Intervention deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Update a Pinned Task
app.put("/update-task-pinned/:taskId", authenticateToken, async (req, res) => {
    const taskId = req.params.taskId;
    const { isPinned } = req.body;
    const { user } = req.user;

    try {
        const task = await Task.findOne({ _id: taskId, userId: user._id });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        task.isPinned = isPinned;
        await task.save();
        res.json({ error: false, task, message: "Intervention updated successfully" });
    } catch (error) {
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Search Tasks
app.get("/search-tasks", authenticateToken, async (req, res) => {
    const { user } = req.user;
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: true, message: "Search Query is required" });
    }

    try {
        const matchingTasks = await Task.find({
            userId: user._id,
            $or: [
                { title: { $regex: new RegExp(query, 'i') } },
                { content: { $regex: new RegExp(query, 'i') } },
            ],
        });
        res.json({ error: false, tasks: matchingTasks, message: "Intervention matching the search query retrieved successfully" });
    } catch (error) {
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

// Start the server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please use a different port.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
});

module.exports = app;
