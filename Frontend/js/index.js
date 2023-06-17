// Funktionen, die in mehreren JS-Skripten verwendet werden

// holt den Cookie zum eingeloggten Benutzer
function getCookie(name) {
  const value = '; ' + document.cookie;
  const parts = value.split('; ' + name + '=');
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Funktion um generelle Alerts in Modals anzuzeigen, je nach Alert Typ
function showModalAlert(message, type) {
  let alertClasses = {
    'success': 'alert-success',
    'info': 'alert-info',
    'warning': 'alert-warning',
    'danger': 'alert-danger'
  };
  let alertHtml = '<div class="alert ' + alertClasses[type] + '" role="alert">' + message + '</div>';

  $('#message-container').html(alertHtml);

  setTimeout(function () {
    $('#message-container').empty();
  }, 2000);
}

// Funktion um generelle Alerts anzuzeigen, je nach Alert Typ
function showAlert(message, type) {
  let alertClasses = {
    'success': 'alert-success',
    'info': 'alert-info',
    'warning': 'alert-warning',
    'danger': 'alert-danger'
  };
  let alertHtml = '<div class="alert ' + alertClasses[type] + ' alert-dismissible fade show" role="alert">' +
    '<strong>' + message + '</strong>' +
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
    '</div>';

  $('#alertContent').html(alertHtml);
  $('#alertContainer').removeClass('d-none');

  $('#alertContainer .btn-close').on('click', function () {
    $('#alertContainer').addClass('d-none');
  });

  setTimeout(function () {
    $('#alertContainer').addClass('d-none');
  }, 3000);
}

// Funktion um die Sektionen des Admin Dashboards zu laden
function loadSection(sectionID) {
  $('#mainView').empty();
  $('#mainView').load('sites/dashboard.html #' + sectionID);
}