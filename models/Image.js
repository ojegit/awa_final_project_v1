/*
HUOM! Koodi perustuu vuoden 2022 AWA kurssille palauttamaani viikon 5 harjoitukseen
*/
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let schema = new Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    encoding: String,
    mimetype: String,
    buffer: Buffer
});

module.exports = mongoose.model("images", schema);