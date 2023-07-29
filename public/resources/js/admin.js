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

function addEditButtons(){}