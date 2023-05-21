$(document).ready(function () {

    $(document).on('click', '#showAdminDashboard', function () {
        $('#mainView').load('sites/dashboard.html #adminDashboard');
    });

    $(document).on('click', '#showProfileManagement', function () {
        loadSection('userManagement');
        //loadUsersForAdmin();
    });

    $(document).on('click', '#showProductManagement', function () {
        loadSection('productManagement');
        loadProductsForAdmin();
    });

    $(document).on('click', '#createProduct', function () {
        createProduct();
    });

    $(document).on('click', '#showOrderManagement', function () {
        loadSection('orderManagement');
        //loadOrdersForAdmin();
    });

    // ajax call for loading products for admin

    function loadProductsForAdmin() {
        $.ajax({
            type: 'GET',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'loadProductsForAdmin',
            },
            dataType: 'json',
            success: function (response) {
                console.log(response);
            },
            error: function (error) {
                console.log(error);
            },
        });
    }

    // ajax call for creating product
    function createProduct() {
        // Get form input values
        let category = $('#categoryAdd').val();
        console.log(category)
        let productName = $('#productNameAdd').val();
        console.log(productName)
        let price = $('#priceAdd').val();
        console.log(price)
        let stock = $('#stockAdd').val();
        console.log(stock)
        let description = $('#descriptionAdd').val();
        console.log(description)
        let picture = $('#pictureAdd')[0].files[0];
        console.log(picture)

        // Perform validation
        if (!category || !productName || !price || !stock || !description || !picture) {
            showAlert('Bitte füllen Sie alle Felder aus!', 'warning');
            return;
        }

        if (isNaN(price) || isNaN(stock) || price < 0 || stock < 0) {
            showAlert('Preis und Lagerbestand müssen valide Zahlen sein!', 'warning');
            return;
        }

        let formData = new FormData();
        formData.append('category', category);
        formData.append('productName', productName);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('description', description);
        formData.append('picture', picture);

        // Send data to the backend using AJAX
        $.ajax({
            type: 'POST',
            url: '../Backend/logic/requestHandler.php', // Replace with the actual PHP file that handles the form submission
            data: {
                method: 'createProduct',
                param: formData
            },
            processData: false,
            contentType: false,
            success: function (response) {
                // Handle the response from the backend
                console.log(response);
                //showAlert(response.success, 'success')
                loadProductsForAdmin();
            },
            error: function (error) {
                // Handle the error
                console.log(error);
            }
        });
    }

    // helper functions

    function loadSection(sectionID) {
        // Empty the mainView section
        $('#mainView').empty();
        // Load the content of the corresponding section
        $('#mainView').load('sites/dashboard.html #' + sectionID);
    }
});