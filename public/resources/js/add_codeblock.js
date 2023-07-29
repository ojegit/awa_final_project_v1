if (document.readyState !== "loading") {
    initializeAddCodeblockJS();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        initializeAddCodeblockJS();
    });
}

function initializeAddCodeblockJS() {
    console.log("Initializing login.js");

    //login form listener
    document.getElementById("submit-add-codeblock").addEventListener("click", function(event){ //document.getElementById("add-codeblock-form").addEventListener("submit", function(event){
        sendCodeBlock(event);
    });
}


function sendCodeBlock(event) {

    /*
    FOR SOME REASON THIS FORM DOESN'T WORK OUT OF THE BOX EVEN THOUGH IT'S
    THE EXACT SAME AS IN login.js-> have to manually get contents and append to formData
    */

    //clear previous errors
    //document.getElementById("login-error").innerHTML = '';
    
    //grab data from the form
    event.preventDefault();
    const titleRef = document.getElementById("user-add-title");
    const codeRef = document.getElementById("user-add-code");
    console.log("title:"+titleRef.value+", code: "+codeRef.value);
    
    
    fetch("http://localhost:3000/user/add_codeblock", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({title: titleRef.value, code: codeRef.value})
    })
        //.then((response) => response.json())
        .then((res) => {
            if(res) {
                console.log("Submitted codeblock: "+res);

                if(res.status == 200) {
                    titleRef.value = "";
                    codeRef.value = "";
                }
            }
        })
        .catch((err)=>{console.log("Error submitting codelblock: "+err);});
}