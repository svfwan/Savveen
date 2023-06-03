

$(document).ready(function () {

    updateFeatures();


    $(document).on('click', '#profileAction', function () {
        let isLoggedIn = !!getCookie('username');
        var filePath = isLoggedIn ? 'sites/profile.html' : 'sites/login.html';
        var modalId = isLoggedIn ? '#profileModal' : '#loginModal';
        $('#modal-placeholder').load(filePath, function () {
            if (isLoggedIn) {
                console.log("logged in");
                loadProfileData();
            }
            $(modalId).modal('show');
        });
    });

    function changeProfileData() {

        var userinfo=getCookie('username');
        var newData={};
        
        newData.firstName = $('#firstNamenew').val();
        newData.lastName = $('#lastNamenew').val();
        newData.email = $('#emailnew').val();
        newData.password = $('#passwordnew').val();
        newData.adress = $('#addressnew').val();
        newData.city = $('#citynew').val();
        newData.plz = $('#postcodenew').val();
        newData.username=$('#usernamenew').val();
        newData.formofAddress=$('#formofAddressnew').val();
        newData.pw_alt=$('#pw_alt').val();
        
        $.ajax({
            type: 'POST',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'updateUserData',
                param: JSON.stringify({
                    actualusername: userinfo,
                    firstName: newData.firstName,
                    lastName: newData.lastName,
                    email: newData.email,
                    pw: newData.pw,
                    adress: newData.adress,
                    city: newData.city,
                    postcode: newData.plz,
                    username: newData.username,
                    formofAddress: newData.formofAddress,
                    pw_alt: newData.pw_alt
                    
                    
                })
            },
            dataType: 'json',
            success: function (response) {
                console.log('Ajax-Anfrage erfolgreich');
                console.log(response);

                if (response.success) {
                    showModalAlert('Ihre Änderungen wurden erfolgreich gespeichert!', 'success');
                    $('#firstNameold').html(response.vorname);
                    $('#lastNameold').text(response.nachname);
                    $('#addressold').text(response.adress);
                    $('#postcodeold').text(response.postcode);
                    $('#cityold').text(response.city);
                    $('#emailold').text(response.email);
                    $('#usernameold').text(response.username);
                    $('#formofAddressold').text(response.anrede);
                    updateFeatures();
                   getCookie('username');
                } else if (response.error) {
                    console.log(response.error);
                    showModalAlert(response.error, 'danger');
                }
            },
            error: function (error) {
                console.log(error);
                console.log("Maria, du hast einen Fehler gemacht.")
            }

        });

    }


    function loadProfileData() {
        let userinfo = getCookie('username');

        $.ajax({
            type: 'GET',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'getProfileData',
                param: userinfo
            },
            dataType: 'json',
            success: function (response) {
                console.log("success");
                console.log('Ajax-Anfrage erfolgreich');
                console.log(response);

                if (response.success) {
                    $('#firstNameold').text(response.vorname);
                    $('#lastNameold').text(response.nachname);
                    $('#addressold').text(response.adresse);
                    $('#postcodeold').text(response.plz);
                    $('#cityold').text(response.ort);
                    $('#emailold').text(response.email);
                    $('#usernameold').text(response.username);
                    $('#formofAddressold').text(response.anrede);

                }

            },
            error: function (error) {
                console.log("Maria, du hast einen Fehler gemacht.");
                console.log(error);
            }
        });
    }
    $(document).on('click', '#changeButton', changeProfileData);


    $(document).on('click', '#openRegisterModal', function (event) {
        event.preventDefault();  // Prevent the default action
        $('#loginModal').modal('hide');  // Hide the login modal

        // Load the content of register.html into the modal placeholder and show the register modal
        $('#modal-placeholder').load('sites/register.html', function () {
            $('#registerModal').modal('show');  // Assume the id of the register modal is 'registerModal'
        });
    });

    $(document).on('click', '#openLoginModal', function (event) {
        event.preventDefault();  // Prevent the default action
        $('#registerModal').modal('hide');  // Hide the register modal

        // Load the content of login.html into the modal placeholder and show the login modal
        $('#modal-placeholder').load('sites/login.html', function () {
            $('#loginModal').modal('show');
        });
    });


    // ajax call for login
    $(document).on('click', '#loginButton', function () {
        console.log('Login button clicked');
        $.ajax({
            type: 'POST',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'loginUser',
                param: JSON.stringify({
                    userInput: $('#userInput').val(),
                   // email: $('#email').val(),
                    password: $('#password').val(),
                    rememberLogin: $('#remember_login').prop('checked')
                })
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    updateFeatures();
                    // Hide the login form and show success message
                    $('#loginForm').hide();
                    $('#loginButton').hide();
                    // Optionally, you can close the modal after a delay
                    showModalAlert(response.success, 'success');
                    setTimeout(function () {
                        $('#loginModal').modal('hide');
                    }, 2000); // 2 seconds delay
                } else if (response.error) {
                    // Show error message above the modal content
                    $('#message-container').html('<div class="alert alert-danger" role="alert">' + response.error + '</div>');
                }
            },
            error: function (error) {
                $('#loadingSpinner').css('display', 'none');
                console.log(error);
            }
        });
    });
  
    // ajax call for logout
    $(document).on('click', '#logoutButton', function () {
        console.log("logout button clicked")
        $.ajax({
            type: 'POST',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'logoutUser'
            },
            dataType: 'json',
            success: function (response) {
                console.log(response);
                if (response.loggedIn === false) {
                    console.log("Logged out");
                    updateFeatures();
                }
            },
            error: function (error) {
                console.log(error)
            }
        });
    });

    // ajax call for registration
    $(document).on('click', '#registerButton', function () {
        console.log('button clicked');
        if (!$('#termsCheck').prop('checked')) {
            $('#termsCheck').addClass('is-invalid');
            showModalAlert('Bitte stimmen Sie den Nutzungsbedingungen zu!', 'warning');
            return;
        }
        if (!validateRegisterForm()) {
            showModalAlert('Bitte beachten Sie die Anforderungen für die Registrierung!', 'warning');
            return;
        }
        $.ajax({
            type: 'POST',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'registerUser',
                param: JSON.stringify({
                    formofAddress: $('#formofAddress').val(),
                    firstName: $('#firstName').val(),
                    lastName: $('#lastName').val(),
                    address: $('#address').val(),
                    postcode: $('#postcode').val(),
                    city: $('#city').val(),
                    email: $('#email').val(),
                    username: $('#username').val(),
                    password: $('#password').val(),
                })
            },
            dataType: 'json',
            success: function (response) {
                console.log(response);
                $('#loadingSpinner').css('display', 'none');
                if (response.success) {
                    // reset form inputs after success
                    $('#formofAddress option:first').prop('selected', true);
                    $('#firstName').val('');
                    $('#lastName').val('');
                    $('#address').val('');
                    $('#postcode').val('');
                    $('#city').val('');
                    $('#email').val('');
                    $('#username').val('');
                    $('#password').val('');
                    $('#termCheck').prop('checked', false);
                    showModalAlert('Registrierung erfolgreich, Sie können sich nun einloggen!', 'success');
                } else if (response.error) {
                    showModalAlert(response.error, 'danger');
                }
            },
            error: function (error) {
                $('#loadingSpinner').css('display', 'none');
                console.log(error);
            }
        });
    });


    // helper functions

    function updateFeatures() {
        const username = getCookie('username');
        const rememberLogin = getCookie('rememberLogin');

        if (username && rememberLogin) {
            // User cookies are present, make the AJAX request to retrieve session information
            $.ajax({
                type: 'GET',
                url: '../Backend/logic/requestHandler.php',
                data: {
                    method: 'getSessionInfo',
                },
                dataType: 'json',
                success: function (response) {
                    console.log(response);
                    if (response.status === 'loggedInAdmin' || response.status === 'loggedInUser') {
                        let isAdmin = response.status === 'loggedInAdmin';
                        updateNavbar(true, username, isAdmin);
                        if (isAdmin) {
                            $('#productFilter').hide();
                            $('#mainView').load('sites/dashboard.html #adminDashboard');
                        } else {
                            // Load the default content for non-admin users
                            $('#productFilter').show();
                            $('#mainView').empty();
                            loadAllProducts();
                        }
                    } else {
                        updateNavbar(false, '', false);
                        $('#productFilter').show();
                        $('#mainView').empty();
                        loadAllProducts();
                    }
                },
                error: function (error) {
                    console.log(error);
                },
            });
        } else {
            // User is not logged in or cookies are not present, update the UI accordingly
            updateNavbar(false, '', false);
            $('#productFilter').show();
            $('#mainView').empty();
            loadAllProducts();
        }
    }

    function updateNavbar(isLoggedIn, username, isAdmin) {
        // default state - not logged in users
        $('#usernameDisplay').text('');
        $('#usernameDisplay').hide();
        $('#showCart').show();
        $('#showOrders').hide();
        $('#showAdminDashboard').hide();
        $('#logoutButton').hide();

        // if a user is logged in
        if (isLoggedIn) {
            $('#usernameDisplay').text(username);
            $('#usernameDisplay').show();
            $('#logoutButton').show(); // show logout button
            // if the logged in user is admin
            if (isAdmin) {
                $('#showCart').hide();
                $('#showAdminDashboard').show(); // show admin dashboard
            } else {
                $('#showOrders').show(); // show orders
            }
        }
    }

    function validateInput(input) {
        if (input.val().trim().length === 0) {
            input.addClass('is-invalid');
            return false;
        } else {
            input.removeClass('is-invalid');
            return true;
        }
    }

    function validateRegisterForm() {
        let isValid = true;

        isValid = validateInput($('#firstName')) && isValid;
        isValid = validateInput($('#lastName')) && isValid;
        isValid = validateInput($('#address')) && isValid;
        isValid = validateInput($('#postcode')) && isValid;
        isValid = validateInput($('#city')) && isValid;

        let email = $('#email').val().trim();
        if (email.length === 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            $('#email').addClass('is-invalid');
            isValid = false;
        } else {
            $('#email').removeClass('is-invalid');
        }

        isValid = validateInput($('#username')) && isValid;

        if ($('#password').val().trim().length < 8) {
            $('#password').addClass('is-invalid');
            isValid = false;
        } else {
            $('#password').removeClass('is-invalid');
        }

        return isValid;
    }
});