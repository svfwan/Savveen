$(document).ready(function () {
 
  $('nav a').on('click', function (event) {
    event.preventDefault();
    var url = $(this).attr('href');
    $.get(url, function (data) {
      var $newContent = $('<div>').html(data);
      $('#content').html($newContent.find('#content').html());
      if (!$('nav').length) {
        $('body').prepend($newContent.find('nav'));
      }
    });
  });

  $('#registration-form').submit(function (event) {
    event.preventDefault();
    var formData = $(this).serialize();
    $.ajax({
      type: 'POST',
      url: '../Backend/logic/requestHandler.php',
      data: formData,
      success: function (response) {
      },
      error: function (xhr, status, error) {
      }
    });
  });
});
