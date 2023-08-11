const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
-write the actual code at 'content' field
-each user_id can have multiple comments (don't put unique:true for user_id)
-each code can have multiple comments
*/

let codesSchema = new Schema ({
    user_id: {type: Schema.Types.ObjectId, required:true, ref: 'User'},
    title: {type: String, default: '', required:true},
    content: {type: String, default: '', required:true},
    vote_ids: [{type: Schema.Types.ObjectId, ref: 'Vote'}],
    highlightjs: {type: String, default: ''}, //empty string = autodetect language
    //upvotes: {type: Number, default: 0},
    //downvotes: {type: Number, default: 0},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("codes", codesSchema);