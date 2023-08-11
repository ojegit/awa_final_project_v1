const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const {body,validationResult} = require("express-validator");
const User = require("../models/User");
const Role = require("../models/Role");
const CodeSnippet = require("../models/CodeSnippet");
const Comment = require("../models/Comment");
const Vote = require("../models/Vote");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const {isValidated,accessValidator} = require("../auth/validate_token.js");
const storage = multer.memoryStorage();
const upload = multer({storage})
const {Blob} = require('buffer');
const mongoose = require("mongoose"); 
const i18next = require('i18next');


// token expiration time
let tokenExpirationTimeInSecs = 20*60; //20 min expiration
const redirectOnUnAuth = "/";
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


/*
Collect all reusable blocks here
*/

const getAllCodeSnippets = async()=>{
  try{
    //codeSnippets = (await CodeSnippet.find({user_id: new mongoose.Types.ObjectId(users[i]["_id"])}));
    return (await CodeSnippet.find({}));
  } catch (err) {
    console.log("CodeSnippets for a user not found: "+err);
    return null;
  }
}

const getUser = async(obj)=>{ //Note: if result is found its always an array!
  try{
    //codeSnippets = (await CodeSnippet.find({user_id: new mongoose.Types.ObjectId(users[i]["_id"])}));
    return (await User.find(obj));
  } catch (err) {
    console.log("User for a user not found: "+err);
    return null;
  }
}


const getCommentByCodeSnippetId = async(codeSnippet_id)=>{            
  try{
    return (await Comment.find({codeSnippet_id: codeSnippet_id}));
  } catch (err) {
    console.log("Comments for a CodeSnippet not found: "+err);
    return null;
  }
}


const getFieldFromToken = (req,field) => { 
  const token = req.cookies.token ? req.cookies.token : null;
  if(token)
    return JSON.parse(atob(token.split('.')[1]))[field];
  else 
    return null;
}


const getRoleById = async(role_id) => {  //Note: if result is found its always an array!
  try{
    return (await Role.find({_id: role_id}));
  } catch (err) {
    console.log("Role request failed: "+err);
    return null;
  }
}


const getUserAccessLevel = async(req)=>{ 
  try {
    const userEmail = getFieldFromToken(req,"email");
    const user = (await getUser({email: userEmail}))[0];
    const role = (await getRoleById(user["role_id"]))[0];
    return role["access"];
  } catch(err) {
    console.log("Access level request failed: "+err);
    return null;
  }
}
//


/*
NEed to have special verification here:
-those logged in can add comments and vote
-those logged out can only see what's been posted 
*/


//i18next testing
router.get('/setLng/:lng', async (req,res)=>{
  const lng = req.params.lng;
  console.log("Setting language to '"+lng+"'");
  (await i18next.changeLanguage(lng));
  res.redirect('back');
});


//vote codesnippet
router.post('/codesnippet/vote',
accessValidator(1,redirectOnUnAuth), 
async (req,res,next)=>{
  console.log("POST: /codesnippet/vote");

//get request data
const userVote = req.body.vote;
const codeSnippetId = req.body.codesnippet_id;
//

//get user id
const userEmail = getFieldFromToken(req,"email");
const user = (await getUser({email: userEmail}))[0];
const userId = user["_id"];

console.log("user_id: "+ userId+ ", vote: "+userVote+", codesnippet_id: "+codeSnippetId);

//verify that
//-users can't vote their own comments
//-users can vote only once per comment
//try {
  //find all comments for the codenippet at hand
  let vote_ids = (await CodeSnippet.findById(codeSnippetId))["vote_ids"];
  if(vote_ids) {
    for(var i=0; i<vote_ids.length; i++) {
      //find all users associated with the vote
      let vote = (await Vote.findById(vote_ids[i]));
      if(vote) {
        if(vote["user_id"].equals(userId)) { //note: === comparison won't do here!
          console.log("Codenippet id '" +codeSnippetId+ "' has already voted by user '"+userEmail+"'");
          //return res.status(401).json({response: "Codenippet id '" +codeSnippetId+ "' has already been voted by user '"+userEmail+"'"});
          return res.status(200).redirect("/");
        }
      }
    }
  }

  //check if 
//} catch(err) {
//  console.log("Error finding votes: "+err);
//  return res.status(401).json({response: "Error finding votes: "+err});
//}


  
  //create the Vote
  let vote = null;
  try {
    vote = (await Vote.create({user_id: userId, vote: userVote})); //if note is not in enum ['up', 'down'] an error will be produced
  } catch(err) {
    console.log("Error in creating vote: "+err);
    return res.status(401).json({response: "Error in creating vote: "+err});
  }

  if(vote) {
    //append to a list of votes in the comment
    try {
        let new_vote_ids = (await CodeSnippet.findById(codeSnippetId))["vote_ids"];

        if(new_vote_ids) {
          new_vote_ids.push(vote["_id"]);
          (await CodeSnippet.findByIdAndUpdate(codeSnippetId,{vote_ids: new_vote_ids}));
        } else {
          console.log("Error finding votes: "+err);
          return res.status(401).json({response: "Error finding votes: "+err});
        }
      /*
      (await CodeSnippet.findByIdAndUpdate(codeSnippetId,  // doesn't work
        { updated_at: new Date() },
        { $push: { votes: {vote_id: vote["_id"]}  }}
        ));
        */
    } catch(err) {
      console.log("Error updating comment: "+err);
      return res.status(401).json({response: "Error updating comment: "+err});
    }
  } else {
    return res.status(401).json({response: "Error updating comment: "+err});
  }

  
  //return res.status(201).json({response: "Added vote to codesnippet"});
  return res.status(201).redirect("/");

});

//vote comment
router.post('/codesnippet/comment/vote',
accessValidator(1,redirectOnUnAuth), 
async (req,res,next)=>{
  console.log("POST: /codesnippet/comment/vote");

  //parse request
  const userVote = req.body.vote;
  const commentId = req.body.comment_id;

  console.log("vote: "+userVote+", comment_id: "+commentId);


  //https://stackoverflow.com/questions/6238314/any-way-to-keep-an-html-button-pressed
  //https://stackoverflow.com/questions/33049707/push-items-into-mongo-array-via-mongoose
  //get user email
  const userEmail = getFieldFromToken(req,"email");
  //get user id
  const user = (await getUser({email: userEmail}))[0];
  const userId = user["_id"];

  
  console.log("user_id: "+ userId+ ", vote: "+userVote+", comment_id: "+commentId);

  //verify that
  //-users can't vote their own comments
  //-users can vote only once per comment
  //try {
    //find all comments for the codenippet at hand
    let vote_ids = (await Comment.findById(commentId))["vote_ids"];
    if(vote_ids) {
      for(var i=0; i<vote_ids.length; i++) {
        let vote = (await Vote.findById(vote_ids[i]));
        if(vote) {
          if(vote["user_id"].equals(userId)) { //note: === comparison won't work here!
            console.log("Commend id '" +commentId+ "' has already voted by user '"+userEmail+"'");
            //return res.status(401).json({response: "Comment id '" +commentId+ "' has already been voted by user '"+userEmail+"'"});
            return res.status(200).redirect("/");
          }
        }
      }
    }

    //check if 
 // } catch(err) {
 //   console.log("Error finding votes: "+err);
 //   return res.status(401).json({response: "Error finding votes: "+err});
 //}

  //create the Vote
  let vote = null;
  try {
    vote = (await Vote.create({user_id: userId, vote: userVote})); //if note is not in enum ['up', 'down'] an error will be produced
  } catch(err) {
    console.log("Error in creating vote: "+err);
    return res.status(401).json({response: "Error in creating vote: "+err});
  }

  if(vote) {
    //append to a list of votes in the comment
    try {
      let new_vote_ids = (await Comment.findById(commentId))["vote_ids"];
      if(new_vote_ids) {
        new_vote_ids.push(vote["_id"]);
        (await Comment.findByIdAndUpdate(commentId,{vote_ids: new_vote_ids}));
      } else {
        console.log("Error finding votes: "+err);
        return res.status(401).json({response: "Error finding votes: "+err});
      }
      /*
      (await Comment.findOneAndUpdate(commentId, 
        { updated_at: new Date() },
        { $push: { votes: vote["_id"]  }}
        ));
        */
    } catch(err) {
      console.log("Error updating comment: "+err);
      return res.status(401).json({response: "Error updating comment: "+err});
    }
  } else {
    return res.status(401).json({response: "Error updating comment: "+err});
  }

  //return res.status(201).json({response: "Added vote to comment"});
  return res.status(201).redirect("/");


});

//

router.get('/', async (req,res,next)=>{

  //1. Get all code snippets
  let codeSnippets = (await getAllCodeSnippets());

  if(codeSnippets) {
    for(var i=0; i<codeSnippets.length; i++) { //loop code snippets
      const user_id = codeSnippets[i]["user_id"];

      //tally up votes for codeSnippets
      //-count amount
      //-get all user_id's for this particular codeblock (when creating turn voting off if self=current user id)
      let upvotes = 0;
      let downvotes = 0;
      if(codeSnippets[i]["vote_ids"].length > 0) {
        for(var j=0; j<codeSnippets[i]["vote_ids"].length; j++) {
          const vote_id = codeSnippets[i]["vote_ids"][j];
          let vote = null;
          try {
            vote = (await Vote.findById(vote_id));
          }catch(err) {
            console.log("Error finding vote: "+err);
          }
          if(vote) {
            if(vote["vote"] === "up") {
              upvotes++;
            } else if(vote["vote"] === "down") {
              downvotes++;
            }
          }
        }
      }
      codeSnippets[i]["upvotes"] = upvotes;
      codeSnippets[i]["downvotes"] = downvotes;
      //


      //locate corresponding user
      let user = (await getUser({_id: user_id}))[0];      

      //attach user info
      if(user) {
        codeSnippets[i]["user"] = user;
        //1. process avatars
        
        if(codeSnippets[i]["user"]["avatar"]["buffer"]) {
         const imgBuffer = codeSnippets[i]["user"]["avatar"]["buffer"];

         const imgUrl = "data:"+codeSnippets[i]["user"]["avatar"]["mimetype"]+";base64,"+Buffer.from(imgBuffer,'base64').toString('base64');
         codeSnippets[i]["user"]["imgSrc"] = imgUrl;
         //.toString('base64')
         //const blob = (await imgBase64.blob());
         //const blob = new Blob(imgBuffer, { type: codeSnippets[i]["user"][0]["avatar"]["mimetype"] });
         //codeSnippets[i]["user"]["imgSrc"] = URL.createObjectURL(blob); //attach to img as src


         //remove avatar from the result since it's no longer needed
         delete codeSnippets[i]["user"]["avatar"]; //not working!
        }

        //3. get ALL comments for a codesnippet
        const codeSnippetId = codeSnippets[i]["_id"];
        if(codeSnippetId) {
            let comments = (await getCommentByCodeSnippetId(codeSnippetId));
            /*
            need to also fetch who posted the comment and link them to the comments!
            */

            //tally up votes for comments
            //-count amount
            //-get all user_id's for this particular codeblock (when creating turn voting off if self=current user id)

            if(comments){
              codeSnippets[i]["comments"] = comments; 
              for(var j=0;j<codeSnippets[i]["comments"].length; j++) {
                let upvotes = 0;
                let downvotes = 0;
                if(codeSnippets[i]["comments"][j]["vote_ids"].length > 0) {
                  for(var k=0; k<codeSnippets[i]["comments"][j]["vote_ids"].length; k++) {
                    const vote_id = codeSnippets[i]["comments"][j]["vote_ids"][k];
                    let vote = null;
                    try {
                      vote = (await Vote.findById(vote_id));
                    }catch(err) {
                      console.log("Error finding vote: "+err);
                    }
                    if(vote) {
                      if(vote["vote"] === "up") {
                        upvotes++;
                      } else if(vote["vote"] === "down") {
                        downvotes++;
                      }
                    }
                  }
                }
                codeSnippets[i]["comments"][j]["upvotes"] = upvotes;
                codeSnippets[i]["comments"][j]["downvotes"] = downvotes;
              }
            } else {
              console.log("Comments for a CodeSnippet not found");
            }
        }

      }
    }
  }

  //console.log(codeSnippets[0]["user"][0]["avatar"]);

  //res.status(200);
  const email = getFieldFromToken(req,"email");
  const hasAccess = isValidated(1)(req,res,next);
  const loggedIn = hasAccess;
  let loggedInGroup = 0;
  let loggedInUser = null;
  if(loggedIn) {
    //get highest access level 
    //loggedInGroup = tokenValidator.getAccess();
    loggedInUser = (await getUser({email: email}))[0];
    loggedInGroup = (await getUserAccessLevel(req));
  }
  console.log("Has access: "+hasAccess+", "+loggedInGroup);

/*
since the cookie, localstorage or even url based applying of lng doesn't work 
with i18next, and it keeps reloading multiple times, i've decided to force the change MANUALLY by
loading the lng file from i18next and feeding it server size. this is GUARANTEED to work.
*/

  const i18nextLng = i18next.language;
  console.log("main_index.pug: "+i18nextLng);
  res.status(200).render('main_index.pug',{loggedInUser,codeSnippets,loggedInGroup,email,i18nextLng});


  //res.status(200).json({response: "ok"});
});


//

//search
router.post('/search', async(req,res,next)=>{
    /*
    returns ALL codeBlocks with the given query
    */
    //https://stackoverflow.com/questions/41016917/render-a-view-after-post-request-in-node-js

    console.log("POST: /search/");
    const query = req.body.query;
    console.log("Searched '"+query+"'");

    //1. Get all code snippets
    let codeSnippets = null;
    try{
      //codeSnippets = (await CodeSnippet.find({user_id: new mongoose.Types.ObjectId(users[i]["_id"])}));
      codeSnippets = (await CodeSnippet.find({ "content": { "$regex": query, "$options": "i" }}));
    } catch (err) {
      console.log("CodeSnippets for a user not found: "+err);
    }

    console.log("Search results: "+JSON.stringify(codeSnippets));
  
    if(codeSnippets) {
      for(var i=0; i<codeSnippets.length; i++) { //loop code snippets
        const user_id = codeSnippets[i]["user_id"];

      //tally up votes for codeSnippets
      //-count amount
      //-get all user_id's for this particular codeblock (when creating turn voting off if self=current user id)
      let upvotes = 0;
      let downvotes = 0;
      if(codeSnippets[i]["vote_ids"].length > 0) {
        for(var j=0; j<codeSnippets[i]["vote_ids"].length; j++) {
          const vote_id = codeSnippets[i]["vote_ids"][j];
          let vote = null;
          try {
            vote = (await Vote.findById(vote_id));
          }catch(err) {
            console.log("Error finding vote: "+err);
          }
          if(vote) {
            if(vote["vote"] === "up") {
              upvotes++;
            } else if(vote["vote"] === "down") {
              downvotes++;
            }
          }
        }
      }
      codeSnippets[i]["upvotes"] = upvotes;
      codeSnippets[i]["downvotes"] = downvotes;
      //
  
        //locate corresponding user
        let user = (await getUser({_id: user_id}))[0];    
      
        //attach user info
        if(user) {
          codeSnippets[i]["user"] = user;
          //1. process avatars
          
          if(codeSnippets[i]["user"]["avatar"]["buffer"]) {
            const imgBuffer = codeSnippets[i]["user"]["avatar"]["buffer"];

         
            const imgUrl = "data:"+codeSnippets[i]["user"]["avatar"]["mimetype"]+";base64,"+Buffer.from(imgBuffer,'base64').toString('base64');
            codeSnippets[i]["user"]["imgSrc"] = imgUrl;
            //remove avatar from the result since it's no longer needed
            delete codeSnippets[i]["user"]["avatar"]; //not working!
          }
  
          //3. get ALL comments for a codesnippet
          const codeSnippetId = codeSnippets[i]["_id"];
          if(codeSnippetId) {
            let comments = (await getCommentByCodeSnippetId(codeSnippetId));
            /*
            need to also fetch who posted the comment and link them to the comments!
            */

            //tally up votes for comments
            //-count amount
            //-get all user_id's for this particular codeblock (when creating turn voting off if self=current user id)

            if(comments){
              codeSnippets[i]["comments"] = comments; 
              for(var j=0;j<codeSnippets[i]["comments"].length; j++) {
                let upvotes = 0;
                let downvotes = 0;
                if(codeSnippets[i]["comments"][j]["vote_ids"].length > 0) {
                  for(var k=0; k<codeSnippets[i]["comments"][j]["vote_ids"].length; k++) {
                    const vote_id = codeSnippets[i]["comments"][j]["vote_ids"][k];
                    let vote = null;
                    try {
                      vote = (await Vote.findById(vote_id));
                    }catch(err) {
                      console.log("Error finding vote: "+err);
                    }
                    if(vote) {
                      if(vote["vote"] === "up") {
                        upvotes++;
                      } else if(vote["vote"] === "down") {
                        downvotes++;
                      }
                    }
                  }
                }
                codeSnippets[i]["comments"][j]["upvotes"] = upvotes;
                codeSnippets[i]["comments"][j]["downvotes"] = downvotes;
              }
            } else {
              console.log("Comments for a CodeSnippet not found");
            }
          }
  
        }
      }
    }

  const email = getFieldFromToken(req,"email");
  const hasAccess = isValidated(1)(req,res,next);
  const loggedIn = hasAccess;
  let loggedInGroup = 0;
  let loggedInUser = null;
  if(loggedIn) {
    //get highest access level 
    //loggedInGroup = tokenValidator.getAccess();
    loggedInUser = (await getUser({email: email}))[0];
    loggedInGroup = (await getUserAccessLevel(req));
  }
  console.log("Has access: "+hasAccess+", "+loggedInGroup);

  const i18nextLng = i18next.language;
  console.log("main_index.pug: "+i18nextLng);
  res.status(200).render('main_index.pug',{loggedInUser,codeSnippets,loggedInGroup,email,i18nextLng});


});
//


//login
router.get('/login', (req,res,next)=>{
    console.log("GET: /login");
    const i18nextLng = i18next.language;

    console.log(req.headers["errors"])
    console.log("login.pug: "+i18nextLng);

    var expressValidatorErrors = req.headers["errors"];
    //console.log("express-validator: "+req.session.errors);
    if(expressValidatorErrors) {
      expressValidatorErrors = JSON.parse(expressValidatorErrors); //from JSON to Object
      console.log("express-validator: ");
      for(var i=0;i<expressValidatorErrors.length; i++) {
        console.log("error #"+(i+1)+": "+expressValidatorErrors[i]["msg"]);
      }
    }

    res.status(200);
    res.render('login.pug', //not updating page, even tough 'expressValidatorErrors' is clearly received!
    {
      i18nextLng,
      expressValidatorErrors//req.session.errors, //from get(/login)
    });
    req.session.errors = null;
});

//https://github.com/i18next/i18next-fs-backend
router.post('/login', 
  
  upload.none(),
  /*
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
  */
  //
  //validate email
  
  body("email") 
  .isLength({min: 3})
  .withMessage((value, { req, location, path }) => {
    return req.t('express_validator.login_messages.email.length', {lng: i18next.language}, { value, location, path });
  })//.withMessage(""+i18next.t('express_validator.login_messages.email.length'))
  .isEmail().withMessage((value, { req, location, path }) => {
    return req.t('express_validator.login_messages.email.isemail', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.login_messages.email.isemail'))
  .escape(),

   //validate password
  body("password")
  .isLength({min: 8}).withMessage((value, { req, location, path }) => {
    return req.t('express_validator.login_messages.password.length', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.login_messages.password.length'))
  .not().isLowercase().withMessage((value, { req, location, path }) => {
    return req.t('express_validator.login_messages.password.lowercase', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.login_messages.password.lowercase'))
  .not().isUppercase().withMessage((value, { req, location, path }) => {
    return req.t('express_validator.login_messages.password.uppercase', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.login_messages.password.uppercase'))
  .not().isNumeric().withMessage((value, { req, location, path }) => {
    return req.t('express_validator.login_messages.password.number', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.login_messages.password.number'))
  .not().isAlpha().withMessage((value, { req, location, path }) => {
    return req.t('express_validator.login_messages.password.alphanumeric', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.login_messages.password.alphanumeric'))
  .withMessage((value, { req, location, path }) => {
    return req.t('express_validator.login_messages.password.strength', {lng: i18next.language}, { value, location, path });
  }),//.withMessage(i18next.t('express_validator.login_messages.password.strength')),
  //
  
  (req,res,next)=>{

      console.log("POST: /login");

      //
      const errors = validationResult(req) //this reply goes back to get(/login)!
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      //

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
                async (err, token) => {
                    //Add token to req.headers
                    //AFAIK this part was missing in the original code: the token is never added to the headers therefore 'req.headers["authorization"]' is undefined! 
                    res.cookie("token", token, {maxAge: tokenExpirationTimeInSecs*1000}); //https://www.sohamkamani.com/nodejs/jwt-authentication/#google_vignette

                    try{
                      (await User.updateOne({last_login_at: new Date()}));
                    } catch (err) {
                      console.log("Login error: Error updating lastlogin: "+err);
                      return res.status(403).json({response: "Login error: Error updating last login: "+err});
                    }
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
//set token to expire now to log out
router.post('/logout',
//tokenValidator.validatedAccess(1).validate, 
(req,res,next)=>{
  console.log("POST: /logout");
  const token = req.cookies.token;
  console.log(token);
    if(token) {
    try {
      res.cookie('token', '', { maxAge: 0 });
      console.log("Logged out!");
    } catch(err) {
      console.log("Logout failed: "+err);
      return res.status(401).json({response: "Logout failed: "+err});
    }
  } else {
    console.log("No token cookie detected.");
  }
  res.status(200).redirect("/");
});

//register
router.get('/register', (req,res,next)=>{
    console.log("GET: /register");
    const i18nextLng = i18next.language;
    console.log("register.pug: "+i18nextLng);
    res.status(200);
    res.render('register.pug',    {
      i18nextLng: i18nextLng,
      expressValidatorErrors: req.session.errors, //from get(/login)
    });
});

router.post('/register',
  //multer middleware
  upload.single('images'),
  /*
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
  */
  
  //validate first name
  body("firstName") 
  .isLength({min: 2}).withMessage((value, { req, location, path }) => {
    return req.t('express_validator.register_messages.firstname.islength', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.register_messages.firstname.islength'))
  .isAlpha('en-US', {ignore: '\s'}).withMessage((value, { req, location, path }) => {
    return req.t('express_validator.register_messages.firstname.isalpha', {lng: i18next.language}, { value, location, path });
  }),//.withMessage(i18next.t('express_validator.register_messages.firstname.isalpha')),

  //validate last name
  body("lastName")
  .isLength({min: 2}).withMessage((value, { req, location, path }) => {
    return req.t('express_validator.register_messages.lastname.islength', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.register_messages.lastname.islength'))
  .isAlpha('en-US', {ignore: '\s'}).withMessage((value, { req, location, path }) => {
    return req.t('express_validator.register_messages.lastname.isalpha', {lng: i18next.language}, { value, location, path });
  }),//.withMessage(i18next.t('express_validator.register_messages.lastname.isalpha')),

  //validate nick name
  body("nickName") 
  .isLength({min: 3}).withMessage((value, { req, location, path }) => {
    return req.t('express_validator.register_messages.nickname.islength', {lng: i18next.language}, { value, location, path });
  }),//.withMessage(i18next.t('express_validator.register_messages.nickname.islength')),

  //validate email
  body("email") 
  .isLength({min: 3}).withMessage((value, { req, location, path }) => {
    return req.t('express_validator.register_messages.email.islength', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.register_messages.email.islength'))
  .isEmail().withMessage((value, { req, location, path }) => {
    return req.t('express_validator.register_messages.email.isemail', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.register_messages.email.isemail'))
  .escape(),

   //validate password
  body("password")
  .isLength({min: 8}).withMessage((value, { req, location, path }) => {
    return req.t('express_validator.register_messages.password.islength', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.register_messages.password.islength'))
  .not().isLowercase().withMessage((value, { req, location, path }) => {
    return req.t('express_validator.register_messages.password.islowercase', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.register_messages.password.islowercase'))
  .not().isUppercase().withMessage((value, { req, location, path }) => {
    return req.t('express_validator.register_messages.password.isuppercase', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.register_messages.password.isuppercase'))
  .not().isNumeric().withMessage((value, { req, location, path }) => {
    return req.t('express_validator.register_messages.password.isnumber', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.register_messages.password.isnumber'))
  .not().isAlpha().withMessage((value, { req, location, path }) => {
    return req.t('express_validator.register_messages.password.isalpha', {lng: i18next.language}, { value, location, path });
  })//.withMessage(i18next.t('express_validator.register_messages.password.isalpha'))
  .withMessage((value, { req, location, path }) => {
    return req.t('express_validator.register_messages.password.strength', {lng: i18next.language}, { value, location, path });
  }),//.withMessage(i18next.t('express_validator.register_messages.password.strength')),
  
  async (req, res, next) => {
    console.log("POST: /register");

    //
    const errors = validationResult(req) //this reply goes back to get(/register)!
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    //

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

    //count the number of users in the db
    let userCount = null;
    try {
      userCount = (await User.countDocuments({}));
    } catch(err) {
      console.log("User count failed: "+err);
      return res.status(401).json({response: "User count failed: "+err});
    }

    //IMPORTANT Make first user automatically an Admin
    let roleName;
    if(userCount == 0) {
      roleName = "admin";
      console.log("First user in the DB detected. Will be given 'admin' privileges by default.");
     } else {
      roleName = "basic";
    }

    //
    //find basic user id
    let roleId = null;
    try {
      roleId = (await Role.findOne({name: roleName}))["_id"];
    } catch (err) {
      console.log(err);
    }
    //

    /*
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      //return res.status(400).json({errors: errors.array()});
      return res.status(400).send(JSON.stringify(errors));
    }
    */

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
              .then(()=>{ 
                console.log("Registered user '"+req.body.email+"' successfully!"); 
                return res.status(200).redirect("/login");
              })
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
router.get('/user/', 
accessValidator(1,redirectOnUnAuth), 
(req,res,next)=>{
    console.log("GET: /user/");
    const i18nextLng = i18next.language;
    console.log("user_index.pug: "+i18nextLng);
    res.status(200);
    res.render('user_index.pug',{i18nextLng});
});



//user edit info for the current logged in user
router.get('/user/info',
accessValidator(1,redirectOnUnAuth),
async (req,res,next)=>{
    console.log("GET: /user/info");
    const i18nextLng = i18next.language;
    console.log("user_info.pug: "+i18nextLng);

    //get email from token
    const userEmail = getFieldFromToken(req,"email");

    //get all users
    let users = null;
    try{
      users = (await User.find({email: userEmail}));
    } catch (err) {
      return res.status(401).json({ response: "Error fetching users: "+err});
    }

    console.log("Found " +users.length+" users.");

    if(users) {
      for(var i=0; i<users.length; i++) {
          if(users[i]["avatar"]["buffer"]) {

            //get image base64
            const imgBuffer = users[i]["avatar"]["buffer"];

            const imgUrl = "data:" +users[i]["avatar"]["mimetype"]+ ";base64," +Buffer.from(users[i]["avatar"]["buffer"],'base64').toString('base64');
            //console.log(imgUrl)
            users[i]["imgSrc"] = imgUrl;
          }
          
          //parse role
          let role = null;
          try {
            role = (await Role.findById(users[i]["role_id"]));
          } catch(err) {
            console.log("Error fetching Role: "+err);
            return res.status(401).json({response: "Error fetching Role: "+err});
          }
          users[i]["role_access"] = role["access"];
          users[i]["role_name"] = role["name"];
          console.log("user email: "+users[i]["email"]+", role name: "+ users[i]["role_name"]);

          //remove avatar from the result since it's no longer needed
          //delete users[i]["avatar"]; //not working!
        }
    }

     res.status(200).render("user_info.pug", {users,i18nextLng});

});


//change user info excluding role and deletion
router.post("/user/info",
accessValidator(1,redirectOnUnAuth), 

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

  async(req, res)=>{
  console.log("POST: /user/info");

  //console.log("SERVER SIDE: user_id: "+req.body.user_id+ ", password: "+req.body.password+ ", roleName: "+req.body.roleName);


  //get old values 
  const user_old = (await getUser({_id: req.body.user_id}))[0];

  //update new avatar
  const image = req.file;
    let new_avatar = {};
    if(image) {
      new_avatar = {
        name: image["originalname"],
        encoding: image["encoding"],
        mimetype: image["mimetype"],
        buffer: image["buffer"]
      };
    }
    
  let hash = null;
  const saltRounds = 10;
  if(req.body.password) {
    try {
      hash = (await bcrypt.hash(req.body.password, saltRounds));
    } catch(err) {
      console.log("Error in bcrypt: "+err);
      return res.status(401).json({response: "Error in bcrypt: "+err});
    } 
  } else {
    hash = user_old["password"]; 
  }
  console.log("new hash: "+hash);
  
  const userId = req.body.user_id;
  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    nickName: req.body.nickName,
    bio: req.body.bio,
    email: req.body.email,
    password: hash,
    avatar: new_avatar,
    updated_at: new Date()
  }

  console.log("new user: "+JSON.stringify(user));

  try{
    const tmp = (await User.findByIdAndUpdate(userId,user));
  } catch(err) {
    console.log("Update failed: "+err);
    return res.status(401).json({response: "User data update failed"});
  }
  //res.status(200).json({response: "User data update successful"});
  res.status(200).redirect("/user/info");

});


//code block submit page
router.get('/user/add_codeblock', 
accessValidator(1,redirectOnUnAuth), 
(req,res,next)=>{
    console.log("GET: /user/add_codeblock");
    const i18nextLng = i18next.language;
    console.log("user_add_codeblock.pug: "+i18nextLng);
    res.status(200);
    res.render('user_add_codeblock.pug',{i18nextLng});
});



//delete comment in codeblock (and its votes)
router.post('/comment/delete',
accessValidator(1,redirectOnUnAuth),
async(req,res,next)=>{
  console.log("POST: /user/codeblock/comment/delete");
  const commentId = req.body.comment_id;
  console.log("Attempting to delete comment_id: "+commentId);

  try {
    //delete comments of codeblock
    const comment = (await Comment.findByIdAndDelete(commentId));

    //delete votes from comments of codeblock
    if(comment) { //(comment["vote_ids"] !== undefined) {
      (await Vote.deleteMany({_id: comment["vote_ids"]}));
    }
  } catch(err) {
    console.log("Error finding commend: " +err);
    return res.status(403).json({response: "Error finding commend: " +err});
  }
  //res.status(200).json({response: "Comment deleted"+err});
  return res.status(201).redirect('back');
});

//delete codeblock (and its votes)
router.post('/codeblock/delete',
accessValidator(1,redirectOnUnAuth),
async(req,res,next)=>{
  console.log("POST: /codeblock/delete");
  const codeblockId = req.body.codesnippet_id;
  console.log("Attempting to delete codeblock_id: "+codeblockId);

  try {
    //delete codeblock
    const codeBlock = (await CodeSnippet.findByIdAndDelete(codeblockId));

    //delete votes from codeblock
    if(codeBlock) { //(codeBlock["vote_ids"] !== undefined) {
      (await Vote.deleteMany({_id: codeBlock["vote_ids"]}));
    }

    //delete comments of codeblock
    const comment = (await Comment.findOneAndDelete({codeSnippet_id: codeblockId}));

    //delete votes from comments of codeblock
    if (comment) { //if(comment["vote_ids"] !== undefined) {
      (await Vote.deleteMany({_id: comment["vote_ids"]}));
    }

  } catch(err) {
    console.log("Error finding codesnippet: " +err);
    return res.status(403).json({response: "Error finding codesnippet: " +err});
  }
  //res.status(200).json({response: "Codesnippet deleted"+err});
  return res.status(201).redirect('back');
});

//add code block 
router.post('/user/add_codeblock', 
accessValidator(1,redirectOnUnAuth), 
  async (req,res,next)=>{
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

    //find codeSnippet poster user's id
    const userEmail = getFieldFromToken(req,"email");

    let user = null;
    try {
      user = (await User.findOne({email: userEmail}));
      /*
      .then((user) => {console.log("Found user: "+user)})
      .catch((err)=>{console.log("Error fetching user: "+err)});
      */
    } catch(err) {
      console.log("User not found: "+err);
      return res.status(401).json({response: "User not found: "+err});
    }

    console.log("User found: "+user["_id"]);

    //add net code snippet
    if(user) {
      CodeSnippet.create(
      {
        user_id: user["_id"],
        title: req.body.title,
        content: req.body.code,
        highlightjs: req.body.language
      })
      .then(()=>{ 
        console.log("Created new code for user '"+userEmail+"'");
        //return res.status(200).redirect("/login");
        return res.status(200).json({response: "ok"});
      })
      .catch((err)=>{ 
        return res.status(401).json({response: "Error at POST /user/add_codeblock: " +err});
      });

      
    } else {
      return res.status(401).send({response: "User not found"});
    }
});


//edit codeblock (note: HTML form doesn't have a 'put' method)
router.post('/user/codesnippet',   
accessValidator(1,redirectOnUnAuth), 
  async (req,res,next)=>{
    console.log("PUT: /user/codesnippet");

    //const userEmail = getFieldFromToken(req,"email");
    //const user = (await getUser({email: userEmail}))[0];
    const codeSnippetId = req.body.codesnippet_id;
    const codeTitle = req.body.title;
    const codeContent = req.body.content;

    try {

      (await CodeSnippet.findByIdAndUpdate(codeSnippetId,
        {
          title: codeTitle,
          content: codeContent,
          updated_at: new Date()
      }));
    } catch(err) {
      console.log("CodeSnippet update error: "+err);
      return res.status(401).send({response: "CodeSnippet update error: "+err});
    }
    //return res.status(201).send({response: "CodeSnippet update successful"});
    return res.status(201).redirect("/");
});


//edit codeblock (note: HTML form doesn't have a 'put' method)
router.post('/user/codesnippet/comment',   
accessValidator(1,redirectOnUnAuth), 
  async (req,res,next)=>{
    console.log("PUT: /user/codesnippet/comment");

    //const userEmail = getFieldFromToken(req,"email");
    //const user = (await getUser({email: userEmail}))[0];
    const commentId = req.body.comment_id;
    const codeTitle = req.body.title;
    const codeContent = req.body.content;

    try {
      (await Comment.findByIdAndUpdate(commentId,
        {
          title: codeTitle,
          content: codeContent,
          updated_at: new Date()
      }));
    } catch(err) {
      console.log("Comment update error: "+err);
      return res.status(401).send({response: "Comment update error: "+err});
    }
    //return res.status(201).send({response: "CodeSnippet update successful"});
    return res.status(201).redirect("/");
});


//add comment to a codeblock
router.post('/user/codeblock/add_comment',
accessValidator(1,redirectOnUnAuth), 
  async (req,res,next)=>{

  console.log("POST: /user/codeblock/add_comment");

  //get id of the snippet where the commet is attached to
  const codeSnippetId = req.body.codesnippet_id;
  const commentTitle = req.body.title;
  const commentContent = req.body.content;

  console.log("CodeSnippetId: "+codeSnippetId+", Title: "+commentTitle+", Comment: "+commentContent);

  //get comment
  if(codeSnippetId) {
    let codeSnippet = null;
    try {
      codeSnippet = (await CodeSnippet.findOne({_id: codeSnippetId}));
    } catch(err) {
      console.log("CodeSnippet not found: "+err);
      return res.status(401).send({response: "CodeSnippet not found"});
    }

    if(codeSnippet) {
      //find id of the poster

      //get email
      const userEmail = getFieldFromToken(req,"email");

      let user = (await getUser({email: userEmail}))[0];


      if(user) {
        //Add new comment
        try {
          Comment.create({user_id: user["_id"], 
                          codeSnippet_id: codeSnippetId, 
                          title: commentTitle,
                          content: commentContent}); 
        } catch(err) {
          console.log("Comment add error: "+err);
          return res.status(401).send({response: "Comment add error "+err});
        }
        //
        console.log("Comment added to "+codeSnippetId);
        //return res.status(200).send({response: "Comment added to "+codeSnippetId});
        return res.status(200).redirect("/");
        //
      } else {
        console.log("User not found");
      }

    } else {
      console.log("User not found");
      return res.status(401).send({response: "User not found"});
    }
  } else {
    console.log("CodeSnippet Id not found");
    return res.status(401).send({response: "CodeSnippet Id not found"});
  }

});

//list code blocks
router.get('/user/list_codeblocks', 
accessValidator(1,redirectOnUnAuth), 
async (req,res,next)=>{
  console.log("GET: /user/list_codeblocks");

  const i18nextLng = i18next.language;
  console.log("user_list_codeblocks.pug: "+i18nextLng);


  //subset
  const userEmail = getFieldFromToken(req,"email");
  const userId = (await getUser({email: userEmail}))[0]["_id"];
  console.log("my id: "+userId);
  //
  
  //1. Get all code snippets
  let codeSnippets = null;
  try {
    codeSnippets = (await CodeSnippet.find({user_id: userId}));
  } catch(err) {
    console.log("CodeSnippet find error: "+err);
  }

  if(codeSnippets) {
    for(var i=0; i<codeSnippets.length; i++) { //loop code snippets

      //only get those that match 
      const user_id = codeSnippets[i]["user_id"];

      //tally up votes for codeSnippets
      //-count amount
      //-get all user_id's for this particular codeblock (when creating turn voting off if self=current user id)
      let upvotes = 0;
      let downvotes = 0;
      if(codeSnippets[i]["vote_ids"].length > 0) {
        for(var j=0; j<codeSnippets[i]["vote_ids"].length; j++) {
          const vote_id = codeSnippets[i]["vote_ids"][j];
          let vote = null;
          try {
            vote = (await Vote.findById(vote_id));
          }catch(err) {
            console.log("Error finding vote: "+err);
          }
          if(vote) {
            if(vote["vote"] === "up") {
              upvotes++;
            } else if(vote["vote"] === "down") {
              downvotes++;
            }
          }
        }
      }
      codeSnippets[i]["upvotes"] = upvotes;
      codeSnippets[i]["downvotes"] = downvotes;
      //


      //locate corresponding user
      let user = (await getUser({_id: user_id}))[0];      

      //attach user info
      if(user) {
        codeSnippets[i]["user"] = user;
        //1. process avatars
        
        if(codeSnippets[i]["user"]["avatar"]["buffer"]) {
         const imgBuffer = codeSnippets[i]["user"]["avatar"]["buffer"];

         const imgUrl = "data:"+codeSnippets[i]["user"]["avatar"]["mimetype"]+";base64,"+Buffer.from(imgBuffer,'base64').toString('base64');
         codeSnippets[i]["user"]["imgSrc"] = imgUrl;
         //.toString('base64')
         //const blob = (await imgBase64.blob());
         //const blob = new Blob(imgBuffer, { type: codeSnippets[i]["user"][0]["avatar"]["mimetype"] });
         //codeSnippets[i]["user"]["imgSrc"] = URL.createObjectURL(blob); //attach to img as src


         //remove avatar from the result since it's no longer needed
         delete codeSnippets[i]["user"]["avatar"]; //not working!
        }

        //3. get ALL comments for a codesnippet
        const codeSnippetId = codeSnippets[i]["_id"];
        if(codeSnippetId) {
            let comments = (await getCommentByCodeSnippetId(codeSnippetId));
            /*
            need to also fetch who posted the comment and link them to the comments!
            */

            //tally up votes for comments
            //-count amount
            //-get all user_id's for this particular codeblock (when creating turn voting off if self=current user id)

            if(comments){
              codeSnippets[i]["comments"] = comments; 
              for(var j=0;j<codeSnippets[i]["comments"].length; j++) {
                let upvotes = 0;
                let downvotes = 0;
                if(codeSnippets[i]["comments"][j]["vote_ids"].length > 0) {
                  for(var k=0; k<codeSnippets[i]["comments"][j]["vote_ids"].length; k++) {
                    const vote_id = codeSnippets[i]["comments"][j]["vote_ids"][k];
                    let vote = null;
                    try {
                      vote = (await Vote.findById(vote_id));
                    }catch(err) {
                      console.log("Error finding vote: "+err);
                    }
                    if(vote) {
                      if(vote["vote"] === "up") {
                        upvotes++;
                      } else if(vote["vote"] === "down") {
                        downvotes++;
                      }
                    }
                  }
                }
                codeSnippets[i]["comments"][j]["upvotes"] = upvotes;
                codeSnippets[i]["comments"][j]["downvotes"] = downvotes;
              }
            } else {
              console.log("Comments for a CodeSnippet not found");
            }
        }

      }
    }
  }

  //console.log(codeSnippets[0]["user"][0]["avatar"]);

  //res.status(200);
  //const email = getFieldFromToken(req,"email");
  const hasAccess = isValidated(1)(req,res,next);
  const loggedIn = hasAccess;
  let loggedInGroup = 0;
  let loggedInUser = null;
  if(loggedIn) {
    //get highest access level 
    //loggedInGroup = tokenValidator.getAccess();
    loggedInUser = (await getUser({email: userEmail}))[0];
    loggedInGroup = (await getUserAccessLevel(req));
  }
  console.log("Has access: "+hasAccess+", "+loggedInGroup);

/*
since the cookie, localstorage or even url based applying of lng doesn't work 
with i18next, and it keeps reloading multiple times, i've decided to force the change MANUALLY by
loading the lng file from i18next and feeding it server size. this is GUARANTEED to work.
*/

  res.status(200).render('user_list_codeblocks.pug',{loggedInUser,codeSnippets,loggedInGroup,userEmail,i18nextLng});

});

//delete user
router.post('/admin/user/delete',
accessValidator(3,redirectOnUnAuth),
    async (req,res,next)=>{
    console.log("DELETE: /admin/user/delete");

    //delete all information: user profile, posted comments, votes Acodeblocks?
    //https://stackoverflow.com/questions/56560040/mongoose-how-to-remove-all-documents-with-some-field-value

    //find user id
    //const userEmail = getFieldFromToken(req,"email");
    //let user = (await getUser({email: userEmail}))[0];
    //const userId = user["_id"];

    //user that is to be deleted 
    const userId = req.body.user_id;
    const userEmail = (await getUser({_id: userId}))[0]["email"];
    console.log("Attempting to delete user_id '"+userId+"'");
    if(userId) {

      //get all vote id's for the user
      let voteIds = null;
      try {
        voteIds = (await Vote.find({user_id: userId}));
        console.log("Deleted all votes");
      } catch(err) {
        console.log("Fetching vote_id error: "+err);
        return res.status(401).json({response: "Fetching vote_id error: "+err});
      }

      //Delete all user votes in codeblocks and comments
      if(voteIds.length > 0) {
        try {
          (await CodeSnippet.deleteMany({vote_ids: voteIds}));
          (await Comment.deleteMany({vote_ids: voteIds}));
        } catch (err) {
          console.log("Error deleting vote_ids"+err);
          return res.status(401).json({response: "Deleting vote_ids error: "+err});
        }
      }

      //Delete all Vote entries (need to use deleteMany)
      try {
        (await Vote.deleteMany({user_id: userId}));
        console.log("Deleted all votes");
      } catch(err) {
        console.log("Vote delete error: "+err);
        return res.status(401).json({response: "Vote delete error: "+err});
      }

      //Delete all Comment entries (need to use deleteMany)
      try {
        (await Comment.deleteMany({user_id: userId}));
        console.log("Deleted all comments");
      } catch(err) {
        console.log("Comment delete error: "+err);
        return res.status(401).json({response: "Comment delete error: "+err});
      }

      //Delete all CodeSnippet entries (need to use deleteMany)
      try {
        (await CodeSnippet.deleteMany({user_id: userId}));
        console.log("Deleted all codesnippets");
      } catch(err) {
        console.log("CodeSnippet delete error: "+err);
        return res.status(401).json({response: "CodeSnippet delete error: "+err});
      }

      //finally, remove the User profile (since userId is unique deleteOne should suffice)
      try {
        (await User.deleteOne({_id: userId}));
        console.log("Removed the user profile.");
      } catch(err) {
        console.log("User delete error: "+err);
        return res.status(401).json({response: "User delete error: "+err});
      }
    } else {
      return res.status(401).json({response: "user_id not found"});
    }

    console.log("User '"+userEmail+"' removed successfully.");
    return res.status(200).redirect("/admin/list_users"); //.json({response: "User '"+userId+ "', '"+email+"' deleted succesfully"});
});


//get user avatar image
router.get('/user/avatar', 
accessValidator(1,redirectOnUnAuth), 
async (req,res,next)=> {
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
    const userEmail = getFieldFromToken(req,"email");

    let user = null;
    try {
      user = (await User.findOne({email: userEmail}));
    } catch(err) {
      console.log("User not found: "+err);
    }

    const avatar = user["avatar"];
    if(avatar) {
        //convert to base64 based url
        const imgSrc = "data:"+avatar["mimetype"]+";base64," + Buffer.from(avatar["buffer"],'base64').toString('base64');

        res.status(200);
        //res.set({"content-type":avatar["mimetype"], "content-disposition":"inline"});
        res.send({"response": imgSrc});
    } else {
       res.status(401).send({response: "Avatar image not found"});
    }

});


//post user avatar image
router.post('/user/avatar', 
accessValidator(1,redirectOnUnAuth), //verify access
  upload.single('image'), //parse image
  async (req,res,next)=> {

  console.log("POST: /user/avatar");

    //find user id
    const userEmail = getFieldFromToken(req,"email");

  let user = null;
  try {
    user = (await User.findOne({email: userEmail}));
  } catch(err) {
    console.log("User not found: "+err);
  }

  //Assume that this incoming image is coming from the form-> file!
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

  //just in case it's needed: https://stackoverflow.com/questions/14573001/nodejs-how-to-decode-base64-encoded-string-back-to-binary
  //I only convert to base64 when a GET request is made

  if(req.file) {
      const new_avatar = {name: req.file["originalname"], 
                    encoding: req.file["encoding"], 
                    mimetype: req.file["mimetype"], 
                    buffer: req.file["buffer"],
                    updated_at: new Date()};
      try{
        const tmp = (await User.findByIdAndUpdate(
          user["_id"], 
          {avatar: new_avatar}));
      } catch(err) {
        console.log("Image update failed: "+err);
      }

  } else {
    return res.status(403).send("api.js /images/ POST error: No images to insert!");
  }
});



//

//admin page
//landing page
router.get('/admin/', 
accessValidator(3,redirectOnUnAuth), 
(req,res,next)=>{
    console.log("GET: /admin");
    const i18nextLng = i18next.language;
    console.log("admin_index.pug: "+i18nextLng);
    res.status(200);
    res.render('admin_index.pug',{i18nextLng});
});

//info
router.get('/admin/info', 
accessValidator(3,redirectOnUnAuth), 
(req,res,next)=>{
    console.log("GET: /admin/info");
    const i18nextLng = i18next.language;
    console.log("admin_info.pug: "+i18nextLng);
    res.status(200);
    res.render('admin_info.pug',{i18nextLng});
});


//statistics
router.get('/admin/statistics', 
accessValidator(3,redirectOnUnAuth), 
async (req,res,next)=>{
    console.log("GET: /admin/statistics");

    const i18nextLng = i18next.language;
    console.log("admin_statistics.pug: "+i18nextLng);


 /*
  Only admins can gain access to statistics
  -user counts
  -counts by role
  -number of posts
  -number of comments
  -pct positive votes
  -pct negative votes
  */

  //https://www.sitepoint.com/getting-started-anychart-examples/
  //https://codepen.io/SitePoint/pen/zwpOGM
  //https://stackoverflow.com/questions/68430905/how-to-chain-queries-to-mongodb-database-mongoose-based-on-condition
  //https://www.sitepoint.com/getting-started-anychart-examples/
  //https://stackoverflow.com/questions/41791015/mongoose-group-and-count
  //https://stackoverflow.com/questions/12451575/how-to-count-records-with-one-distinct-field-in-mongoose
  //https://stackoverflow.com/questions/41968058/how-to-pass-an-object-from-pug-to-front-end-javascript
  //https://stackoverflow.com/questions/70050199/how-to-pass-variable-from-js-to-pug
  //https://stackoverflow.com/questions/38044237/node-js-pass-a-variable-to-jade-pug
  //https://docs.anychart.com/Working_with_Data/Data_From_JSON
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
  //https://codepen.io/SitePoint/pen/Emojgr
  //https://www.freecodecamp.org/news/how-to-loop-through-an-array-in-javascript-js-iterate-tutorial/
  //https://stackoverflow.com/questions/68430905/how-to-chain-queries-to-mongodb-database-mongoose-based-on-condition
  //https://stackoverflow.com/questions/14348516/cascade-style-delete-in-mongoose
  //https://stackoverflow.com/questions/22119673/find-the-closest-ancestor-element-that-has-a-specific-class
  //https://stackoverflow.com/questions/69329591/how-do-you-check-if-a-button-has-been-pressed-in-html-php

  //https://stackoverflow.com/questions/17809056/how-to-add-additional-fields-to-form-before-submit

  //pug & pagination
  //https://medium.com/@pprachit09/pagination-using-mongoose-express-and-pug-7033cb487ce7
  //https://gist.github.com/Alexzanderk/06da7ccbe358036c0b623782d27c40c9
  //https://biodunalfet.github.io/jade-boostrap-pagination/
  //https://www.frontendplanet.com/make-pagination-css-js/


  //make logout button look like the others
  //https://www.w3schools.com/css/tryit.asp?filename=trycss_form_button


  //popup login
  //https://foolishdeveloper.com/how-to-create-a-popup-login-form-using-only-css-html/

  //https://www.w3schools.com/css/css_border.asp
  //https://developer.mozilla.org/en-US/docs/Web/CSS/display

  //i18 
  //https://codeburst.io/translating-your-website-in-pure-javascript-98b9fa4ce427
  //https://dev.to/sarahokolo/mastering-internationalization-and-localization-in-javascript-a-comprehensive-guide-50ma
  //https://stackoverflow.com/questions/42020888/how-to-use-i18n-variables-in-pug-template-files
  //https://medium.com/geekculture/how-does-server-side-internationalization-i18n-look-like-6ddbd15147b7
  //https://stackoverflow.com/questions/47745517/how-to-use-i18n-in-pug-template

  //https://gist.github.com/brettz9/6e3a7ca5b0d4f217fad723c3e352ac63
  //https://github.com/sarkiroka/pug-i18n-postparse
  //https://semgrep.dev/advisory/npm-package/pug-i18n-postparse
  //https://www.npmjs.com/package/i18n-x
  //https://stackoverflow.com/questions/9615951/i18n-with-express-jade-strings-with-embedded-tags-and-interpolation
  
  //https://rbeere.tumblr.com/post/41212250036/internationalization-with-express-jade-and
  //https://github.com/rbeere/i18next-jade-express-sample

  //https://www.i18next.com/overview/getting-started

  let statistics = {};
  let anyChartCompliant = {}


  /*
  posts counts
  */
  //codesnippets
  //comments

  /*
  role counts
  */
  //counts by user
  let roles_counts = null;
  try {
    //get roles
    let roles = (await Role.find({}));
    var total_count = 0;
    roles_counts = {};
    //user counts by role
    for(var i = 0; i < roles.length; i++) {
      const count = (await User.countDocuments({role_id: roles[i]["id"]}));
      console.log("role: "+roles[i]["name"]+", "+count);
      roles_counts[roles[i]["name"]] = count;
      total_count += count;
    }
    roles_counts["total"] = total_count;
  } catch(err) {
    console.log("Roles count failed: "+err);
    return res.status(401).json({response: "Roles count failed: "+err});
  }
  statistics["roles_counts"] = roles_counts;
  //

  /*
  snippet and comment counts
  */

  /*
  vote counts
  */
  //total direction counts
  let votes_counts = null;
  var total_count = 0;
  const voteDirections = ['up','down'];
  try {
    var total_count = 0;
    votes_counts = {};
    for(const voteDir of voteDirections) {
      let count = (await Vote.countDocuments({vote: voteDir}));
      //if(count) {count = 0;}
      //console.log("Vote direction: "+voteDir+", "+count);
      votes_counts[voteDir] = count;
      total_count += count;
    }
    //votes_counts["total"] = total_count;
  } catch(err) {
    console.log("Vote count failed: "+err);
    return res.status(401).json({response: "Vote count failed: "+err});
  }
  statistics["votes_counts"] = votes_counts;
  console.log("votes_counts: "+JSON.stringify(statistics["votes_counts"]));
  //

  //vote direction counts by codesnippet
  votes_counts = null;
  total_count = 0;
  try {
    total_count = 0;
    votes_counts = {};
    let codeSnippets = (await CodeSnippet.find({}));
    for(var i=0; i<codeSnippets.length; i++) {
      for(const voteDir of voteDirections) {
        const vote_ids = codeSnippets[i]["vote_ids"];
        //chain the queries here
        //let count = (await Vote.find({_id: vote_ids}));
        let count = Vote.find({_id: vote_ids});
        count = (await count.countDocuments({vote: voteDir}));
        //console.log("CodeSnippet, Vote direction: "+voteDir+", "+count);
        if(i==0) {
          votes_counts[voteDir] = count;
        } else {
          votes_counts[voteDir] += count;
        }
        total_count += count;
      }
    }
  } catch(err) {
    console.log("Vote count failed: "+err);
    return res.status(401).json({response: "Vote count failed: "+err});
  }
  statistics["codesnippet_votes_counts"] = votes_counts;
  //

  //vote direction counts by comment
  votes_counts = null;
  total_count = 0;
  try {
    total_count = 0;
    votes_counts = {};
    let comments = (await Comment.find({}));
    for(var i=0; i<comments.length; i++) {
      for(const voteDir of voteDirections) {
        const vote_ids = comments[i]["vote_ids"];
        //console.log("Comment["+i+"]: "+vote_ids);

        let count = Vote.find({_id: vote_ids});
        count = (await count.countDocuments({vote: voteDir}));
        //console.log("Comment, Vote direction: "+voteDir+", "+count);

        if(i==0) {
          votes_counts[voteDir] = count;
        } else {
          votes_counts[voteDir] += count;
        }
        total_count += count;
      }
    }
  } catch(err) {
    console.log("Vote count failed: "+err);
    return res.status(401).json({response: "Vote count failed: "+err});
  }
  statistics["comment_votes_counts"] = votes_counts;
  //

  //user privileges
  res.status(200).render("admin_statistics.pug",{statistics,i18nextLng});
});







//change user info including role
router.post("/admin/user/",
accessValidator(3,redirectOnUnAuth), 

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

  async(req, res)=>{
  console.log("POST: /admin/user");

  //console.log("SERVER SIDE: user_id: "+req.body.user_id+ ", password: "+req.body.password+ ", roleName: "+req.body.roleName);


  //get old values 
  const user_old = (await getUser({_id: req.body.user_id}))[0];

  //update new avatar
  const image = req.file;
    let new_avatar = {};
    if(image) {
      new_avatar = {
        name: image["originalname"],
        encoding: image["encoding"],
        mimetype: image["mimetype"],
        buffer: image["buffer"]
      };
    }
    
  let hash = null;
  const saltRounds = 10;
  if(req.body.password) {
    try {
      hash = (await bcrypt.hash(req.body.password, saltRounds));
    } catch(err) {
      console.log("Error in bcrypt: "+err);
      return res.status(401).json({response: "Error in bcrypt: "+err});
    } 
  } else {
    hash = user_old["password"]; 
  }
  console.log("new hash: "+hash);

  //update role
  let role = null;
  try {
    role = (await Role.findOne({name: req.body.roleName}));
  }catch(err) {
    console.log("Error getting Role: "+err);
    return res.status(401).json({response: "Error getting Role: "+err});
  }
  

  const userId = req.body.user_id;
  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    nickName: req.body.nickName,
    bio: req.body.bio,
    email: req.body.email,
    password: hash,
    role_id: role["_id"],
    avatar: new_avatar,
    updated_at: new Date()
  }

  console.log("new user: "+JSON.stringify(user));

  try{
    const tmp = (await User.findByIdAndUpdate(userId,user));
  } catch(err) {
    console.log("Update failed: "+err);
    return res.status(401).json({response: "User data update failed"});
  }
  //res.status(200).json({response: "User data update successful"});
  res.status(200).redirect("/admin/list_users");

});


//list users
router.get('/admin/list_users', 
accessValidator(3,redirectOnUnAuth), 
async(req,res,next)=>{
    console.log("GET: /admin/list_users");
    const i18nextLng = i18next.language;
    console.log("admin_list_users.pug: "+i18nextLng);

    //get all users
    let users = null;
    try{
      users = (await User.find({}));
    } catch (err) {
      return res.status(401).json({ response: "Error fetching users: "+err});
    }

    console.log("Found " +users.length+" users.");

    if(users) {
      for(var i=0; i<users.length; i++) {
          if(users[i]["avatar"]["buffer"]) {

            //get image base64
            const imgBuffer = users[i]["avatar"]["buffer"];

            const imgUrl = "data:" +users[i]["avatar"]["mimetype"]+ ";base64," +Buffer.from(users[i]["avatar"]["buffer"],'base64').toString('base64');
            //console.log(imgUrl)
            users[i]["imgSrc"] = imgUrl;

            // const imgBuffer = users[i]["avatar"]["buffer"];
            //const blob = new Blob(imgBuffer, { type: users[i]["avatar"]["mimetype"] });
            //users[i]["imgSrc"] = URL.createObjectURL(blob); //attach to img as src
            //console.log(users[i]["imgSrc"])

            //https://nodejs.dev/en/api/v18/url/
            //https://stackoverflow.com/questions/70943146/how-to-convert-buffer-to-base64-image-in-node-js
            //https://stackoverflow.com/questions/7650587/using-javascript-to-display-a-blob
          }
          
          //parse role
          let role = null;
          try {
            role = (await Role.findById(users[i]["role_id"]));
          } catch(err) {
            console.log("Error fetching Role: "+err);
            return res.status(401).json({response: "Error fetching Role: "+err});
          }
          users[i]["role_access"] = role["access"];
          users[i]["role_name"] = role["name"];
          console.log("user email: "+users[i]["email"]+", role name: "+ users[i]["role_name"]);

          //remove avatar from the result since it's no longer needed
          //delete users[i]["avatar"]; //not working!
        }
    }

     res.status(200).render("admin_list_users.pug", {users,i18nextLng})

});
//


/*
REMOVE THESE WHEN SHIPPING!
*/

//add roles
router.post('/admin/add_role', async (req,res,next)=>{
  console.log("POST: /admin/add_role");
  const new_role = {name: req.body["name"], access: parseInt(req.body["access"])};
  console.log("Creating role: "+JSON.stringify(new_role));
  if(req.body["name"] && req.body["access"]) {
    try {
      (await Role.create(new_role)); 
    } catch (err) {
      console.log("Added new role to DB!");
      return res.status(401).send({response: "Error at POST /admin/add_role: " +err});
    }
    return res.status(200).send({response: "OK"});
  } else {
    return res.status(401).send({response: "Body not found. Error at POST /admin/add_role"});
  }
});







//add users

module.exports = router