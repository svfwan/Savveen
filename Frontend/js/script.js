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
  $('#register').on('click', function (event) {
    event.preventDefault();
    $.ajax({

    });
  });

});
