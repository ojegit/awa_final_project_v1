if (document.readyState !== "loading") {
    initializeAdminJS();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        initializeAdminJS();
    });
}

function initializeAdminJS() {
    console.log("Initializing admin.js");

}


//update request
async function updateUserData(user) {
    await fetch("http://localhost:3000/user/update", {
            method: "UPDATE",
            body: JSON.stringify(user)
        })
    .then((res)=>{return res;})
    .catch((err)=>{console.log("Error sending register data: "+err);});
}





