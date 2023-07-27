const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const {body,validationResult} = require("express-validator");
const User = require("../models/User");


//main landing page
router.get('/', (req,res,next)=>{
    console.log("GET: /")
    res.status(200);
    res.render('main_index.pug',{});
});
//

//search
router.post('/search/:id', (req,res,next)=>{
    var id = req.params.id;
    console.log("POST: /search/"+íd);
    res.status(200);
});
//


//login
router.get('/login', (req,res,next)=>{
    console.log("GET: /login")
    res.status(200);
    res.render('login.pug',{});
});

router.post('/login', (req,res,next)=>{
    console.log("POST: /login")
    res.status(200);
});
//

//register
/*

*/
router.get('/register', (req,res,next)=>{
    console.log("GET: /register")
    res.status(200);
    res.render('register.pug',{});
});

router.post('/register',
  //validate email
  body("email") 
  .isLength({min: 3})
  .isEmail()
  .escape(),

   //validate password
  body("password")
  .isLength({min: 8})
  .not().isLowercase()
  .not().isUppercase()
  .not().isNumeric()
  .not().isAlpha()
  .withMessage("Password is not strong enough"),
  (req, res, next) => {
    console.log("POST: /register");

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      //return res.status(400).json({errors: errors.array()});
      return res.status(400).send(JSON.stringify(errors));
    }
    User.findOne({email: req.body.email}, (err, user) => {
      if(err) {
        console.log(err);
        throw err
      };
      if(user){
        //user already in use
        return res.status(403).json({message: "Email already in use"});
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if(err) throw err;
            User.create(
              {
                email: req.body.email,
                password: hash
              },
              (err, ok) => {
                if(err) throw err;
                return res.redirect("/login");
                //res.status(200).send("ok");
              }
            );
          });
        });
      }
    });


    //
    res.status(200);
});
//


//user
//landing page
router.get('/user/:id/', (req,res,next)=>{
    var id = req.params.id;
    console.log("GET: /user/"+id);
    res.status(200);
    res.render('user_index.pug',{});
});

//add new code block
router.get('/user/:id/add_codeblock', (req,res,next)=>{
    var id = req.params.id;
    console.log("GET: /user/"+id+"/add_codeblock");
    res.status(200);
    res.render('user_add_codeblock.pug',{});
});

//add new code block
router.get('/user/:id/list_codeblocks', (req,res,next)=>{
    var id = req.params.id;
    console.log("GET: /user/"+id+"/list_codeblocks");
    res.status(200);
    res.render('user_list_codeblocks.pug',{});
});

//delete user
router.delete('/user/:id', (req,res,next)=>{
    var id = req.params.id;
    console.log("DELETE: /user/"+id);
    res.status(200);
});
//

//admin page
//landing page
router.get('/admin/', (req,res,next)=>{
    console.log("GET: /admin")
    res.status(200);
    res.render('admin_index.pug',{});
});

//info
router.get('/admin/info', (req,res,next)=>{
    console.log("GET: /admin/info")
    res.status(200);
    res.render('admin_info.pug',{});
});

//statistics
router.get('/admin/statistics', (req,res,next)=>{
    console.log("GET: /admin/statistics")
    res.status(200);
    res.render('admin_statistics.pug',{});
});

//list users
router.get('/admin/list_users', (req,res,next)=>{
    console.log("GET: /admin/users")
    res.status(200);
    res.render('admin_list_users.pug',{});
});
//

module.exports = router