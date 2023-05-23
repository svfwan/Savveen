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
        let productName = $('#productNameAdd').val();
        let price = $('#priceAdd').val();
        let stock = $('#stockAdd').val();
        let description = $('#descriptionAdd').val();
        let picture = document.getElementById('pictureAdd').files[0];

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
        formData.append('method', 'createProduct');
        formData.append('category', category);
        formData.append('productName', productName);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('description', description);
        console.log(formData.get('description'));
        formData.append('picture', picture, picture.name);

        // Send data to the backend using AJAX
        $.ajax({
            type: 'POST',
            url: '../Backend/logic/requestHandler.php', // Replace with the actual PHP file that handles the form submission
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.success) {
                    // empty the input fields
                    $('#categoryAdd option:first').prop('selected', true);
                    $('#productNameAdd').val('');
                    $('#priceAdd').val('');
                    $('#stockAdd').val('');
                    $('#descriptionAdd').val('');
                    $('#pictureAdd').val('');
                    showAlert(response.success, 'success');
                    loadProductsForAdmin();
                } else {
                    showAlert(response, 'warning');
                }
            },
            error: function () {
                showAlert('Produkt konnte nicht erstellt werden', 'danger');
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