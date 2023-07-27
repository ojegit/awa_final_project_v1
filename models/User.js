const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema ({
    firstName: {type: String, default: '', required:true},
    lastName:  {type: String, default: '', required:true},
    password: {type: String, default: '', required:true},
    email: {type: String, default: '', required:true},
    avatar: {type: Schema.Types.ObjectId, default: '', ref: 'Images'},
    permission: [
        {
            type: {}
        }
    ],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("users", userSchema);