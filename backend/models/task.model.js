const mongoose = require('mongoose');

const Schema  = mongoose.Schema;


const TaskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    companyName : {type: String, required: true},
    companyNumber : {type: String, required: true},
    content: { type: String, required: true },
    tags: {
        type: [String],
        default: []
    },
    isPinned: {
        type: Boolean,
        default: false,
    },
    userId: { type: String, required: true},
    createdOn: { type: Date, default : new Date().getTime() },
});

module.exports = mongoose.model("Task", TaskSchema);