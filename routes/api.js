const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const {body,validationResult} = require("express-validator");
const User = require("../models/User");
const Role = require("../models/Role");



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
  //validate first name
  body("firstName") 
  .isLength({min: 2}).withMessage("First name must have at least 2 letters")
  .isAlpha('en-US', {ignore: '\s'}).withMessage('The first name must contain only letters'),

  //validate last name
  body("lastName")
  .isLength({min: 2}).withMessage("Last name must have at least 2 letters")
  .isAlpha('en-US', {ignore: '\s'}).withMessage('Last name name must contain only letters'),

  //validate nick name
  body("nickName") 
  .isLength({min: 3}).withMessage("Nick name must have at least 3 letters"),

  //validate email
  body("email") 
  .isLength({min: 3}).withMessage("Email address must have at least 3 letters")
  .isEmail().withMessage("Not a valid email address")
  .escape(),

   //validate password
  body("password")
  .isLength({min: 8}).withMessage("Password must have at least 8 letters")
  .not().isLowercase().withMessage("Password must have at least 1 lower case letter")
  .not().isUppercase().withMessage("Password must have at least 1 upper case letter")
  .not().isNumeric().withMessage("Password must have at least 1 number")
  .not().isAlpha().withMessage("Password must have at least 1 alphanumeric character")
  .withMessage("Password is not strong enough"),
  async (req, res, next) => {
    console.log("POST: /register");

    //
    //find basic user id
    let roleId = null;
    try {
      roleId = (await Role.findOne({name: "basic"}))["_id"];
    } catch (err) {
      console.log(err);
    }
    //

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      //return res.status(400).json({errors: errors.array()});
      return res.status(400).send(JSON.stringify(errors));
    }

    User.findOne({email: req.body.email})
    .then((user) => {
      //
      //check if user already exists
      if(user) {
        return res.status(403).json({message: "Email already in use"});

      //if not then hash
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if(err) throw err;
              
            //create a new user
            User.create(
              {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                nickName: req.body.nickName,
                email: req.body.email,
                password: hash,
                role_id: roleId,

              })
              .then(()=>{ return res.status(200).redirect("/login");})
              .catch((err)=>{ 
                res.status(401).json({response: "Error at POST /register: " +err});
                });
              }
            );
          });
      }
      //
    })
    .catch((err)=>{
      console.log(err);
    });

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
    console.log("GET: /admin/users");
    res.status(200);
    res.render('admin_list_users.pug',{});
});
//


/*
REMOVE THESE WHEN SHIPPING!
*/

//add roles
router.post('/admin/add_role', async (req,res,next)=>{
  console.log("POST: /admin/add_role");
  const new_role = {name: req.body["name"], access: parseInt(req.body["access"])};
  const role = new Role(new_role); 
  role.save()
  .then(()=>{
    console.log("Added new role to DB!");
    res.status(200).send({response: "OK"});
  })
  .catch((err)=>{
    console.log("Error at POST /admin/add_role: " +err);
    res.status(401).send({response: "Error at POST /admin/add_role: " +err});
  });

  /*
  try {
      
      console.log("Added new role to DB!");
      return res.status(200).send({response: "OK"});
  } catch(err) {
      console.log("Error at POST /admin/add_role: " +err);
      return res.status(401).send({response: "Error at POST /admin/add_role: " +err});
  }
  */
});

//add users

module.exports = router