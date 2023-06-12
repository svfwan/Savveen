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
                alert(response.success);
            } else {
                showModalAlert(response.error, 'warning')
            }
        },
        error: function () {
            showModalAlert('Fehler beim Bestellen!', 'danger');
        }
    });

}
