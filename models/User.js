const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
-first name, last name, nick name, email and password are to be verified before adding them in the DB
-avatar holds an image uploaded by the user. only one is allowed per user (refer to T5)
-user role is mandatory as it is used to determine what kind of level of access is granted. id of Role table is stored here, not
 the actual role
*/


let userSchema = new Schema ({
    firstName: {type: String, default: '', required:true},
    lastName:  {type: String, default: '', required:true},
    nickName:  {type: String, default: '', required:true},
    password: {type: String, default: '', required:true},
    email: {type: String, default: '', required:true},
    role_id: {type: Schema.Types.ObjectId, default: '', required:true, ref: 'Role'},
    accessToken: {type: String, default: ''},
    avatar: {
        name: String,
        encoding: String,
        mimetype: String,
        buffer: Buffer,
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now }
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("users", userSchema);