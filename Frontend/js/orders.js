$(document).ready(function () {
    $(document).on('click', '#orderCart', function () {
        let isLoggedIn = !!getCookie('username');  //überprüft, ob ein user angemeldet ist
        if (!isLoggedIn) {
            alert("Bitte melden Sie sich an, um zu bestellen!");
            $('#modal-placeholder').load('sites/login.html', function () {
                $('#loginModal').modal('show');
            });
            return;
        } else if (isLoggedIn) { //user eingeloggt
            let username = getCookie('username');
            showAddressModal(username); //AdresseModal anzeigen
        }
    });

    $(document).on('click', '#confirmOrder', function () { //wenn adresse bestätigt
        processOrder(); //bestellung verarbeiten
    });

    $(document).on('click', '#showOrders', function () { //bestellungen anzeigen
        $("#modal-placeholder").empty();
        $('#modal-placeholder').load("sites/orders.html #ordersModal", function () {
            getOrderInfo();
        })
    })

});

function getOrderInfo() {
    let username = getCookie('username');  //infos aus der db zu den bestellungen eines users holen
    $.ajax({
        type: "GET",
        url: "../Backend/logic/requestHandler.php",
        data: {
            method: "getOrders",
            param: JSON.stringify({
                username: username,
            }),
        },
        dataType: "json",
        success: function (response) {
            if (!(response.length === 1 && response[0].length === 0)) { //wenn es keine bestellungen gibt
                $('#ordersTable').removeClass('d-none');
                for (let i in response) {
                    displayOrder(response[i]); //bestellungsanzeigen funktion aufrufen
                }
            } else {
                $('#message-container').html('<div class="alert alert-warning" role="alert">Sie haben keine Bestellungen!</div>');
                $('#ordersModal').modal('show');
            }
        },
        error: function () {
            alert("Fehler beim Laden der Bestellungen!");
        },
    });
}

function displayOrder(order) { //bestellungen anzeigen
    const ordersTable = $('#ordersTable');
    //es wird ein arr(order) weitergegenen mit einer bestimmten rechnungsid

    //table erstellen für je rechnungsid
    const table = $('<table>').addClass('table table-striped');
    const thead = $('<thead>').append('<tr><th>Produkte</th><th>Preis</th><th>Anzahl</th></tr>');
    const tbody = $('<tbody>');

    for (let i = 0; i < order.length; i++) { //details zu den produkten anzeigen
        const productName = order[i].name;
        const price = order[i].preis;
        const quantity = order[i].anzahl;

        const row = $('<tr>');
        const productNameCell = $('<td>').text(productName);
        const priceCell = $('<td>').text(price + '€');
        const quantityCell = $('<td>').text(quantity);

        row.append(productNameCell, priceCell, quantityCell);
        tbody.append(row);
    }

    //Lieferdetails zu der Bestellung einer bestimmten rechnungsid
    table.append(thead, tbody);
    ordersTable.append(table);

    const details = $('<h6>').text('Bestelldetails');
    ordersTable.append(details);

    const date = order[0].datum;
    const addressElement = $('<p>').text('Datum: ' + date);
    ordersTable.append(addressElement);

    const address = order[0].strasse + ', ' + order[0].plz + ' ' + order[0].ort;
    const addressElement1 = $('<p>').text(' Adresse: ' + address);
    ordersTable.append(addressElement1);

    const sum = order[0].summe;
    const sumElement = $('<p>').addClass('sum-element').text('Summe: ' + sum + '€');

    const button = $('<button>').attr('type', 'button').addClass('btn btn-success').text('Rechnung drucken');
    let receiptID = order[0].id;
    button.on('click', function () {
        printReceipt(receiptID);   //rechnung drucken 
    });

    const sumRow = $('<div>').addClass('row'); //um Button "Rechnung drucken" und die Summe in einer row anzuzeigen
    const leftCol = $('<div>').addClass('col-md-6').append(sumElement);
    const rightCol = $('<div>').addClass('col-md-6 text-right').append(button);
    sumRow.append(leftCol, rightCol);

    ordersTable.append(sumRow);

    $('#ordersModal').modal('show');

    const table1 = $('<table>').addClass('table table-striped');
    const thead1 = $('<thead>').append('<tr><th></th><th></th><th></th><th></th></tr>');
    const tbody1 = $('<tbody>');
    table1.append(thead1, tbody1);
    ordersTable.append(table1);
}

function showAddressModal(username) { //modall anzeigen, für die gespeicherte adresse
    $.ajax({
        type: "GET",
        url: "../Backend/logic/requestHandler.php",
        data: {
            method: "getProfileData",
            param: JSON.stringify(username),
        },
        dataType: "json",
        success: function (response) {
            $('#modal-placeholder').empty();
            $('#modal-placeholder').load('sites/cart.html #addressModal', function () {
                $('#savedStreet').val(response.adresse);
                $('#savedPostcode').val(response.plz);
                $('#savedCity').val(response.ort);
                $('#addressModal').modal('show');
            });
        },
        error: function () {
            alert("Fehler bei der Abfrage!");
        }
    });
}

function showSuccessfulOrder(receiptID) { //modall, das bei einer erfolgreichen bestellung angezeigt wird
    $('#modal-placeholder').empty();
    $('#modal-placeholder').load('sites/cart.html #receiptModal', function () {
        $('#receiptModal').modal('show');
        $(document).on("click", "#printReceipt", function () {
            printReceipt(receiptID);
        })
    })
}

function printReceipt(receiptID) { //rechnung drucken 
    $.ajax({
        type: "GET",
        url: "../Backend/logic/requestHandler.php",
        data: {
            method: "loadOrderByID", //ajax call, bei dem man die bestellung einer bestimmten rechnungsid holt. 
            param: receiptID,
        },
        dataType: "json",
        success: function (response) {
            if (response.success) {
                const receipt = response.data;
                const date = receipt[0].datum;
                const address = receipt[0].strasse + ', ' + receipt[0].plz + ' ' + receipt[0].ort;
                const receiptID = receipt[0].receipt_id;
                const sum = receipt[0].summe;

                //Rechnung wird wie folgt angezeigt.
                const html = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Rechnung</title>
                        <style>
                            /* General Styles */
                            /* Paste your style.css content here */

                            /* Additional Styles for the receipt */
                            .receipt-container {
                                margin: 20px;
                                padding: 20px;
                                border: 1px solid #ddd;
                                border-radius: 4px;
                                background-color: #fff;
                                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                            }

                            .receipt-title {
                                font-size: 24px;
                                font-weight: bold;
                                color: #006837;
                                margin-bottom: 20px;
                            }

                            .receipt-info {
                                margin-bottom: 10px;
                            }

                            .receipt-info strong {
                                font-weight: bold;
                            }

                            .receipt-table {
                                width: 100%;
                                border-collapse: collapse;
                            }

                            .receipt-table th,
                            .receipt-table td {
                                padding: 10px;
                                border: 1px solid #ddd;
                            }

                            .receipt-sum {
                                margin-top: 20px;
                                font-weight: bold;
                            }
                        </style>
                    </head>
                    <body onload="window.print();">
                        <div class="receipt-container">
                            <h1 class="receipt-title">Rechnung</h1>
                            <p class="receipt-info">Rechnungsnummer: <strong>${receiptID}</strong></p>
                            <p class="receipt-info">Datum: <strong>${date}</strong></p>
                            <p class="receipt-info">Adresse: <strong>${address}</strong></p>
                            <table class="receipt-table">
                                <thead>
                                    <tr>
                                        <th>Produkte</th>
                                        <th>Preis</th>
                                        <th>Anzahl</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${receipt.map(orderLine => `
                                        <tr>
                                            <td>${orderLine.product_name}</td>
                                            <td>${orderLine.preis}€</td>
                                            <td>${orderLine.anzahl}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            <p class="receipt-sum">Summe: <strong>${sum}€</strong></p>
                        </div>
                    </body>
                    </html>
                `;

                const receiptWindow = window.open("", "_blank"); //Rechnung öffnet sich in einem neuen fenster
                receiptWindow.document.open();
                receiptWindow.document.write(html);
                receiptWindow.document.close();
            } else {
                showModalAlert("Rechnungsdaten inkorrekt!", "warning");
            }
        },
        error: function () {
            alert("Fehler beim Laden der Rechnung!");
        },
    });
}

function processOrder() { //verarbeitung der bestellung
    let username = getCookie('username');
    let orderData = {
        username: username,
        cartItems: [],
    };
    let myCart = JSON.parse(sessionStorage.getItem('myCart'));
    let cartItems = myCart.map(item => {
        return {
            id: item.id,
            price: item.price,
            quantity: item.quant,
        };
    });
    orderData.cartItems = cartItems;
    const selectedAddressId = $('input[name="addressType"]:checked').attr('id'); //überprüft, ob gespeicherte oder neue Adresse ausgewählt wurde
    if (selectedAddressId === 'savedAddress') {
        orderData.address = $('#savedStreet').val();
        orderData.postcode = $('#savedPostcode').val();
        orderData.city = $('#savedCity').val();
    } else {
        let newStreet = $('#newOrderStreet').val();
        let newPostcode = $('#newOrderPostcode').val();
        let newCity = $('#newOrderCity').val();

        if (!newStreet || !newPostcode || !newCity) { //neue Adresse unvollständig
            showModalAlert('Bitte geben Sie eine vollständige Adresse an!', 'warning');
            return;
        }

        orderData.address = newStreet;
        orderData.postcode = newPostcode;
        orderData.city = newCity;
    }

    //ajax call für bestellung verarbeiten
    $.ajax({
        type: 'POST',
        url: '../Backend/logic/requestHandler.php',
        data: {
            method: 'processOrder',
            param: JSON.stringify(orderData)
        },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                sessionStorage.removeItem('myCart');
                let myCart = [];
                sessionStorage.setItem("myCart", JSON.stringify(myCart));
                let length = myCart.reduce((total, item) => total + item.quant, 0);
                updateCartCounter(length);
                updateCartItems(myCart);
                $('#addressModal').modal('hide');
                $('#modal-placeholder').empty();
                showSuccessfulOrder(response.receipt);
            } else {
                showModalAlert(response.error, 'warning')
            }
        },
        error: function () {
            showModalAlert('Fehler beim Bestellen!', 'danger');
        }
    });

}
