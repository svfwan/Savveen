$(document).ready(function () {

    updateCartStatus();

    $(document).on('click', '#showCart', function () {
        updateCartStatus();
    });

    $(document).on('click', '#orderCart', function () {
        let isLoggedIn = !!getCookie('username');
        console.log('Bestellen...');
        if (!isLoggedIn) {
            alert("Bitte melden Sie sich an, um zu bestellen!");
            // Load the content of login.html into the modal placeholder and show the login modal
            $('#modal-placeholder').load('sites/login.html', function () {
                $('#loginModal').modal('show');
            });
            return;
        }
        $.ajax({
            type: 'POST',
            url: '../../Backend/logic/requestHandler.php',
            data: {
                method: 'processOrder',
                param: JSON.stringify({

                })
            },
            dataType: 'json',
            success: function (response) {
                // handle success
                // empty myCart in sessionStorage or reset
                // show invoice, that can be downloaded
            },
            error: function (error) {
                // show error
            }
        });
    });

    // helper functions

    function getCookie(name) {
        const value = '; ' + document.cookie;
        const parts = value.split('; ' + name + '=');
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    function updateCartStatus() {
        let cart = sessionStorage.getItem("myCart") ? JSON.parse(sessionStorage.getItem("myCart")) : false;

        if (!cart || cart.length === 0) {
            $('#cartMessages').html('<h2>Ihr Warenkorb ist leer</h2>');
            $('#orderCart').hide();
        } else {
            $('#cartMessages').empty();
            $('#orderCart').show();
        }
    }
});