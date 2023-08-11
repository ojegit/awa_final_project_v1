

/*
//How to get the onclick calling object?
https://stackoverflow.com/questions/1553661/how-to-get-the-onclick-calling-object

//How can I get parent id by onclick on a child in js? [duplicate]
https://stackoverflow.com/questions/42213858/how-can-i-get-parent-id-by-onclick-on-a-child-in-js

//add rows to table dynamically and make content editable
https://stackoverflow.com/questions/16232554/add-rows-to-table-dynamically-and-make-content-editable

https://developer.mozilla.org/en-US/docs/Web/API/Node/parentNode

https://stackoverflow.com/questions/1391278/contenteditable-change-events

https://stackoverflow.com/questions/15993128/toggle-contenteditable-on-click

https://stackoverflow.com/questions/27662410/html-5-toggling-the-contenteditable-attribute-with-javascript
*/

if (document.readyState !== "loading") {
    initializeAdminListUsersJS();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        initializeAdminListUsersJS();
    });
}

function initializeAdminListUsersJS() {
    console.log("Initializing admin_list_users.js");




    //file input listener
    /*
    document.body.addEventListener('change', function (event) {
        var ref = event.target;
        if(ref.className = "admin-user-data-submit-file") {
            //need to add a listener to figure out if user wants to change the image (empty file doesn't still mean that)
            if (ref.value.length > 0) {
                ref.disabled = false;
                console.log("file input enabled");
            } else {
                ref.button.disabled = true;
                console.log("file input disabled");
            }
        }
    });
    */
   
    //register form listener
    document.body.addEventListener("click",  async (event)=>{
        var ref = event.target;


        if (ref.className === "admin-user-data-submit") {
            event.preventDefault();
            

            /*
            Closest element 
            https://stackoverflow.com/questions/22119673/find-the-closest-ancestor-element-that-has-a-specific-class

            Parent element
            https://www.w3schools.com/jsref/prop_node_parentelement.asp

            Parent node


            https://stackoverflow.com/questions/1085801/get-selected-value-in-dropdown-list-using-javascript
             
            */
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
            var roleNameRef = parentFormRef.querySelector("select[id=roleName]");
            var bioRef = parentFormRef.querySelector("textarea[id=bio]");
            var userAvatarRef = parentFormRef.querySelector("input[id=userAvatar]");
            

            console.log("userId: "+userIdRef.value+ ", password: "+passwordRef.value+ ", roleName: "+roleNameRef.value);

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
            formData.append("roleName", roleNameRef.value); //Note: get the value of the selector NOT the text

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

    /*
    document.body.addEventListener("click",  async (event)=>{
        var ref = event.target;
        if (ref.className === "admin-user-data-delete-submit") {
            event.preventDefault();
            //const proceed = confirm('Remove user profile and all posts?')
            var proceed = true;
            var parentFormRef = ref.parentNode.parentNode;
            console.log(parentFormRef);

            var userIdRef = parentFormRef.querySelector("input[type=hidden]");
            
            var formData = new FormData();
            formData.append("user_id", userIdRef.value);

            //post data
            const tmp = (await deleteUserData(formData));
        }
    });
    */

}

const deleteUserData = async function(formData) {
    await fetch("http://localhost:3000/admin/user/delete", {
        method: "POST", //"DELETE", 
        //headers: {"content-type":"multipart/form-data"},
        //headers: {"content-type":"application/json"},
        body: formData
    })
    .then((res)=>{return res})
    .catch((err)=>{console.log("Error sending delete user data form: "+err)});
}

const postUserData = async function(formData) {
    await fetch("http://localhost:3000/admin/user/", {
        method: "POST", 
        //headers: {"content-type":"multipart/form-data"},
        //headers: {"content-type":"application/json"},
        body: formData //JSON.stringify(formData)
    })
    .then((res)=>{return res})
    .catch((err)=>{console.log("Error sending post user data form: "+err)});
}

/*
Need to build a password strength verifier! If not then omit AND put route for the update which handles the verification
in the middleware and notifies the user by submitting errors!
https://stackoverflow.com/questions/50547523/how-can-i-use-javascript-to-test-for-password-strength-in-a-way-that-returns-the
*/

const updateUserData = async function(formData) {
    await fetch("http://localhost:3000/admin/user", {
        method: "POST", 
        //headers: {"content-type":"multipart/form-data"},
        //headers: {"content-type":"application/json"},
        body: formData
    })
    .then((res)=>{return res})
    .catch((err)=>{console.log("Error sending put data: "+err)});
}
