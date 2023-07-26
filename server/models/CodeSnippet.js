const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let codesSchema = new Schema ({
    user: {type: Schema.Types.ObjectId, required:true},

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("codes", codesSchema);