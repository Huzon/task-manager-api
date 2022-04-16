const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

//creating post request for create
router.post("/tasks", auth, async(req, res) => {
    // const task = Task(req.body);
    const task = Task({
        ...req.body,
        owner: req.user._id,
    });
    try {
        const _task = await task.save();
        res.send(201, _task);
    } catch (error) {
        res.send(400, error);
    }
});

// reading data Get requests
//GET:/tasks?completed=true
//GET:/tasks?limit=10&skip=10
//GET:/tasks?sortBy=createdAt_asc
router.get("/tasks", auth, async(req, res) => {
    try {
        // const tasks = await Task.find({ owner: req.user._id });
        const match = {};
        if (req.query.completed) {
            match.completed = req.query.completed === "true";
        }
        const sort = {};
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split("_");
            sort[parts[0]] = parts[1] === "asc" ? 1 : -1;
        }
        req.query.completed === "true";
        await req.user.populate({
            path: "tasks",
            match,
            options: {
                limit: parseInt(req.query.limit), //limits how many res show
                skip: parseInt(req.query.page) * 2, //skips the number of results
                sort,
                // sort: {
                //     //ascending=1, descending = -1
                //     completed: 1,
                // },
            },
        });
        res.status(200).send(req.user.tasks);
    } catch (error) {
        res.status(500).send("Error fetching the tasks", error);
    }
});

router.get("/tasks/:id", auth, async(req, res) => {
    try {
        const _id = req.params.id;
        const task = await Task.findOne({
            _id,
            owner: req.user._id,
        });
        if (!task) {
            return res.status(400).send("No task found");
        }
        res.send(400, task);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.patch("/tasks/:id", auth, async(req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["desc", "completed"];
    const canUpdate = updates.every((update) => allowedUpdates.includes(update));

    if (!canUpdate) {
        return res.status(404).send("Invalid Update");
    }

    const _id = req.params.id;
    const body = req.body;

    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) {
            return res.status(400).send("No task found");
        }
        updates.forEach((update) => {
            task[update] = body[update];
        });
        task.save();
        console.log(task);

        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete("/tasks/:id", auth, async(req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
        if (!task) {
            return res.status(400).send("Task not found");
        }
        res.status(200).send(task);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;