

const jwt = require("jsonwebtoken");
const Role = require("../models/Role");
const User = require("../models/User");


const accessValidator = (requiredAccess, redirectAddress) => {
    return (req, res, next) => { //returns a response
        console.log("Validating token:");

        const token = req.cookies.token ? req.cookies.token : null;
        console.log(token);

        if(token == null) {
            //token is null
            console.log("Access denied: token is null");
            if(redirectAddress) {
                //return res.redirect(401,redirectAddress);
                return res.status(401).redirect(redirectAddress);
            } else {
                return res.sendStatus(401); 
            }
        }
        console.log("Token found");
        jwt.verify(token, process.env.SECRET,  async (err, user) => {
            console.log("Validating access:");

            //verify access
            const userEmail = JSON.parse(atob(token.split('.')[1]))["email"];
            console.log("userEmail: "+userEmail);
            let resUser = null;
            let userAccessLevel = null;
            try {
                resUser = (await User.findOne({email: userEmail}));
                userAccessLevel = (await Role.findById(resUser["role_id"]))["access"];
            } catch (err) {
                console.log("Access denied: "+err);
                if(redirectAddress) {
                    //return res.redirect(401,redirectAddress);
                    return res.status(401).redirect(redirectAddress);
                } else {
                    return res.sendStatus(401); 
                }
            }
    
            if(resUser && userAccessLevel) {
                //check access level
                console.log("Required access: " +requiredAccess+", User access: "+userAccessLevel);
                if(userAccessLevel >= requiredAccess) {
                    console.log("Access granted");
                } else {
                    console.log("Access denied: access level too low");
                    if(redirectAddress) {
                        //return res.redirect(401,redirectAddress);
                        return res.status(401).redirect(redirectAddress);
                    } else {
                        return res.sendStatus(401); 
                    }
                }
            } else {
                if(redirectAddress) {
                    //return res.redirect(401,redirectAddress);
                    return res.status(401).redirect(redirectAddress);
                } else {
                    return res.sendStatus(401); 
                }
            }
    
            //if(err) return res.sendStatus(403); //token doesn't match
            if(err) {
                if(redirectAddress) {
                    //return res.redirect(403,redirectAddress);
                    return res.status(403).redirect(redirectAddress);
                } else {
                    return res.sendStatus(403); 
                }
            }
            req.user = user;
            next();
        });
    }
}

const isValidated = (requiredAccess) => {
    return (req,res,next) => { //returns a boolean
        console.log("Validating token:");
        const token = req.cookies.token ? req.cookies.token : null;
        console.log(token);

        if(token == null) return false; //token is null
        console.log("Token found");
        jwt.verify(token, process.env.SECRET,  async (err, user) => {
            console.log("Validating access:");

            //verify access
            const userEmail = JSON.parse(atob(token.split('.')[1]))["email"];
            console.log("userEmail: "+userEmail);

            let resUser = null;
            let userAccessLevel = null;

            try {
                resUser = (await User.findOne({email: userEmail}));
                userAccessLevel = (await Role.findById(resUser["role_id"]))["access"]; //true access level
            } catch (err) {
                console.log("Access denied: "+err);
                return false;
            }
    
            if(resUser) {
                //check access level
                console.log("Required access: " +requiredAccess+", User access: "+userAccessLevel);
                if(userAccessLevel >= requiredAccess) {
                    console.log("Access granted");
                } else {
                    console.log("Access denied: access level too low");
                    return false;
                }
            } else {
                return false;
            }

            //req.user = user;
            //next();
        });
        return true;
    }
}

module.exports = {isValidated, accessValidator};