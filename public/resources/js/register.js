

if (document.readyState !== "loading") {
    initializeRegisterJS();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        initializeRegisterJS();
    });
}

function initializeRegisterJS() {
    console.log("Initializing register.js");

    var firstNameRef = document.getElementById("firstName");
    var lastNameRef = document.getElementById("lastName");
    var emailRef = document.getElementById("email");
    var passwordRef = document.getElementById("password");
    var nickNameRef = document.getElementById("nickName");
    var imageInputRef = document.getElementById("userAvatar");

    //register form listener
    document.getElementById("submitRegister").addEventListener("click",  async (event)=>{
        event.preventDefault();
        //

        var imgFiles = imageInputRef.files;
        var formData = new FormData();
        formData.append("firstName", firstNameRef.value);
        formData.append("lastName", lastNameRef.value);
        formData.append("nickName", nickNameRef.value);
        formData.append("email", emailRef.value);
        formData.append("password", passwordRef.value);

        if(imgFiles) {
            for(var i = 0; i < imgFiles.length; i++) { //One has to do this ONE BY ONE or else it won't work!
                formData.append("images", imgFiles[i]); 
            }
        }

        //post data
        //const tmp = (await postUserData(formData));
        const tmp = (await postUserData2(formData)); 

        //empty form
        firstNameRef.value = "";
        lastNameRef.value = "";
        emailRef.value = "";
        passwordRef.value = "";
        nickNameRef.value = "";
        imageInputRef.files = null;
    });
}

async function postUserData2(formData) {

    var errSendTarget = document.getElementsByClassName("register-express-validator-errors")[0];
    errSendTarget.innerHTML = ""; //clear old errors

    //clear previous errors
    //document.getElementById("login-error").innerHTML = '';
    
    //grab data from the form
    let res = null;
    try {
        res = (await fetch("http://localhost:3000/register", {
            method: "POST",
            body: formData
        }));
    } catch(err) {
        console.log("Error post register: "+err);
    }

    //if the express-validator returned any errors then send them back to the login page
    if(res.status==(422+0)) {
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
    } else {
        window.location.replace('/');
    }
}



const postUserData = async function(formData) {
    await fetch("http://localhost:3000/register", {
        method: "POST", 
        //headers: {"content-type":"multipart/form-data"},
        //headers: {"content-type":"application/json"},
        body: formData
    })
    .then((res)=>{return res})
    .catch((err)=>{console.log("Error sending register data: "+err)});
}
