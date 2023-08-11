const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
-codesnippets can have multiple comments
-users can make multiple comments across different codesnippets
*/

let commentSchema = new Schema ({
    codeSnippet_id: {type: Schema.Types.ObjectId, required:true, ref: 'CodeSnippet'}, //comment location
    user_id: {type: Schema.Types.ObjectId, required:true , ref: 'User'}, //used_id of the commenter
    title: {type: String, default: '', required:true},
    content: {type: String, default: '', required:true}, //comment content
    vote_ids: [{type: Schema.Types.ObjectId, ref: 'Vote'}],
    //upvotes: {type: Number, default: 0},
    //downvotes: {type: Number, default: 0},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("comments", commentSchema);