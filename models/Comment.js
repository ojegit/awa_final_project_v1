const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
-write the actual comment at 'content' field
*/

let commentSchema = new Schema ({
    user: {type: Schema.Types.ObjectId,  required:true , ref: 'User'},
    content: {type: String, default: '', required:true},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("comments", commentSchema);