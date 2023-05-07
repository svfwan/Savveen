$(document).ready(function () {
  // Navbar-Logik
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

  // Registrierung-Ajax-Call
  $(document).on('click', '#register', function () {
    console.log('button clicked');
    if (!$('#termsCheck').prop('checked')) {
      $('#termsCheck').addClass('is-invalid');
      $('#register-form').prepend('<div class="alert alert-warning" role="alert">Bitte stimmen Sie den Nutzungsbedingungen zu!</div>');
      setTimeout(function () {
        $('.alert-warning').remove();
      }, 5000);
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
          $('#register-form').prepend('<div class="alert alert-success" role="alert">Registrierung erfolgreich, Sie können sich nun einloggen!</div>');
          setTimeout(function () {
            $('.alert-success').remove();
          }, 3000);
        } else if (response.error) {
          $('#register-form').prepend('<div class="alert alert-danger" role="alert">' + response.error + '</div>');
          setTimeout(function () {
            $('.alert-danger').remove();
          }, 5000);
        }
      },
      error: function (error) {
        $('#loadingSpinner').css('display', 'none');
        console.log(error);
      }
    });
  });

});
