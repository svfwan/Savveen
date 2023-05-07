$(document).ready(function () {
  // navbar logic
  var storedContent = localStorage.getItem('content');
  if (storedContent) {
    $('#content').html(storedContent);
  }

  $('nav a').on('click', function (event) {
    event.preventDefault();
    var url = $(this).attr('href');
    $.get(url, function (data) {
      var $newContent = $('<div>').html(data);
      $('#content').html($newContent.find('#content').html());
      if (!$('nav').length) {
        $('body').prepend($newContent.find('nav'));
      }
      localStorage.setItem('content', $('#content').html());
    });
  });

  // ajax call for registration
  $(document).on('click', '#register', function () {
    console.log('button clicked');

    // client-side validation of parameters
    if (!$('#termsCheck').prop('checked')) {
      $('#termsCheck').addClass('is-invalid');
      $('#register-form').prepend('<div class="alert alert-warning" role="alert">Bitte stimmen Sie den Nutzungsbedingungen zu!</div>');
      setTimeout(function () {
        $('.alert-warning').remove();
      }, 3000);
      return;
    }
    if (!validateRegisterForm()) {
      $('#register-form').prepend('<div class="alert alert-warning" role="alert">Bitte beachten Sie die Anforderungen für die Registrierung!</div>');
      setTimeout(function () {
        $('.alert-warning').remove();
      }, 3000);
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
          $('#register-form').prepend('<div class="alert alert-success" role="alert">Registrierung erfolgreich, Sie können sich nun einloggen!</div>');
          setTimeout(function () {
            $('.alert-success').remove();
          }, 3000);
        } else if (response.error) {
          $('#register-form').prepend('<div class="alert alert-danger" role="alert">' + response.error + '</div>');
          setTimeout(function () {
            $('.alert-danger').remove();
          }, 3000);
        }
      },
      error: function (error) {
        $('#loadingSpinner').css('display', 'none');
        console.log(error);
      }
    });
  });


  // helper functions

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

});
