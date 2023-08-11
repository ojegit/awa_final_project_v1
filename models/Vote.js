const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
-each user can have multiple votes
-if a vote is cancelled set to neutral without removing the user completely 
*/

let voteSchema = new Schema ({
    user_id: {type: Schema.Types.ObjectId, required:true, ref: 'User'},
    vote: {type: String, 
           enum: ['up','down'], 
           default: '',
           required:true},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("votes", voteSchema);