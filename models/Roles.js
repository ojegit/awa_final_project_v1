const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let roleSchema = new Schema ({
    user: Schema.Types.ObjectId,
    name: String,
    enum: ['admin', 'user']

});

module.exports = mongoose.model("roles", rolesSchema);