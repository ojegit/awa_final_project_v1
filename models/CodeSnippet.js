const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let codesSchema = new Schema ({
    user_id: {type: Schema.Types.ObjectId, required:true, ref: 'User'},
	comment_id: {type: Schema.Types.ObjectId, required:true, ref: 'Comment'},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("codes", codesSchema);