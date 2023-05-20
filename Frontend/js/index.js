$(document).ready(function () {

  /*
    possible solution:
    - 
  
    further issues/ideas/solutions:
    - products view not done yet,
    - products not loaded correctly
    - pictures should be loaded from frontend folder img/ not backend folder productpictures
    - when products are added to the cart, they are added to the wrong, offCanvas div element
    - cartCounter needs to be updated once items are added and removed from offCanvas view as well
    - only use jQuery when necessary
  */

});

// common helper functions

function getCookie(name) {
  const value = '; ' + document.cookie;
  const parts = value.split('; ' + name + '=');
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function showModalAlert(message, type) {
  var alertClasses = {
    'success': 'alert-success',
    'info': 'alert-info',
    'warning': 'alert-warning',
    'danger': 'alert-danger'
  };
  var alertHtml = '<div class="alert ' + alertClasses[type] + '" role="alert">' + message + '</div>';
  // Add the alert HTML to the message container
  $('#message-container').html(alertHtml);
}

function showAlert(message, type) {
  var alertClasses = {
    'success': 'alert-success',
    'info': 'alert-info',
    'warning': 'alert-warning',
    'danger': 'alert-danger'
  };
  var alertHtml = '<div class="alert ' + alertClasses[type] + '" role="alert">' + message + '</div>';
  // Add the alert HTML to alertContent
  $('#alertContent').html(alertHtml);
  // Remove the d-none class from the alertContainer to show the alert
  $('#alertContainer').removeClass('d-none');
}
