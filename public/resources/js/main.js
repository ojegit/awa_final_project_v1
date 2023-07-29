
//navigate to user/:id

() => {
    var userNavigation = document.getElementById("user"); //change names of these hrefs!
}

if (document.readyState !== "loading") {
    initializeMainJS();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        initializeMainJS();
    });
}


function initializeMainJS() {
    console.log("Initializing main.js");

    //logout button listener
    const logoutRef = document.getElementById("logout");
    if(logoutRef) {
        logoutRef.addEventListener("click", (event)=>{
            //event.preventDefault();
            logout();
            //postToken();
        });
    }

    main_navbar_visibility();
}

function main_navbar_visibility() {
    const token = localStorage.getItem("auth_token");
    const userRef = document.getElementById("user");
    const registerRef = document.getElementById("register");
    if(token) {
        registerRef.style.display = 'none';
    } else {
        registerRef.style.display = 'visible';
    }
    
}

//logout 
function logout() {
    try {
        localStorage.removeItem("auth_token");
        console.log("Loggin out. Token removed.");
        window.location.replace('/');
    } catch {
        console.log("Logout not successful. Token removal failed.");
    }
}


/*
function logout() {
    //body:  JSON.stringify({"token": token})
    fetch("http://localhost:3000/logout", {
        method: "GET",
        //body: {"Access-Control-Allow-Origin": "*"}
    })
    .then((response) => response.json())
    .then(()=>{
        console.log("Logged out succesfully!");
        window.location.replace('/');
    })
    .catch((err)=>{console.log("Error logging out: "+err)})
}
*/

