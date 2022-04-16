const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    desc: {
        type: String,
        trim: true,
        required: [true, "Enter a Description"],
    },
    completed: {
        default: false,
        type: Boolean,
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
}, {
    timestamps: true,
});

taskSchema.pre("save", async function(next) {
    const task = this;
    console.log("Middleware of tasks triggered");
    return next();
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;