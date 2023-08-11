

if (document.readyState !== "loading") {
    initializeUserInfoJS();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        initializeUserInfoJS();
    });
}

function initializeUserInfoJS() {
    console.log("Initializing user_info.js");

   
    //register form listener
    document.body.addEventListener("click",  async (event)=>{
        var ref = event.target;


        if (ref.className === "user-user-data-submit") {
            event.preventDefault();
  
            console.log(ref);

            //query the parent
            var parentFormRef = ref.parentNode.parentNode;
            console.log(parentFormRef);

            //get email reference from the form
            var userIdRef = parentFormRef.querySelector("input[type=hidden]");
            var firstNameRef = parentFormRef.querySelector("input[id=firstName]");
            var lastNameRef = parentFormRef.querySelector("input[id=lastName]");
            var emailRef = parentFormRef.querySelector("input[id=email]");
            var passwordRef = parentFormRef.querySelector("input[id=password]");
            var nickNameRef = parentFormRef.querySelector("input[id=nickName]");
            //var roleNameRef = parentFormRef.querySelector("select[id=roleName]");
            var bioRef = parentFormRef.querySelector("textarea[id=bio]");
            var userAvatarRef = parentFormRef.querySelector("input[id=userAvatar]");
            

            console.log("userId: "+userIdRef.value+ ", password: "+passwordRef.value); //+ ", roleName: "+roleNameRef.value);

            var formData = new FormData();
            formData.append("user_id", userIdRef.value);
            formData.append("firstName", firstNameRef.value);
            formData.append("lastName", lastNameRef.value);
            formData.append("nickName", nickNameRef.value);
            formData.append("bio", bioRef.value);
            formData.append("email", emailRef.value);
            if(passwordRef.value.length > 0) {
                formData.append("password", passwordRef.value);
            }
            //formData.append("roleName", roleNameRef.value); //Note: get the value of the selector NOT the text

            //one has to verify 
            if(userAvatarRef.value.length > 0) { //only inclue in submit if user has selected something
                var imgFiles = userAvatarRef.files; 
                if(imgFiles) {
                    for(var i = 0; i < imgFiles.length; i++) { //One has to do this ONE BY ONE or else it won't work!
                        formData.append("images", imgFiles[i]); 
                    }
                }
            }

            //post data
            const tmp = (await postUserData(formData));

            //empty form
            /*
            firstNameRef.value = "";
            lastNameRef.value = "";
            emailRef.value = "";
            passwordRef.value = "";
            nickNameRef.value = "";
            roleNameRef.value = "" //reset the selector
            imageInputRef.files = null;
            */
        }


      
    });

}


const postUserData = async function(formData) {
    await fetch("http://localhost:3000/user/info", {
        method: "POST", 
        //headers: {"content-type":"multipart/form-data"},
        //headers: {"content-type":"application/json"},
        body: formData//body: JSON.stringify(formData)
    })
    .then((res)=>{return res})
    .catch((err)=>{console.log("Error sending post user data form: "+err)});
}
