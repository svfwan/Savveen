$(document).ready(function () {

  /*
    note for self/team:
     - dynamic loading of pages getting messy
     - script getting long
     - navbar logic getting complicated

    possible solution:
    - keep navbar same everywhere -> find way to keep navbar but change page below maybe
    - seperate scripts i.e. register.js, login.js
    - keep common functionality in script.js

    further issues/ideas/solutions:
     - ...
  */



  // method to update frontend features based on backend session variables
  updateFeatures();

  // navbar logic
  var storedContent = localStorage.getItem('content');
  if (storedContent) {
    $('#content').html(storedContent);
  }

  $('button[data-page]').on('click', function (event) {
    event.preventDefault();
    var page = $(this).data('page');
    console.log(page);
    $('#content').load(`sites/${page}.html #content > *`, function () {
      localStorage.setItem('content', $('#content').html());
    });
  });

  function updateFeatures() {
    // Check if the cookies exist
    const username = getCookie('username');
    const admin = getCookie('admin');

    // Check if the user is already logged in from previous session
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (username && admin !== null) {
      // Log in the user using the cookies
      updateNavbar(true, username, admin === '1');
      if (isLoggedIn) {
        $('#login-form').hide();
        $('#content').load(`sites/profile.html #content > *`);
      }
    } else {
      $.ajax({
        type: 'POST',
        url: '../Backend/logic/requestHandler.php',
        data: {
          method: 'getSessionInfo',
        },
        dataType: 'json',
        success: function (response) {
          if (response.loggedIn) {
            // Update the features for logged-in users
            if (response.admin) {
              // Show admin-specific features
              updateNavbar(true, response.username, true);
            } else {
              // Show non-admin features
              updateNavbar(true, response.username, false);
            }

            if (isLoggedIn) {
              $('#login-form').hide();
              $('#content').load(`sites/profile.html #content > *`, function () {
                localStorage.setItem('content', $('#content').html());
              });
            }
          } else {
            // Show the default features for non-logged-in users
            updateNavbar(false, '', false);
          }
        },
        error: function (error) {
          console.log(error);
        },
      });
    }
  }


  // ajax call for registration
  $(document).on('click', '#register', function () {
    console.log('button clicked');

    // client-side validation of parameters
    if (!$('#termsCheck').prop('checked')) {
      $('#termsCheck').addClass('is-invalid');
      showAlert('Bitte stimmen Sie den Nutzungsbedingungen zu!', 'warning');
      return;
    }
    if (!validateRegisterForm()) {
      showAlert('Bitte beachten Sie die Anforderungen für die Registrierung!', 'warning');
      return;
    }
    // display loading spinner
    $('#loadingSpinner').css('display', 'block');

    // POST call to backend
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

        // hide loading Spinner
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
          showAlert('Registrierung erfolgreich, Sie können sich nun einloggen!', 'success');
        } else if (response.error) {
          showAlert(response.error, 'danger');
        }
      },
      error: function (error) {
        $('#loadingSpinner').css('display', 'none');
        console.log(error);
      }
    });
  });

  // ajax call for login
  $(document).on('click', '#loginbutton', function () {
    console.log('Login button clicked');

    // display loading spinner
    $('#loadingSpinner').css('display', 'block');

    // POST call to backend
    $.ajax({
      type: 'POST',
      url: '../Backend/logic/requestHandler.php',
      data: {
        method: 'loginUser',
        param: JSON.stringify({
          username: $('#username').val(),
          password: $('#password').val(),
          rememberLogin: $('#remember_login').prop('checked')
        })
      },
      dataType: 'json',
      success: function (response) {
        console.log(response);
        // hide loading Spinner
        $('#loadingSpinner').css('display', 'none');
        if (response.success) {
          showAlert(response.success, 'success');
          $('#login-form').hide();
          updateFeatures();
        } else if (response.error) {
          showAlert(response.error, 'danger');
        }
      },
      error: function (error) {
        $('#loadingSpinner').css('display', 'none');
        console.log(error);
      }
    });
  });


  // helper functions

  function updateNavbar(isLoggedIn, username, isAdmin) {
    // The basic navbar items that are always visible
    const basicNavbar = `
        <li class="nav-item">
          <button class="nav-link btn btn-link" data-page="products">Products</button>
        </li>
        <li class="nav-item">
          <button class="nav-link btn btn-link" data-page="help">Help</button>
        </li>
        <li class="nav-item">
          <button class="nav-link btn btn-link" data-page="imprint">Imprint</button>
        </li>
    `;

    // The items that should be visible only to not logged-in users
    const notLoggedInNavbar = `
        <li class="nav-item">
          <button class="nav-link btn btn-link" data-page="register">Registrierung</button>
        </li>
        <li class="nav-item">
          <button class="nav-link btn btn-link" data-page="login">Login</button>
        </li>
    `;

    // The items that should be visible only to logged-in users
    let loggedInNavbar = '';
    if (isLoggedIn) {
      loggedInNavbar = `
            <li class="nav-item">
              <button class="nav-link btn btn-link" data-page="profile">${username}</button>
            </li>
        `;
    }

    // The items that should be visible only to admin users
    let adminNavbar = '';
    if (isAdmin) {
      adminNavbar = `
            <li class="nav-item">
              <button class="nav-link btn btn-link" data-page="dashboard">Admin Dashboard</button>
            </li>
        `;
    }

    let navbarItems = '';
    if (isAdmin) {
      navbarItems += adminNavbar + basicNavbar;
    } else if (isLoggedIn) {
      navbarItems += loggedInNavbar + basicNavbar;
    } else {
      navbarItems += notLoggedInNavbar + basicNavbar;
    }

    const logoutButton = '';

    $('#navbarNav > ul.navbar-nav').html(navbarItems);

    // Add click event handlers to the buttons
    $('button[data-page]').on('click', function (event) {
      event.preventDefault();
      var page = $(this).data('page');
      console.log(page);
      $('#content').load(`sites/${page}.html #content > *`, function () {
        localStorage.setItem('content', $('#content').html());
      });
    });
  }


  function getCookie(name) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function validateRegisterForm() {
    let isValid = true;

    // Validate firstName
    if ($('#firstName').val().trim().length === 0) {
      $('#firstName').addClass('is-invalid');
      isValid = false;
    } else {
      $('#firstName').removeClass('is-invalid');
    }

    // Validate lastName
    if ($('#lastName').val().trim().length === 0) {
      $('#lastName').addClass('is-invalid');
      isValid = false;
    } else {
      $('#lastName').removeClass('is-invalid');
    }

    // Validate address
    if ($('#address').val().trim().length === 0) {
      $('#address').addClass('is-invalid');
      isValid = false;
    } else {
      $('#address').removeClass('is-invalid');
    }

    // Validate postcode
    if ($('#postcode').val().trim().length === 0) {
      $('#postcode').addClass('is-invalid');
      isValid = false;
    } else {
      $('#postcode').removeClass('is-invalid');
    }

    // Validate city
    if ($('#city').val().trim().length === 0) {
      $('#city').addClass('is-invalid');
      isValid = false;
    } else {
      $('#city').removeClass('is-invalid');
    }

    // Validate email
    let email = $('#email').val().trim();
    if (email.length === 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $('#email').addClass('is-invalid');
      isValid = false;
    } else {
      $('#email').removeClass('is-invalid');
    }

    // Validate username
    if ($('#username').val().trim().length === 0) {
      $('#username').addClass('is-invalid');
      isValid = false;
    } else {
      $('#username').removeClass('is-invalid');
    }

    // Validate password
    if ($('#password').val().trim().length < 8) {
      $('#password').addClass('is-invalid');
      isValid = false;
    } else {
      $('#password').removeClass('is-invalid');
    }

    return isValid;
  }

  function showAlert(message, type) {
    // remove any existing alerts
    $('#alertContent').empty();

    // create the new alert
    var alert = $('<div>')
      .addClass('alert alert-' + type)
      .attr('role', 'alert')
      .text(message);

    // add the alert to the alertContent div
    $('#alertContent').append(alert);

    // set timeout to remove alert after 3 seconds
    setTimeout(function () {
      alert.remove();
    }, 3000);
  }

});


