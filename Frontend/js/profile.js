/*
In "profile.js", "profile.html" und "profileLogic.php" befindet sich die Logik für den Login und die Registrieruung.
*/
$(document).ready(function () {


  updateFeatures();
  // Wenn jemand noch kein Benutzerkonto hat und sich registrieren will, und auf das Login-Modal klickt und die Person noch kein BenutzerInnenkonto besitzt,
  //dann erscheint noch ein Button in Form eines Links, wo man sich registrieren kann. Beim draufklicken, öffnet sich das Modal zur Registrierung und das Modal zum Login wird gehidet.
  $(document).on('click', '#openRegisterModal', function (event) {
    event.preventDefault();
    $('#loginModal').modal('hide');
    $('#modal-placeholder').load('sites/register.html', function () {
      $('#registerModal').modal('show');
    });
  });
  //Wenn man sich einloggen will und auf den Button klickt zum Einloggen, dann öffnet sich das LoginModal und das RegistrierungsModal wird gehidet
  // Wenn jemand eingeloggt ist
  $(document).on("click", "#openLoginModal", function (event) {
    event.preventDefault();
    $("#registerModal").modal("hide");
    $("#modal-placeholder").load("sites/login.html", function () {
      $("#loginModal").modal("show");
    });
  });
  //Hier wird das Modal entsprechend geöffnet, je nachdem ob man eingeloggt ist oder nicht
  $(document).on('click', '#profileAction', function () {
    let isLoggedIn = !!getCookie('username');
    var filePath = isLoggedIn ? 'sites/profile.html' : 'sites/login.html';
    var modalId = isLoggedIn ? '#profileModal' : '#loginModal';
    $('#modal-placeholder').empty();
    $('#modal-placeholder').load(filePath, function () {
      if (isLoggedIn) {
        loadProfileData();
      }
      $(modalId).modal('show');
    });
  });
  //Hier kann der/ die BenutzerIn seine BenutzerInnendaten ändern beim Klick auf den entsprechenden Button. 
  //Dann wird die Funktion changeProfileData aufgerufen
  $(document).on('click', '#changeButton', function () {
    changeProfileData();
  });
  //Hier wird der ajax-Call für die Registrierung ausgeführt.
  //In jquery wird noch überprüft, ob der User die Nutzungsbedingungen akzeptiert hat und die Registrierung valide ist.
  $(document).on("click", "#registerButton", function () {
    if (!$("#termsCheck").prop("checked")) {
      $("#termsCheck").addClass("is-invalid");
      showModalAlert(
        "Bitte stimmen Sie den Nutzungsbedingungen zu!",
        "warning"
      );
      return;
    }
    if (!validateRegisterForm()) {
      showModalAlert(
        "Bitte beachten Sie die Anforderungen für die Registrierung!",
        "warning"
      );
      return;
    }
    // Der "Post"-Ajax-Call wird ausgeführt, welcher die einzelnen Daten an das Backend schickt und die Methode
    // registerUser wird in weiterer Folge aufgerufen
    $.ajax({
      type: "POST",
      url: "../Backend/logic/requestHandler.php",
      data: {
        method: "registerUser",
        param: JSON.stringify({
          formofAddress: $("#formofAddress").val(),
          firstName: $("#firstName").val(),
          lastName: $("#lastName").val(),
          address: $("#address").val(),
          postcode: $("#postcode").val(),
          city: $("#city").val(),
          email: $("#email").val(),
          username: $("#username").val(),
          password: $("#password").val(),
          passwordSecond: $("#passwordSecond").val()
        }),
      },
      // es erscheint eine Meldung je nachdem, ob die Registrierung erfolgreich war 
      // und nach dem Erfolg werden die Inputs aus dem Formular gelöscht
      dataType: "json",
      success: function (response) {
        if (response.success) {
          $("#formofAddress option:first").prop("selected", true);
          $("#firstName").val("");
          $("#lastName").val("");
          $("#address").val("");
          $("#postcode").val("");
          $("#city").val("");
          $("#email").val("");
          $("#username").val("");
          $("#password").val("");
          $("#passwordSecond").val("");
          document.getElementById('termsCheck').checked = false;
          showModalAlert(
            "Registrierung erfolgreich, Sie können sich nun einloggen!",
            "success"
          );
        } else if (response.error) {
          showModalAlert(response.error, "danger");
        }
      },
      error: function () {
        alert("Fehler bei der Abfrage!");
      },
    });
  });

  // wenn auf den Loginbutton geklickt wird, wird ein ajax call für den Login ausgeführt
  $(document).on('click', '#loginButton', function () {
    let userInput = $('#userInput').val().trim();
    let password = $('#password').val().trim();
    // Zuerst wir überprüft, ob die Email und das Passwort nicht leer sind und ob das Passwort eine Länge >=8 besitzt,
    // wenn dies nicht der Fall ist, dann erscheint eine entsprechende Meldung
    if (userInput === '') {
      showModalAlert('Geben Sie bitte einen Benutzernamen oder E-Mail ein!', 'warning');
      return;
    }

    if (password === '') {
      showModalAlert('Geben Sie bitte ein Passwort ein!', 'warning');
      return;
    }

    if (password.length < 8) {
      showModalAlert('Geben Sie bitte ein Passwort mit mindestens 8 Zeichen ein!', 'warning');
      return;
    }

    // Hier wird der ajax call ausgeführt, welcher die  loginUser Methode ausführt
    $.ajax({
      type: 'POST',
      url: '../Backend/logic/requestHandler.php',
      data: {
        method: 'loginUser',
        param: JSON.stringify({
          userInput: userInput,
          password: password,
          rememberLogin: $('#remember_login').prop('checked')
        })
      },
      dataType: 'json',
      success: function (response) {
        // wenn der Login erfolgreich war, wird das Loginformular und der Loginbutton gehidet
        // und eine entsprechende Meldung erscheint.
        // Im Falle eines Errors erscheint eine Warnungsmeldung
        if (response.success) {
          updateFeatures();
          $('#loginForm').hide();
          $('#loginButton').hide();
          showModalAlert(response.success, 'success');
          setTimeout(function () {
            $('#loginModal').modal('hide');
            $('#modal-placeholder').empty();
          }, 1000);
        } else if (response.error) {
          showModalAlert(response.error, 'warning');
        }
      },
      error: function () {
        alert("Fehler bei der Abfrage!");
      }
    });
  });

  // Wenn man seine Profildaten ändern will, erscheint das Modal, welches diese Daten enthält. 
  // Hier wird die Methode getProfileData aufgerufen, welche im Success-Full die alten Daten des Users anzeigt. 
  // Im Error-Fall erscheint eine entsprechende Meldung
  function loadProfileData() {
    let username = getCookie("username");
    $.ajax({
      type: "GET",
      url: "../Backend/logic/requestHandler.php",
      data: {
        method: "getProfileData",
        param: JSON.stringify(username),
      },
      dataType: "json",
      success: function (response) {
        $("#firstNameold").text(response.vorname);
        $("#lastNameold").text(response.nachname);
        $("#addressold").text(response.adresse);
        $("#postcodeold").text(response.plz);
        $("#cityold").text(response.ort);
        $("#emailold").text(response.email);
        $("#usernameold").text(response.username);
        $("#formofAddressold").text(response.anrede);
      },
      error: function () {
        alert("Fehler beim Login!");
      },
    });
  }

  // Wenn man seine Profildaten ändern will, dann wird die Funktion changeProfileData aufgerufen,
  // welche einen Postrequest an den requestHandler schickt, der die updateuserData-Method aufruft.
  // Im Success-Fall werden die aktualisierten User-Daten geladen und im Error-Fall eine entsprechende Meldung.
  function changeProfileData() {
    let username = getCookie('username');
    let newData = [];
    newData.firstName = $('#firstNamenew').val();
    newData.lastName = $('#lastNamenew').val();
    newData.email = $('#emailnew').val();
    newData.pw = $('#passwordnew').val();
    newData.adress = $('#addressnew').val();
    newData.city = $('#citynew').val();
    newData.plz = $('#postcodenew').val();
    newData.username = $('#usernamenew').val();
    newData.pw_alt = $('#pw_alt').val();
    let allEmpty = Object.values(newData).every(value => value === '');
    let oldFormOfAddress = $('#formofAddressold').text();
    newData.formofAddress = $('#formofAddressnew').val();
    if (allEmpty && (oldFormOfAddress == newData.formofAddress)) {
      showModalAlert('Sie haben nichts eingegeben!', 'warning');
      return;
    }

    $.ajax({
      type: 'POST',
      url: '../Backend/logic/requestHandler.php',
      data: {
        method: 'updateUserData',
        param: JSON.stringify({
          actualusername: username,
          firstName: newData.firstName,
          lastName: newData.lastName,
          email: newData.email,
          pw: newData.pw,
          adress: newData.adress,
          city: newData.city,
          postcode: newData.plz,
          username: newData.username,
          formofAddress: newData.formofAddress,
          pw_alt: newData.pw_alt
        })
      },
      dataType: 'json',
      success: function (response) {
        if (response.success) {
          showModalAlert(response.success, 'success');
          $('#firstNamenew').val('');
          $('#lastNamenew').val('');
          $('#emailnew').val('');
          $('#passwordnew').val('');
          $('#addressnew').val('');
          $('#citynew').val('');
          $('#postcodenew').val('');
          $('#usernamenew').val('');
          $('#pw_alt').val('');
          loadProfileData();
          updateFeatures();
        } else if (response.error) {
          showModalAlert(response.error, 'warning');
        }
      },
      error: function () {
        alert("Fehler beim Aktualisieren der Daten!");
      }
    });
  }

  // Der Ajax-Call für Logout, welcher einen Post-Request an den Request-Handler schickt und die Methode logoutUser wird aufgeruden,
  // welche den User ausloggt
  // ajax call for logout
  $(document).on("click", "#logoutButton", function () {
    $.ajax({
      type: "POST",
      url: "../Backend/logic/requestHandler.php",
      data: {
        method: "logoutUser",
      },
      dataType: "json",
      success: function (response) {
        if (response.loggedIn === false) {
          updateFeatures();
        }
      },
      error: function () {
        alert("Fehler bei der Abfrage!");
      },
    });
  });

  // wenn man sich einloggt, ausloggt oder seite refreshed oder wenn man profildaten ändert
  // damit die Daten immer richtig aktualisiert werden
  function updateFeatures() {
    const username = getCookie("username");
    const rememberLogin = getCookie("rememberLogin");

    if (username && rememberLogin) {
      // User cookies are present, make the AJAX request to retrieve session information
      $.ajax({
        type: "GET",
        url: "../Backend/logic/requestHandler.php",
        data: {
          method: "getSessionInfo",
        },
        dataType: "json",
        success: function (response) {
          if (
            response.status === "loggedInAdmin" ||
            response.status === "loggedInUser"
          ) {
            let isAdmin = response.status === "loggedInAdmin";
            updateNavbar(true, username, isAdmin);
            if (isAdmin) {
              $("#productFilter").hide();
              $("#mainView").load("sites/dashboard.html #adminDashboard");
            } else {
              // Load the default content for non-admin users
              $("#productFilter").show();
              $("#mainView").empty();
              loadAllProducts();
            }
          } else {
            updateNavbar(false, "", false);
            $("#productFilter").show();
            $("#mainView").empty();
            loadAllProducts();
          }
        },
        error: function () {
          alert("Fehler bei der Abfrage!");
        },
      });
    } else {
      // User is not logged in or cookies are not present, update the UI accordingly
      updateNavbar(false, "", false);
      $("#productFilter").show();
      $("#mainView").empty();
      loadAllProducts();
    }
  }

  // Hier wird die entsprechende Navbar, je nach Status angezeigt
  function updateNavbar(isLoggedIn, username, isAdmin) {
    // default state - not logged in users
    $("#usernameDisplay").text("");
    $("#usernameDisplay").hide();
    $("#showCart").show();
    $("#showOrders").hide();
    $("#showAdminDashboard").hide();
    $("#logoutButton").hide();

    // if a user is logged in
    if (isLoggedIn) {
      $("#usernameDisplay").text(username);
      $("#usernameDisplay").show();
      $("#logoutButton").show(); // show logout button
      // if the logged in user is admin
      if (isAdmin) {
        $("#showCart").hide();
        $("#showAdminDashboard").show(); // show admin dashboard
      } else {
        $("#showOrders").show(); // show orders
      }
    }
  }
  
  //wird immer von validateRegisterForm aufgerufen
  function validateInput(input) {
    if (input.val().trim().length === 0) {
      input.addClass("is-invalid");
      return false;
    } else {
      input.removeClass("is-invalid");
      return true;
    }
  }

  function validateRegisterForm() {
    let isValid = true;
    // checkt schrittweise, ob Daten eingegeben wurden bei RegisterModal
    isValid = validateInput($("#firstName")) && isValid;
    isValid = validateInput($("#lastName")) && isValid;
    isValid = validateInput($("#address")) && isValid;
    isValid = validateInput($("#postcode")) && isValid;
    isValid = validateInput($("#city")) && isValid;
    // checkt, ob das eine gültige Email ist
    let email = $("#email").val().trim();
    if (email.length === 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $("#email").addClass("is-invalid");
      isValid = false;
    } else {
      $("#email").removeClass("is-invalid");
    }

    isValid = validateInput($("#username")) && isValid;
    // checht, ob es 8 Zeichen ohne Leerzeichen hat
    if ($("#password").val().trim().length < 8) {
      $("#password").addClass("is-invalid");
      isValid = false;
    } else {
      // macht rote Umrandung weg
      $("#password").removeClass("is-invalid");
    }
    // ckeckt 2.Passwort
    if ($("#passwordSecond").val().trim().length < 8) {
      $("#passwordSecond").addClass("is-invalid");
      isValid = false;
    } else {
      $("#passwordSecond").removeClass("is-invalid");
    }
    // wenn Passwörter nicht übereinstimmen
    if ($("#password").val() != $("#passwordSecond").val()) {
      $("#password").addClass("is-invalid");
      $("#passwordSecond").addClass("is-invalid");
      isValid = false;
    } else {
      // wenn Passwörter übereinstimmen
      $("#password").removeClass("is-invalid");
      $("#passwordSecond").removeClass("is-invalid");
    }

    return isValid;
  }

});