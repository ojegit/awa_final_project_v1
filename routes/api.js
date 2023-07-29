const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const {body,validationResult} = require("express-validator");
const User = require("../models/User");
const Role = require("../models/Role");
const CodeSnippet = require("../models/CodeSnippet");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const tokenValidator = require("../auth/validateToken.js");
const storage = multer.memoryStorage();
const upload = multer({storage})

// token expiration time
let tokenExpirationTimeInSecs = 20*60;
//

//CORS won't work without the following:
//Source: https://enable-cors.org/server_expressjs.html
/*
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
*/

//main landing page
router.get('/', (req,res,next)=>{
    console.log("GET: /")
    res.status(200);
    res.render('main_index.pug',{});
});
//

//search
router.post('/search/:query', (req,res,next)=>{
    /*
    returns ALL codeBlocks with the given query
    */
    var query = req.params.query;
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

router.post('/login', 

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
  //
  upload.none(),
  (req,res,next)=>{

      console.log("POST: /login");
      User.findOne({email: req.body.email})
      .then((user) => {

        //if user exists
        if(!user) {
            return res.status(403).json({message: "Login failed. User not found."});
        } else {
            bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
            if(err) throw err;

            //if password matches!
            if(isMatch) {
                console.log("Login by '"+req.body.email+"' success!");
    
                const jwtPayload = {
                    //id: user._id,
                    email: user.email
                }
    
                jwt.sign(jwtPayload, process.env.SECRET, { expiresIn: tokenExpirationTimeInSecs},
                (err, token) => {
                    //Add token to req.headers
                    //AFAIK this part was missing in the original code: the token is never added to the headers therefore 'req.headers["authorization"]' is undefined! 
                    res.cookie("token", token, {maxAge: tokenExpirationTimeInSecs*1000}); //https://www.sohamkamani.com/nodejs/jwt-authentication/#google_vignette
                    //Response
                    res.status(200).json({success: true, token});
                }
                
                );

            //wrong password
            } else {
              return res.status(403).json({message: "Invalid credentials"});
            }
            })
        }
    
        })
        .catch((err)=>{
          console.log(err);
        });


  });
//


//logout
/*
router.get('/logout'), (req,res,next)=>{
  console.log("POST: /logout");
  console.log( req.cookies.token);
  res.status(200);
  res.cookie('token', req.cookies.token, { maxAge: 0 });
  //res.status(200).redirect("/");
}
*/

//register
router.get('/register', (req,res,next)=>{
    console.log("GET: /register")
    res.status(200);
    res.render('register.pug',{});
});

router.post('/register',
  //multer middleware
  upload.single('images'),

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

    //user avatar
    const images = req.file;
    let new_avatar = {};
    if(images) {
      new_avatar = {
        name: images["originalname"],
        encoding: images["encoding"],
        mimetype: images["mimetype"],
        buffer: images["buffer"]
      };
    }
    //

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
                avatar: new_avatar
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
router.get('/user/', tokenValidator.validatedAccess(1).validate, (req,res,next)=>{
    console.log("GET: /user/");
    res.status(200);
    res.render('user_index.pug',{});
});

//code block submit page
router.get('/user/add_codeblock', tokenValidator.validatedAccess(1).validate, (req,res,next)=>{
    console.log("GET: /user/add_codeblock");
    res.status(200);
    res.render('user_add_codeblock.pug',{});
});

//add code block 
router.post('/user/add_codeblock', tokenValidator.validatedAccess(1).validate, async (req,res,next)=>{
  console.log("POST: /user/add_codeblock");
  /*
    user_id: {type: Schema.Types.ObjectId, required:true, ref: 'User'},
	comment_id: [{type: Schema.Types.ObjectId, required:true, ref: 'Comment'}],
    content: {type: String, required:true},
    positiveVotes: {type: Number},
    negativeVotes: {type: Number},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  */

    //find user id
    const token = req.cookies.token ? req.cookies.token : null;
    const userEmail = JSON.parse(atob(token.split('.')[1]))["email"];

    let user = null;
    try {
      user = (await User.findOne({email: userEmail}));
      /*
      .then((user) => {console.log("Found user: "+user)})
      .catch((err)=>{console.log("Error fetching user: "+err)});
      */
    } catch(err) {
      console.log("User not found: "+err);
    }

    console.log("User found: "+user["_id"]);

    //add net code snippet
    if(user) {
      CodeSnippet.create(
      {
        user_id: user["_id"],
        title: req.body.title,
        content: req.body.code,
      })
      .then(()=>{ 
        console.log("Created new code for user '"+userEmail+"'");
        //return res.status(200).redirect("/login");
        return res.status(200).json({response: "ok"});
      })
      .catch((err)=>{ 
        res.status(401).json({response: "Error at POST /user/add_codeblock: " +err});
      });

      
    } else {
      res.status(401).send({response: "User not found"});
    }
});

//list code blocks
router.get('/user/list_codeblocks', tokenValidator.validatedAccess(1).validate, async (req,res,next)=>{
    console.log("GET: /user/list_codeblocks");
    
    //find user id
    const token = req.cookies.token ? req.cookies.token : null;
    const userEmail = JSON.parse(atob(token.split('.')[1]))["email"];

    let user = null;
    try {
      user = (await User.findOne({email: userEmail}));
      /*
      .then((user) => {console.log("Found user: "+user)})
      .catch((err)=>{console.log("Error fetching user: "+err)});
      */
    } catch(err) {
      console.log("User not found: "+err);
    }

    console.log("User found: "+user["_id"]);

    //get all codeSnippets posted by the user
    if(user) {
      CodeSnippet.find({user_id: user["_id"]})
      .then((codeSnippets)=>{res.status(200).render("user_list_codeblocks.pug", {codeSnippets})})
      .catch((err)=>{if(err) return next(err);});
    } else {
      res.status(401).send({response: "User not found"});
    }
});

//delete user
router.delete('/user/', tokenValidator.validatedAccess(1).validate, (req,res,next)=>{
    console.log("DELETE: /user/"+id);
    res.status(200);
});


//user avatar image
router.get('/user/avatar', tokenValidator.validatedAccess(1).validate, async (req,res,next)=> {
    console.log("GET: /user/avatar");

    /*
    avatar: {
        name: String,
        encoding: String,
        mimetype: String,
        buffer: Buffer,
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now }
    },
    */
      
    //find user id
    const token = req.cookies.token ? req.cookies.token : null;
    const userEmail = JSON.parse(atob(token.split('.')[1]))["email"];

    let user = null;
    try {
      user = (await User.findOne({email: userEmail}));
    } catch(err) {
      console.log("User not found: "+err);
    }

    const avatar = user["avatar"];
    if(avatar) {
        const img = Buffer.from(avatar["buffer"],'base64').toString('base64');
        res.status(200);
        res.set({"content-type":avatar["mimetype"], "content-disposition":"inline"});
        res.send({"response": Buffer.from(avatar["buffer"],'base64')});
    } else {
       res.status(401).send({response: "Avatar image not found"});
    }

});

//post user avatar image
router.post('/user/avatar', 
  tokenValidator.validatedAccess(1).validate, 
  upload.array('images', 1), 
  async (req,res,next)=> {

  console.log("POST: /user/avatar");


  let user = null;
  try {
    user = (await User.findOne({email: userEmail}));
  } catch(err) {
    console.log("User not found: "+err);
  }

    /*
    avatar: {
        name: String,
        encoding: String,
        mimetype: String,
        buffer: Buffer,
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now }
    },
    */

  if(req.files.length > 0) {
      const name = req.files[i]["originalname"];
      const encoding = req.files[i]["encoding"];
      const mimetype = req.files[i]["mimetype"];
      const buffer = req.files[i]["buffer"];
      images.push({_id: _id, name: name, encoding: encoding, mimetype: mimetype, buffer: buffer});

    //return res.send(images);
    
    Images.insertMany(images) //https://www.geeksforgeeks.org/mongoose-insertmany-function/
    .then(function(){
      console.log("api.js /images/ POST success: "+JSON.stringify(images));  // Success
      //return res.send(req.body);
      return res.send(images);
    }).catch(function(error){
       return res.status(403).send("api.js /images/ POST error: "+error);
    });
    
    //how to add the id's to the submit WITHOUT another call to the db? Generate id's HERE and send them back in the response!

  } else {
    return res.status(403).send("api.js /images/ POST error: No images to insert!");
  }



});

//

//admin page
//landing page
router.get('/admin/', tokenValidator.validatedAccess(3).validate, (req,res,next)=>{
    console.log("GET: /admin")
    res.status(200);
    res.render('admin_index.pug',{});
});

//info
router.get('/admin/info', tokenValidator.validatedAccess(3).validate, (req,res,next)=>{
    console.log("GET: /admin/info")
    res.status(200);
    res.render('admin_info.pug',{});
});

//statistics
router.get('/admin/statistics', tokenValidator.validatedAccess(3).validate, (req,res,next)=>{
    console.log("GET: /admin/statistics")
    res.status(200);
    res.render('admin_statistics.pug',{});
});

//list users
router.get('/admin/list_users', tokenValidator.validatedAccess(3).validate, (req,res,next)=>{
    console.log("GET: /admin/list_users");
    User.find({})
    .then((users)=>{res.status(200).render("admin_list_users.pug", {users})})
    .catch((err)=>{if(err) return next(err);});
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