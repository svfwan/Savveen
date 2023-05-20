$(document).ready(function () {

    $(document).on('click', '#showAdminDashboard', function () {
        $('#mainView').load('sites/dashboard.html #adminDashboard');
    });
    // Handle button click events
    $(document).on('click', '#showProfileManagement', function () {
        loadSection('userManagement');
    });

    $(document).on('click', '#showProductManagement', function () {
        loadSection('productManagement');
    });

    $(document).on('click', '#showOrderManagement', function () {
        loadSection('orderManagement');
    });

    // helper functions

    function loadSection(sectionID) {
        // Empty the mainView section
        $('#mainView').empty();
        // Load the content of the corresponding section
        $('#mainView').load('sites/dashboard.html #' + sectionID);
    }
});
