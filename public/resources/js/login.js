
if (document.readyState !== "loading") {
    initializeLoginJS();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        initializeLoginJS();
    });
}

function initializeLoginJS() {
    console.log("Initializing login.js");

    //login form listener
    document.getElementById("login-form").addEventListener("submit", async function(event){
        event.preventDefault();
        //(await sendLogin(event));
        (await sendLogin2(event));
    });
}


function storeToken(token) {
    try {
        localStorage.setItem("auth_token", token);
        console.log("Saved a token.");
    } catch {
        console.log("Error! Could not save the token.");
    }
}



async function sendLogin2(event) {

    var errSendTarget = document.getElementsByClassName("login-express-validator-errors")[0];
    errSendTarget.innerHTML = ""; //clear old errors

    //clear previous errors
    //document.getElementById("login-error").innerHTML = '';
    
    //grab data from the form
    let res = null;
    const formData = new FormData(event.target);
    try {
        res = (await fetch("http://localhost:3000/login", {
            method: "POST",
            body: formData
        }));
    } catch(err) {
        console.log("Error post login: "+err);
    }

    //if the express-validator returned any errors then send them back to the login page
    if(res.status==(422+0)) {
        //window.location.href="/login"; //not sending the body!

        //send the errors back
        /*
        const evErrors = (await res.json())["errors"];
        console.log("Send errors back to /login");
        try {
            (await fetch("http://localhost:3000/login", {
                method: "GET",
                headers: {"errors": JSON.stringify(evErrors)}
            }))
        } catch (err) {
            console.log("Error get login: "+err);
        }
        */

        //render directly to the document
        const evErrors = (await res.json())["errors"];


        for(var i=0;i<evErrors.length; i++) {
            const div = document.createElement("div");
            const p = document.createElement("p");
            p.innerHTML = "#"+(i+1)+": " +evErrors[i]["msg"];
            div.append(p);
            errSendTarget.append(div);
        }
        console.log(evErrors);

    //if no errors occurred then attempt to save the token to localStorage
    } else {
        const data = (await res.json());
        console.log(data);
        if(data.token) {
            try {
                storeToken(data.token);
                console.log("Stored a token to localStorage as 'auth_token'.");
            } catch {
                console.log("Failed to store the token to localStorage.");
            }
            window.location.replace('/');
        }
    }
}
/*
TBA: async/await 
*/
//https://dmitripavlutin.com/javascript-fetch-async-await/
async function sendLogin(event) {

    //clear previous errors
    //document.getElementById("login-error").innerHTML = '';
    
    //grab data from the form
    const formData = new FormData(event.target);

    await fetch("http://localhost:3000/login", {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then((data) => {
            console.log(data);
            if(data.token) {
                try {
                    storeToken(data.token);
                    console.log("Stored a token to localStorage as 'auth_token'.");
                } catch {
                    console.log("Failed to store the token to localStorage.");
                }

                //redirect if token saved successfully
                //window.location.href="/",true;
                //window.location.href="/",false;
                window.location.replace('/');

            } else {
                if (data.message) {
                    //document.getElementById("login-error").innerHTML = data.message;
                }  else {
                    //document.getElementById("login-error").innerHTML = "Very strange error!";
                }
            }

        })
}


