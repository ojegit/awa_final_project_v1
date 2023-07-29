const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
-write the actual code at 'content' field
-each code can have multiple comments
*/

let codesSchema = new Schema ({
    user_id: {type: Schema.Types.ObjectId, required:true, ref: 'User'},
	comment_id: [{type: Schema.Types.ObjectId, required:true, ref: 'Comment'}],
    title: {type: String, required:true},
    content: {type: String, required:true},
    positiveVotes: {type: Number},
    negativeVotes: {type: Number},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("codes", codesSchema);