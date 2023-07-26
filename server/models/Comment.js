const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let commentSchema = new Schema ({
    user: Schema.Types.ObjectId,
    firstName: {type: String, default: '', required:true},

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("comments", commentSchema);