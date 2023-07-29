

const jwt = require("jsonwebtoken");
const Role = require("../models/Role");
const User = require("../models/User");


let access_validator = {
    access: 1,
    validatedAccess: (new_access)=>{
        this.access = new_access; 
        return access_validator;
    },
    getAccess: ()=>{return this.access;},
    setAccess:  (new_access)=>{this.access = new_access;},

    validate: (req, res, next) => {
        console.log("Validating token:");
        //const authHeader = req.headers["Authorization"] || req.headers["authorization"];
        //console.log(authHeader);
        
        /*
        let token;
        if(authHeader) {
            token = authHeader.split(" ")[1];
        } else {
            token = null;
        }
        */
        const token = req.cookies.token ? req.cookies.token : null;
        console.log(token);

        if(token == null) return res.sendStatus(401); //token is null
        console.log("Token found");
        jwt.verify(token, process.env.SECRET,  async (err, user) => {
            console.log("Validating access:");

            //verify access
            const userEmail = JSON.parse(atob(token.split('.')[1]))["email"];
            let resUser = null;
            try {
                resUser = (await User.findOne({email: userEmail}));
            } catch (err) {
                console.log("Access denied: "+err);
                return res.status(401).json({response: "Access denied"});//.json({response: "User not found"});
            }
    
            if(resUser) {
                let role = null;
                try {
                    role = (await Role.findOne({_id: resUser["_id"]}));
                } catch (err) {
                    console.log("Access denied: "+err);
                    return res.status(401).json({response: "Access denied"});//.json({response: "Role not found"});
                }

                //check access level
                if(this.access < resUser.access) {
                    console.log("Access denied: access level too low");
                    return res.status(401).json({response: "Access denied"});
                } else {
                    console.log("Access granted");
                }
            } else {
                return res.status(401).json({response: "Access denied"});
            }
    
            //if(err) return res.sendStatus(403); //token doesn't match
            if(err) return res.status(401).json({response: "Access denied"});//.end();
            req.user = user;
            next();
        });
    }

}


module.exports = access_validator;


/*
module.exports = function(req, res, next) {
    //const authHeader = req.headers["Authorization"] || req.headers["authorization"]; //undefined!?
    console.log("Validating token:");
    const token = req.cookies.token ? req.cookies.token : null;
    console.log(token);
    if(token == null) return res.sendStatus(401); //token is null
    console.log("Token found");
    jwt.verify(token, process.env.SECRET,  async (err, user) => {

        //verify access
        const userEmail = JSON.parse(atob(token.split('.')[1]))["email"];
        const user = null;
        try {
          user = (await User.findOne({email: userEmail}));
        } catch (err) {
          console.log(err);
        }

        if(user) {

            let roleId = null;
            try {
                roleId = (await Role.findOne({name: "basic"}))["_id"];
            } catch (err) {
                console.log(err);
            }

        }

        //if(err) return res.sendStatus(403); //token doesn't match
        if(err) return res.status(401).end();
        req.user = user;
        next();
    });    
};
*/