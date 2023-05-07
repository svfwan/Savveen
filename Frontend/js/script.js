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
  $('#register').on('click', function () {
    console.log('button clicked');
    $.ajax({
      type: 'POST',
      url: '../Backend/logic/requestHandler.php',
      data: {
        method: 'registerUser',
        param: {
          formofAddress: $('#formofAddress').val(),
          firstName: $('#firstName').val(),
          lastName: $('#lastName').val(),
          address: $('#address').val(),
          postcode: $('#postcode').val(),
          city: $('#city').val(),
          email: $('#email').val(),
          username: $('#username').val(),
          password: $('#password').val(),
        }
      },
      dataType: 'json',
      success: function (response) {
        console.log(JSON.stringify(response));
      },
      error: function (error) {
        console.log(JSON.stringify(error));
      }
    });
  });


//Login-Ajax-Call

$('#loginbutton').on('click',function(){
  console.log('Login Button clicked');
  $.ajax({
    type: 'POST',
    url: '../Backend/logic/requestHandler.php',
    data: {
      method: 'loginUser',
      param:{
      username: $('#username').val(),
      password: $('#password').val()
      }
    },
    dataType: 'json',
    success: function(response){
      console.log(JSON.stringify(response));
    },
    error: function(error){
      console.log(JSON.stringify(error));

    }
  });

})

});


