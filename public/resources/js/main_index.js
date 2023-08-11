if (document.readyState !== "loading") {
    initializeMainIndexJS();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        initializeMainIndexJS();
    });
}

/*
Rudimentary implementation:
-all code snippets are in a table,
-all comments of a code are in a subtable of this table: adding new comment simply adds a new row
-user restriction: the route for adding new rows is denied for those withut access, 
*/

function initializeMainIndexJS() {
    console.log("Initializing main_index.js");

}


