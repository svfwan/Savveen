$(document).ready(function () {

  /*
    note for self/team:
     - dynamic loading of pages getting messy
     - script getting long
     - navbar logic getting complicated
     - when I log in content of login-form is saved and when I refresh because of local storage it gets loaded back in

    possible solution:
    - keep navbar same everywhere -> find way to keep navbar but change page below maybe
    - seperate scripts i.e. register.js, login.js
    - keep common functionality in script.js
    - move to MPA, but dynamic loading of content still via scripts
    - create seperate columns/divs in index.html for components such as login
      -> then load those or hide them -> more SPA-affirm --> see modals, icons in nav etc

    further issues/ideas/solutions:
     - ...
  */

  // method to update frontend features based on backend session variables
  updateFeatures();

  /* 
    does not work fully yet, login form can still be seen if user refreshes once logged in,
    may be due to localStorage handling for div content
  */
  function updateFeatures() {
    // Always make an AJAX request to get the session information
    // change to get request
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
          let username = getCookie('username');
          let isAdmin = response.status === 'loggedInAdmin';
          updateNavbar(true, username, isAdmin);
        } else {
          updateNavbar(false, '', false);
        }
      },
      error: function (error) {
        console.log(error);
      },
    });
  }

  // navbar logic
  var storedContent = localStorage.getItem('content');
  if (storedContent) {
    $('#content').html(storedContent);
  }

  addNavbarClickEvents();

  // ajax call for registration
  $(document).on('click', '#register', function () {
    console.log('button clicked');
    if (!$('#termsCheck').prop('checked')) {
      $('#termsCheck').addClass('is-invalid');
      showAlert('Bitte stimmen Sie den Nutzungsbedingungen zu!', 'warning');
      return;
    }
    if (!validateRegisterForm()) {
      showAlert('Bitte beachten Sie die Anforderungen für die Registrierung!', 'warning');
      return;
    }
    $('#loadingSpinner').css('display', 'block');
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
    $('#loadingSpinner').css('display', 'block');
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

  // ajax call for logout
  $(document).on('click', '#logout', function () {
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


  // helper functions

  function getCookie(name) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function updateNavbar(isLoggedIn, username, isAdmin) {
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

    const notLoggedInNavbar = `
        <li class="nav-item">
          <button class="nav-link btn btn-link" data-page="register">Registrierung</button>
        </li>
        <li class="nav-item">
          <button class="nav-link btn btn-link" data-page="login">Login</button>
        </li>
    `;

    let loggedInNavbar = '';
    if (isLoggedIn) {
      loggedInNavbar = `
            <li class="nav-item">
              <button class="nav-link btn btn-link" data-page="profile">${username}</button>
            </li>
        `;
    }

    let adminNavbar = '';
    if (isAdmin) {
      adminNavbar = `
            <li class="nav-item">
              <button class="nav-link btn btn-link" data-page="dashboard">Admin Dashboard</button>
            </li>
        `;
    }

    let navbarItems = '';
    if (isLoggedIn) {
      logout = `
       <li class="nav-item">
          <button class="nav-link btn btn-link" id="logout">Logout</button>
       </li>`;
    }
    if (isAdmin) {
      navbarItems += adminNavbar + basicNavbar + logout;
    } else if (isLoggedIn) {
      navbarItems += loggedInNavbar + basicNavbar + logout;
    } else {
      navbarItems += notLoggedInNavbar + basicNavbar;
    }

    $('#navbarNav > ul.navbar-nav').html(navbarItems);
    addNavbarClickEvents();
  }

  function addNavbarClickEvents() {
    $('button[data-page]').on('click', function (event) {
      event.preventDefault();
      var page = $(this).data('page');
      console.log(page);
      $('#content').load(`sites/${page}.html #content > *`, function () {
        localStorage.setItem('content', $('#content').html());
      });
    });
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

  function showAlert(message, type) {
    $('#alertContent').empty();
    var alert = $('<div>')
      .addClass('alert alert-' + type)
      .attr('role', 'alert')
      .text(message);
    $('#alertContent').append(alert);
    setTimeout(function () {
      alert.remove();
    }, 3000);
  }

});