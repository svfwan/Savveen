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

    $(document).on('click', '#editProduct', function () {
        let productID = $(this).data('product-id');
        loadProductByID(productID);
    });

    $(document).on('click', '#updateProduct', function () {
        updateProduct();
    });

    // need to implement deleteProduct()
    $(document).on('click', '#deleteProduct', function () {
        let id = $('#productID').val();
        deleteProduct(id);
    })

    // ajax call for loading products for admin

    function loadProductsForAdmin() {
        $.ajax({
            type: 'GET',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'loadAllProducts',
            },
            dataType: 'json',
            success: function (response) {
                let $productListAdmin = $('#productListAdmin');
                $productListAdmin.empty();
                let $row = $('<div class="row"></div>');

                for (let i = 0; i < response.length; i++) {
                    let product = response[i];

                    let productCardHTML = `
                        <div class="col-sm-6 col-md-4 col-lg-3">
                            <div class="product card product-card">
                                <div class="card-img-container">
                                    <div class="img-wrapper">
                                        <img src="../Frontend/res/img/${product.name}.jpg" class="card-img-top product-img" alt="${product.name}">
                                    </div>
                                </div>
                                <div class="card-body product-card-body">
                                    <h5 class="card-title">${product.name}</h5>
                                    <button id="editProduct" class="btn btn-success" data-product-id="${product.id}"">Bearbeiten</button>
                                </div>
                            </div>
                        </div>
                    `;

                    $row.append(productCardHTML);

                    if ((i + 1) % 4 === 0 || i === response.length - 1) {
                        $productListAdmin.append($row);
                        $row = $('<div class="row"></div>');
                    }
                }
            },
            error: function (error) {
                console.log(error);
            }
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

    function loadProductByID(productID) {
        $.ajax({
            type: 'GET',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'loadProductByID',
                param: productID
            },
            dataType: 'json',
            success: function (response) {
                // Handle the response and update the modal with the product data
                if (response.success) {
                    let product = response.data;
                    showEditModal(product);
                } else {
                    // Show an error message if the product was not found or there was an error
                    showAlert('Produkt konnte nict geladen werden!', 'danger');
                }
            },
            error: function (error) {
                console.log(error);
                // Show an error message if there was an error with the AJAX request
                showAlert('Fehler bei der Abfrage des Produkts!', 'danger');
            }
        });
    }

    // ajax call for updating product
    function updateProduct() {
        let productID = $('#productID').val();
        let category = $('#categoryEdit').val();
        let productName = $('#productNameEdit').val();
        let price = $('#priceEdit').val();
        let stock = $('#stockEdit').val();
        let description = $('#descriptionEdit').val();
        let picture = document.getElementById('pictureEdit').files[0];

        // Perform validation
        if (!category || !productName || !price || !stock || !description) {
            showModalAlert('Bitte füllen Sie alle Felder aus!', 'warning');
            loadProductByID(productID);
            return;
        }

        if (isNaN(price) || isNaN(stock) || price < 0 || stock < 0) {
            showModalAlert('Preis und Lagerbestand müssen valide Zahlen sein!', 'warning');
            loadProductByID(productID);
            return;
        }

        let formData = new FormData();
        formData.append('method', 'updateProduct');
        formData.append('productID', productID,);
        formData.append('category', category);
        formData.append('productName', productName);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('description', description);
        if (picture) {
            formData.append('picture', picture, picture.name);
        }

        // Send data to the backend using AJAX
        $.ajax({
            type: 'POST',
            url: '../Backend/logic/requestHandler.php',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.success) {
                    showModalAlert(response.success, 'success');
                    loadProductByID(productID);
                    loadProductsForAdmin();
                } else if (response.error) {
                    showModalAlert(response.error, 'warning');
                }
            },
            error: function () {
                console.log("failure");
                showModalAlert('Fehler beim Aktualisieren des Produkts!', 'danger');
                loadProductByID(productID);
            }
        });
    }

    function deleteProduct(id) {
        $.ajax({
            type: 'POST',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'deleteProduct',
                param: id
            },
            dataType: 'json',
            success: function (response) {
                // Handle the response and update the modal with the product data
                if (response.success) {
                    loadProductsForAdmin();
                    showModalAlert(response.success, 'success');
                    $('#updateProductForm').hide();
                    $('#editProductFooter').hide();
                    setTimeout(function () {
                        $('#changeProductModal').modal('hide');
                    }, 2000);
                } else if (response.error) {
                    showModalAlert(response.error, 'warning');
                }
            },
            error: function () {
                showModalAlert('Fehler bei der Abfrage!', 'danger');
            }
        });
    }

    // shows modal for selected product
    function showEditModal(product) {
        $('#productID').val(product.id);
        $('#categoryEdit').val(product.kategorie);
        $('#productNameEdit').val(product.name);
        $('#priceEdit').val(product.preis);
        $('#stockEdit').val(product.bestand);
        $('#descriptionEdit').val(product.beschreibung);
        let pictureCacheRemover = new Date().getTime();
        $('#currentPicturePreviewImg').attr('src', "../Frontend/res/img/" + product.name + ".jpg?" + pictureCacheRemover);
        $('#changeProductModal').modal('show');
    }
});