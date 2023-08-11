
if (document.readyState !== "loading") {
    initializeMainJS();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        initializeMainJS();
    });
}


function initializeMainJS() {
    console.log("Initializing main.js");

    //delete tokens
    /*
    (async() => {
        try {
            (await fetch('/logout',{method: "POST"}));
            localStorage.removeItem("auth_token");
            console.log("Tokens removed.");
            //window.location.replace('/');
        } catch(err) {
            console.log("Logout not successful. Token removal failed."+err);
            console.error("Logout not successful. Token removal failed."+err);
        }
    })();
    //
    */

    //logout button listener
    /*
    var logoutRef = document.getElementById("logout");
    if(logoutRef) { //does not work ATM!
        logoutRef.addEventListener("click", async (event)=>{
            event.preventDefault();
            const tmp = (await logout());
            removeToken();
            //postToken();
        });
    }
    */
    

    //functionality to collapsible comment box
    //https://www.w3schools.com/howto/howto_js_collapsible.asp
    document.body.addEventListener("click", (event) => { 
        const ref = event.target;
        if (ref.className === "expand-comment-box") {
            var commentBoxRef = ref.parentNode.children[1]; //"comment-box"
            //console.log(commentBoxRef);

            if(ref.getAttribute("toggled")==="false") {
                commentBoxRef.style.display = "none";
                ref.setAttribute("toggled","true");
            } else if(ref.getAttribute("toggled")==="true") {
                commentBoxRef.style.display = "block";
                ref.setAttribute("toggled","false");
            }
            
            //this.classList.toggle("active");
            /*
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
            */
        }

    });


    //search
    /*
    document.body.addEventListener("click", async(event)=> {
        if (event.target.className === "execute-search") {

            event.preventDefault();
            var ref = event.target;

            var searchRef = ref.parentNode.children[1];
            console.log(searchRef);

        }
    });
    */

    //user card popup
    document.body.addEventListener("mouseover" , (event)=>{
        if(event.target.className === "tooltip-nickName") {  //|| event.target.className === "tooltip-user-navbar") { //one card in codeblock_container.pug  and the other in main_navbar.pug
            const ref = event.target;
            //var userCardTooltipRef = ref.children[1];
            var userCardTooltipRef = ref.parentNode.children[1];
            console.log(userCardTooltipRef)
            //show: mixin user_card(contents,loggedInGroup)
            console.log("Show user card");
            userCardTooltipRef.style.display = "block";
        }

    });
    document.body.addEventListener("mouseout" , (event)=>{
        if(event.target.className === "tooltip-nickName") { // || event.target.className === "tooltip-user-navbar") { //one card in codeblock_container.pug and the other in main_navbar.pug
            const ref = event.target;
            //hide: mixin user_card(contents,loggedInGroup)
            //var userCardTooltipRef = ref.children[1];
            var userCardTooltipRef = ref.parentNode.children[1];
            console.log("Hide user card");
            userCardTooltipRef.style.display = "none";
        }


    });

    // https://stackoverflow.com/questions/19655189/javascript-click-event-listener-on-class
    
    /*
    document.body.addEventListener("click", async(event)=> {
        if (event.target.className === "submit-comment-form") {

            event.preventDefault();
            var ref = event.target;

            var parentForm = ref.parentNode.parentNode;
            var parentCommentBox = parentForm.parentNode;
            var parentCodeblockComments = parentCommentBox.parentNode;
            var parentCodeblockFeedback = parentCodeblockComments.parentNode;
            var parentCodeblockOuter = parentCodeblockFeedback.parentNode;
            var codeSnippetIdRef = parentCodeblockOuter.children[2].children[0];

            console.log("codeSnippetId: "+ codeSnippetIdRef.innerHTML);
            
            var titleRef = parentForm.children[1].children[0];
            var commentContentRef = parentForm.children[3].children[0];

            const comment = {title: titleRef.value, 
                            commentContent: commentContentRef.value,
                            codeSnippetId: codeSnippetIdRef.innerHTML};

            
            //var formData = new FormData();
            //formData.append("title", titleRef.value);
            //formData.append("commentContent", commentContentRef.value);
            //formData.append("codeSnippetId", codeSnippetIdRef.innerHTML);

            //console.log("CodeSnippetId: "+formData.get("codeSnippetId")+
            //            ", Title: "+formData.get("title")+
            //            ", Comment: "+formData.get("commentContent"));
            
            
            const tmp = (await postCommentData(comment));

            //empty form
            titleRef.value = "";
            commentContentRef.value = "";
        }
    });
    */
    //search bar functionality
    /*
    document.body.addEventListener("submit", async(event) => {
        if (event.target.className === "search") {

            event.preventDefault();
            var ref = event.target;
        }

    });
    */
}


//save language setting

function setLocale(locale) {
    try {
        console.log("Set locale: "+locale);
        localStorage.setItem('i18nextLng',locale);
    } catch (err) {
        console.log("Error setting locale: "+err);
    }
}

function getLocale() {
    try {
        console.log("Get locale: ");
        return localStorage.getItem('i18nextLng');
    } catch (err) {
        console.log("Error fetching locale: "+err);
        return null;
    }
}


//search query
/*
const postSearch = async function(query) {
    await fetch("http://localhost:3000/search/", {
        method: "POST", 
        //headers: {"content-type":"multipart/form-data"},
        body: JSON.stringify({query: })
    })
    .then((res)=>{return res})
    .catch((err)=>{console.log("Error sending register data: "+err)});
}
*/


//post comment data

const postCommentData = async function(comment) {
    await fetch("http://localhost:3000/user/codeblock/add_comment", {
        method: "POST", 
        //headers: {"content-type":"multipart/form-data"},
        headers: {"content-type":"application/json"},
        body: JSON.stringify(comment)
    })
    .then((res)=>{return res})
    .catch((err)=>{console.log("Error sending register data: "+err)});
}

/*
const postCommentData = async function(formData) {
    await fetch("http://localhost:3000/user/codeblock/add_comment", {
        method: "POST", 
        //headers: {"content-type":"multipart/form-data"},
        //headers: {"content-type":"application/json"},
        body: formData
    })
    .then((res)=>{return res})
    .catch((err)=>{console.log("Error sending register data: "+err)});
}
*/


/*
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
*/

//logout 
function removeToken() {
    try {
        localStorage.removeItem("auth_token");
        console.log("Loggin out. Token removed.");
        //window.location.replace('/');
    } catch {
        console.log("Logout not successful. Token removal failed.");
    }
}



/*
const logout = async function() {
    //body:  JSON.stringify({"token": token})
    await fetch("http://localhost:3000/logout", {
        method: "POST",
        //headers: {"content-type":"application/json"},
        body: {token: ""}
    })
    .then((res)=>{
        console.log("Logged out succesfully!");
        return res;
        //window.location.replace('/');
    })
    .catch((err)=>{console.log("Error logging out: "+err)})
}
*/



