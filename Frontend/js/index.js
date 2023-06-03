/*
  JS-file for common (helper-) functions

  issues/problems:
  -

  possible solution:
  - 
 
  further issues/ideas/solutions:
  - when adding product to cart 6 items are added -> possible conflict because of button naming
  - look into using more specific IDs and Classes for styling/jQuery referencing
  - importing common/helper function:
    import { specificFunction } from './path/to/other/file.js';

    // Now you can use the imported function
    specificFunction();

    In the file that contains the specific function (./path/to/other/file.js in the example above):

    export function specificFunction() {
      // Function implementation
    }
*/


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

  // Wait for 2 seconds and then hide the alert
  setTimeout(function () {
    $('#message-container').empty();
  }, 2000);
}

function showAlert(message, type) {
  var alertClasses = {
    'success': 'alert-success',
    'info': 'alert-info',
    'warning': 'alert-warning',
    'danger': 'alert-danger'
  };
  var alertHtml = '<div class="alert ' + alertClasses[type] + ' alert-dismissible fade show" role="alert">' +
    '<strong>' + message + '</strong>' +
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
    '</div>';
  // Add the alert HTML to alertContent
  $('#alertContent').html(alertHtml);
  // Remove the d-none class from the alertContainer to show the alert
  $('#alertContainer').removeClass('d-none');

  // Handle the close button click event
  $('#alertContainer .btn-close').on('click', function () {
    // Add the d-none class to the alertContainer to hide it
    $('#alertContainer').addClass('d-none');
  });
}

function loadSection(sectionID) {
  // Empty the mainView section
  $('#mainView').empty();
  // Load the content of the corresponding section
  $('#mainView').load('sites/dashboard.html #' + sectionID);
}