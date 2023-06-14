$(document).ready(function () {

    $(document).on('click', '#showAdminDashboard', function () {
        $('#mainView').load('sites/dashboard.html #adminDashboard');
    });

    $(document).on('click', '#showProfileManagement', function () {
        loadSection('userManagement');
        loadUsersForAdmin();
    });

    $(document).on('click', '#activateUser', function () {
        let userID = $(this).data('user-id');
        activateUser(userID);
    });

    $(document).on('click', '#deactivateUser', function () {
        let userID = $(this).data('user-id');
        deactivateUser(userID);
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
        let path = $('#currentPicturePreviewImg').attr('src').split('?')[0];
        deleteProduct(id, path);
    })

    // ajax call for loading all users for admin
    function loadUsersForAdmin() {
        $.ajax({
            type: 'GET',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'loadAllUsers',
            },
            dataType: 'json',
            success: function (response) {
                const $userListAdmin = $('#userListAdmin');
                $userListAdmin.empty();

                if (response.success) {
                    const users = response.users;
                    users.forEach(user => {
                        const card = $('<div class="card mb-3"></div>');
                        const cardBody = $('<div class="card-body userCard"></div>');
                        const usernameElement = $('<h5 class="card-title"></h5>').text(user.username);
                        const buttonContainer = $('<div class="d-flex justify-content-end"></div>');
                        const detailsButton = $('<button class="btn btn-success me-2">Kundendetails ansehen</button>');
                        detailsButton.data('user-id', user.id);
                        const ordersButton = $('<button class="btn btn-success">Bestellungen laden</button>');
                        ordersButton.data('user-id', user.id);
                        const ordersList = $('<div></div>').addClass('container col-6 d-none ordersList').attr('id', user.id);
                        detailsButton.on('click', function () {
                            const userID = $(this).data('user-id');
                            loadUserByID(userID);
                        });

                        ordersButton.on('click', function () {
                            const userID = $(this).data('user-id');
                            loadOrdersList(userID);
                        });

                        buttonContainer.append(detailsButton, ordersButton);
                        cardBody.append(usernameElement, buttonContainer, ordersList);
                        card.append(cardBody);
                        $userListAdmin.append(card);
                    });
                } else if (response.error) {
                    showAlert(response.error, 'warning');
                }
            },
            error: function () {
                showAlert('Fehler beim Laden der Benutzer', 'warning');
            }
        });
    }

    function loadUserByID(userID) {
        $.ajax({
            type: 'GET',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'loadUserByID',
                param: userID
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    let user = response.data;
                    showUserDataModal(user);
                } else {
                    showAlert(response.error, 'warning');
                }
            },
            error: function () {
                showAlert('Fehler beim Laden der Benutzerdaten!', 'warning');
            }
        });
    }

    function showUserDataModal(user) {
        if ($('#userDataModal').is(':visible')) {
            var statusText = user.aktiv === 1 ? 'Aktiv' : 'Nicht Aktiv';
            $('#userStatus').text(statusText);
            $('#userFOD').text(user.anrede);
            $('#userFirstName').text(user.vorname);
            $('#userLastName').text(user.nachname);
            $('#userAddress').text(user.adresse);
            $('#userPostcode').text(user.plz);
            $('#userCity').text(user.ort);
            $('#userEmail').text(user.email);
            $('#userUsername').text(user.username);
            $('#activateUser').data('user-id', user.id);
            $('#deactivateUser').data('user-id', user.id);
        } else {
            $('#modal-placeholder').load("sites/dashboard.html #userDataModal", function () {
                var statusText = user.aktiv === 1 ? 'Aktiv' : 'Nicht Aktiv';
                $('#userStatus').text(statusText);
                $('#userFOD').text(user.anrede);
                $('#userFirstName').text(user.vorname);
                $('#userLastName').text(user.nachname);
                $('#userAddress').text(user.adresse);
                $('#userPostcode').text(user.plz);
                $('#userCity').text(user.ort);
                $('#userEmail').text(user.email);
                $('#userUsername').text(user.username);
                $('#activateUser').data('user-id', user.id);
                $('#deactivateUser').data('user-id', user.id);
                $('#userDataModal').modal('show');
            });
        }
    }

    function activateUser(userID) {
        $.ajax({
            type: 'POST',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'activateUser',
                param: userID
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    showModalAlert(response.success, 'success');
                    loadUserByID(userID);
                    loadUsersForAdmin();
                } else if (response.error) {
                    showModalAlert(response.error, 'warning');
                }
            },
            error: function () {
                showModalAlert('Fehler bei der Abfrage!', 'danger');
                loadUserByID(userID);
            }
        });
    }

    function deactivateUser(userID) {
        $.ajax({
            type: 'POST',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'deactivateUser',
                param: userID
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    showModalAlert(response.success, 'success');
                    loadUserByID(userID);
                    loadUsersForAdmin();
                } else if (response.error) {
                    showModalAlert(response.error, 'warning');
                }
            },
            error: function () {
                showModalAlert('Fehler bei der Abfrage!', 'danger');
                loadUserByID(userID);
            }
        });
    }

    function loadOrdersList(userID) {
        const ordersListContainer = $('.ordersList#' + userID);
        $.ajax({
            type: 'GET',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'loadOrdersByUserID',
                param: userID
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    let orders = response.data;
                    const targetID = userID;
                    $('.ordersList').not('#' + targetID).empty().hide();
                    ordersListContainer.empty().show();
                    showOrdersList(orders, userID);
                } else if (response.noOrders) {
                    showAlert(response.noOrders, 'warning');
                } else {
                    showAlert(response.error, 'warning');
                }
            },
            error: function () {
                showAlert('Fehler bei der Abfrage der Bestellungen!', 'danger');
            }
        });
    }

    function showOrdersList(orders, userID) {
        const orderList = $('<ul>').addClass('list-group');
        orders.forEach(order => {
            const listItem = $('<li>').addClass('list-group-item d-flex justify-content-between align-items-center');
            const text = $('<span>').text('Bestellung #' + order.id);
            const button = $('<button>').addClass('btn btn-success').text('Bestellung bearbeiten');
            button.data('order-id', order.id);
            button.on('click', function () {
                const orderID = $(this).data('order-id');
                loadOrderByID(orderID);
            });

            listItem.append(text, button);
            orderList.append(listItem);
        });

        const ordersListContainer = $('.ordersList#' + userID);
        ordersListContainer.empty().append(orderList); // Append the orderListDiv inside the container
        ordersListContainer.removeClass('d-none'); // Remove the 'd-none' class to show the orders list
    }

    function loadOrderByID(orderID) {
        $.ajax({
            type: 'GET',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'loadOrderByID',
                param: orderID
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    let order = response.data;
                    showOrderModal(order);
                } else {
                    showAlert('Bestellung konnte nicht geladen werden!', 'warning');
                }
            },
            error: function () {
                showAlert('Fehler bei der Abfrage der Bestellung!', 'danger');
            }
        });

    }

    function showOrderModal(order) {
        const table = $('<table>').addClass('table table-striped');
        const thead = $('<thead>').append('<tr><th>Produkte</th><th>Preis</th><th>Anzahl</th><th></th></tr>');
        const tbody = $('<tbody>');
        const receiptIDElement = $('<p>').append($('<strong>').text('Bestellnummer: ' + order[0].receipt_id));
        const date = order[0].datum;
        const address = order[0].strasse + ', ' + order[0].plz + ' ' + order[0].ort;
        const addressElement = $('<p>').append($('<strong>').text('Datum: ' + date + ', Adresse: ' + address));
        order.forEach(orderLine => {
            const productName = orderLine.product_name;
            const price = orderLine.preis;
            const quantity = orderLine.anzahl;
            const orderLineID = orderLine.orderline_id;
            const receiptID = orderLine.receipt_id;

            const row = $('<tr>');
            const productNameCell = $('<td>').text(productName);
            const priceCell = $('<td>').text(price + '€');
            const quantityCell = $('<td>').text(quantity);
            const buttonCell = $('<td>');
            const removeButton = $('<button>').addClass('btn btn-danger').text('Produkt entfernen');
            removeButton.data('orderline-id', orderLineID);
            removeButton.data('receipt-id', receiptID);
            removeButton.on('click', function () {
                const orderlineID = $(this).data('orderline-id');
                const receiptID = $(this).data('receipt-id');
                deleteProductFromOrder(orderlineID, receiptID);
            });
            buttonCell.append(removeButton);

            row.append(productNameCell, priceCell, quantityCell, buttonCell);
            tbody.append(row);
        });

        table.append(thead, tbody);

        // Display the sum
        const sum = order[0].summe;
        const sumElement = $('<p>').append($('<strong>').text('Summe: ' + sum + '€'));
        if ($('#orderDataModal').is(':visible')) {
            $('#orderTable').html('').append(receiptIDElement, addressElement, table, sumElement);
        } else {
            // If the modal is not visible, load it and set the content of #orderTable
            $('#modal-placeholder').load("sites/dashboard.html #orderDataModal", function () {
                $('#orderDataModal').modal('show');
                $('#orderTable').html('').append(receiptIDElement, addressElement, table, sumElement);
            });
        }
    }

    function deleteProductFromOrder(orderlineID, receiptID) {
        $.ajax({
            type: 'POST',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'deleteOrderLine',
                param: JSON.stringify({
                    orderlineID: orderlineID,
                    receiptID: receiptID
                })
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    showModalAlert(response.success, 'success');
                    loadUsersForAdmin();
                    loadOrderByID(receiptID);
                } else if (response.lastProduct) {
                    $('#orderDataModal').modal('hide');
                    showAlert(response.lastProduct, 'success');
                    loadUsersForAdmin();
                } else if (response.error) {
                    showModalAlert(response.error, 'warning');
                }
            },
            error: function () {
                showModalAlert('Fehler bei der Abfrage!', 'danger');
            }
        });

    }

    // ajax call for loading products for admin
    function loadProductsForAdmin() {
        let pictureCacheRemover = new Date().getTime();
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
                                        <img src="../Frontend/res/img/${product.name}.jpg?${pictureCacheRemover}" class="card-img-top product-img" alt="${product.name}">
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
            error: function () {
                showAlert('Fehler bei der Abfrage!', 'danger');
            }
        });
    }

    // ajax call for creating product
    function createProduct() {
        // Get form input values
        let category = $('#categoryAdd').val();
        let productName = $('#productNameAdd').val();
        let price = $('#priceAdd').val();
        let description = $('#descriptionAdd').val();
        let picture = document.getElementById('pictureAdd').files[0];

        // Perform validation
        if (!category || !productName || !price || !description || !picture) {
            showAlert('Bitte füllen Sie alle Felder aus!', 'warning');
            return;
        }

        if (isNaN(price) || price < 0) {
            showAlert('Preis muss valide Zahl sein!', 'warning');
            return;
        }

        let formData = new FormData();
        formData.append('method', 'createProduct');
        formData.append('category', category);
        formData.append('productName', productName);
        formData.append('price', price);
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
                    showAlert('Produkt konnte nict geladen werden!', 'warning');
                }
            },
            error: function () {
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
        let description = $('#descriptionEdit').val();
        let picture = document.getElementById('pictureEdit').files[0];
        let currentPicture = $('#currentPicturePreviewImg').attr('src').split('?')[0];

        // Perform validation
        if (!category || !productName || !price || !description) {
            showModalAlert('Bitte füllen Sie alle Felder aus!', 'warning');
            loadProductByID(productID);
            return;
        }

        if (isNaN(price) || price < 0) {
            showModalAlert('Preis muss valid Zahl sein!', 'warning');
            loadProductByID(productID);
            return;
        }

        let formData = new FormData();
        formData.append('method', 'updateProduct');
        formData.append('productID', productID,);
        formData.append('category', category);
        formData.append('productName', productName);
        formData.append('price', price);
        formData.append('description', description);
        if (picture) {
            formData.append('picture', picture, picture.name);
        }
        formData.append('currentPicture', currentPicture);

        // Send data to the backend using AJAX
        $.ajax({
            type: 'POST',
            url: '../Backend/logic/requestHandler.php',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.success) {
                    $('#pictureEdit').val('');
                    showModalAlert(response.success, 'success');
                    loadProductByID(productID);
                    loadProductsForAdmin();
                } else if (response.error) {
                    showModalAlert(response.error, 'warning');
                }
            },
            error: function () {
                showModalAlert('Fehler beim Aktualisieren des Produkts!', 'danger');
                loadProductByID(productID);
            }
        });
    }

    function deleteProduct(id, path) {
        $.ajax({
            type: 'POST',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'deleteProduct',
                param: JSON.stringify({
                    id: id,
                    currentPicture: path
                })
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
        let pictureCacheRemover = new Date().getTime();
        if ($('#changeProductModal').is(':visible')) {
            $('#pictureEdit').val('');
            $('#productID').val(product.id);
            $('#categoryEdit').val(product.kategorie);
            $('#productNameEdit').val(product.name);
            $('#priceEdit').val(product.preis);
            $('#descriptionEdit').val(product.beschreibung);
            $('#currentPicturePreviewImg').attr('src', "../Frontend/res/img/" + product.name + ".jpg?" + pictureCacheRemover);
        } else {
            $('#modal-placeholder').load("sites/dashboard.html #changeProductModal", function () {
                $('#pictureEdit').val('');
                $('#productID').val(product.id);
                $('#categoryEdit').val(product.kategorie);
                $('#productNameEdit').val(product.name);
                $('#priceEdit').val(product.preis);
                $('#descriptionEdit').val(product.beschreibung);
                $('#currentPicturePreviewImg').attr('src', "../Frontend/res/img/" + product.name + ".jpg?" + pictureCacheRemover);
                $('#changeProductModal').modal('show');
            });
        }
    }
});
