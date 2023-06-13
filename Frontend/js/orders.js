$(document).ready(function () {
    $(document).on('click', '#orderCart', function () {
        let isLoggedIn = !!getCookie('username');
        if (!isLoggedIn) {
            alert("Bitte melden Sie sich an, um zu bestellen!");
            $('#modal-placeholder').load('sites/login.html', function () {
                $('#loginModal').modal('show');
            });
            return;
        } else if (isLoggedIn) {
            let username = getCookie('username');
            showAddressModal(username);
        }
    });

    $(document).on('click', '#confirmOrder', function () {
        processOrder();
    });

    $(document).on('click', '#showOrders', function () {
        console.log('showOrders');
        //showOrders();
    })

});

function showAddressModal(username) {
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

function showSuccessfulOrder(receipt_id){

            $('#modal-placeholder').empty();
            $('#modal-placeholder').load('sites/cart.html #bestellungModal', function () {
          
            $('#bestellungModal').modal('show');
            showModalAlert('Bestellung erfolgreich. Möchten Sie die Rechnung drucken?', 'success');

            $(document).on("click", "#printReceipt", function(event){
                event.preventDefault();
                $('#bestellungModal').modal('hide');
                $('#modal-placeholder').load('sites/cart.html #receiptModal', function () {
                printReceipt(receipt_id);
                })
            })
               })


                /*
            $('#rezept_id').html(receipt_id);
            $('#anschrift').html(adr);
            $('#receiptModal').modal('show');
            });*/
  
        }


function printReceipt(receipt_id){
            $.ajax({
                type: "GET",
                url: "../Backend/logic/requestHandler.php",
                data: {
                    method: "printReceipt",
                    param: receipt_id,
                },
                dataType: "json",
                success: function(response){
                console.log(response);
                $('#rezept_id').text(response.receipt_id);
                $('#position').text(response.name);
                $('#anschrift').text(response.strasse);
                $('#datum').text(response.datum);
                $('#ort').text(response.ort);
                $('#plz').text(response.plz);
                $('#preis').text(response.preis);
                $('#anzahl').text(response.anzahl);
                $('#receiptModal').modal('show');

                $(document).on('click', '#windowPrint', function () {
                    let printContents = $('#receiptModal').html();
                    let originalContents = $('body').html();
                    $('body').html(printContents);
                    window.print();
                    $('body').html(originalContents);
                });

                },
                error: function(){
                    alert("Fehler beim Drucken der Rechnung!")
                }
               })
        }

function processOrder() {
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
    const selectedAddressId = $('input[name="addressType"]:checked').attr('id');
    if (selectedAddressId === 'savedAddress') {
        orderData.address = $('#savedStreet').val();
        orderData.postcode = $('#savedPostcode').val();
        orderData.city = $('#savedCity').val();
    } else {
        let newStreet = $('#newOrderStreet').val();
        let newPostcode = $('#newOrderPostcode').val();
        let newCity = $('#newOrderCity').val();

        if (!newStreet || !newPostcode || !newCity) {
            showModalAlert('Bitte geben Sie eine vollständige Adresse an!', 'warning');
            return;
        }

        orderData.address = newStreet;
        orderData.postcode = newPostcode;
        orderData.city = newCity;
    }

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
                //alert(response.success);
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
