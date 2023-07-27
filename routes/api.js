const express = require("express");
const router = express.Router();

router.get('/', (req,res,next)=>{
    console.log("GET: /")
    res.status(200);
    res.render('index.pug',{email: email_, loggedin: loggedin_});
});

module.exports = router