const mongoose = require("mongoose");
const Schema = mongoose.Schema;
/*
https://stackoverflow.com/questions/9024176/mongoose-duplicates-with-the-schema-key-unique
https://stackoverflow.com/questions/39746718/mongodb-node-js-role-based-access-control-rbac?rq=4

This setup guarantees that each role is unique. 
If attempting to add another role with the same name it's not possible. 
Since names need to be chosen from the enum, therefore this DB can hold only three entries at a time.
*/

let rolesSchema = new Schema ({
    name: {type: String,
           enum: ['basic', 'supervisor','admin'], 
           unique: true,
           required: true},
    access: {type: Number, 
             enum: [1,2,3], 
             required: true},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("roles", rolesSchema);