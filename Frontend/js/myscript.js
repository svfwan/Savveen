/*const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("remember-me").checked;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "../../Backend/config/dataHandler.php");
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            const response = this.responseText;
            if (response === "success") {
                window.location.href = "success.html";
            } else {
                alert("Benutzername oder Passwort ungültig!");
            }
        }
    };
    xhr.send("username=" + encodeURIComponent(username) + "&password=" +
        encodeURIComponent(password) + "&remember_me=" + encodeURIComponent(rememberMe));
});*/
