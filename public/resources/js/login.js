
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
    document.getElementById("login-form").addEventListener("submit", function(event){
        event.preventDefault();
        sendLogin(event);
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


/*
TBA: async/await 
*/
//https://dmitripavlutin.com/javascript-fetch-async-await/
function sendLogin(event) {

    //clear previous errors
    //document.getElementById("login-error").innerHTML = '';
    
    //grab data from the form
    const formData = new FormData(event.target);

    fetch("http://localhost:3000/login", {
        method: "POST",
        body: formData
    })
        .then((response) => response.json())
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


