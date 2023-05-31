$(document).ready(function () {

    $(document).on('click', '#orderCart', function () {
        console.log("clicked"); 
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

        // get username
        // get all products from cart
        // save in param and send to backend

        $.ajax({
            type: 'POST',
            url: '../../Backend/logic/requestHandler.php',
            data: {
                method: 'processOrder',
                param: {

                }
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

});