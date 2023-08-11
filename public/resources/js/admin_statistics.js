if (document.readyState !== "loading") {
    initializeAdminStatisticsJS();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        initializeAdminStatisticsJS();
    });
}

function initializeAdminStatisticsJS() {
    console.log("Initializing admin_statistics.js");
}
