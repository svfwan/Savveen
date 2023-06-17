$(document).ready(function () {
    let storedCart = JSON.parse(sessionStorage.getItem("myCart"));
    //warenkorb wurde in einem session array gespeichert und wird aufgerufen
    let length = 0;

    //anzahl der produkte im warenkorb berechnen
    if (storedCart && storedCart.length > 0) {
        for (let i = 0; i < storedCart.length; i++) {
            length += storedCart[i].quant;
        }
    }

    //anzahl der produkte im warenkorb anzeigen
    updateCartCounter(length);
    $("#mainView").empty();

    //nach einer kategorie filtern
    $("#filterCategory").on("click", function () {
        displayCategory();
    });

    //nach buchstaben/wörten filtern
    $(document).on('input', '#searchTerm', function (e) {
        const value = e.target.value.trim();
        $("#category").val(""); //wert des input feldes
        searchProducts(value);
    });

    //produkt in den warenkorb hinzufügen.
    $(document).on("click", ".add-to-cart-btn", function () {
        let productID = $(this).data('product-id');
        addCart(productID);
    });
});

function updateCartCounter(length) { //anzahl der produkte im warenkorb anzeigen
    $("#cartCounter").text(length);
}

function loadAllProducts() { //Alle Produkte aus der db holen
    $.ajax({
        type: "GET",
        url: "../Backend/logic/requestHandler.php",
        data: {
            method: "loadAllProducts",
        },
        dataType: "json",
        success: function (data) {
            $("#category").val("");
            let $row = $("<div class='row'></div>");
            for (let i in data) {
                let cur = data[i];
                displayAll(cur, $row); //anzeigen der produkte 
            }

            fillCart(); //warenkorb füllen 
        },
        error: function () {
            alert("Fehler bei der Abfrage!");
        },
    });
}

function searchProducts(value) { //nach Produkten mit buchstaben/wörtern filtern. 
    //value gibt an, wonach gefiltert werden soll. 
    //ajax call
    $.ajax({
        type: "GET",
        url: "../Backend/logic/requestHandler.php",
        data: {
            method: "searchProducts",
            param: JSON.stringify({
                letter: value,
            }),
        },
        dataType: "json",
        success: function (response) {
            if (response.error) {
                alert(response.error); //wenn es keine produkte gibt mit value filter
            } else {
                $("#mainView").empty(); //bisherige produkte entfernen. 
                let $row = $("<div class='row'></div>");
                for (let i in response) {
                    displayAll(response[i], $row); //produkte anzeigen, die gefiltert wurden
                }
            }
        },
        error: function () {
            alert("Fehler bei der Abfrage");
        },
    });
}
 
function displayCategory() { //nur eine bestimmte kategorie anzeigen 
    const selectedValue = $("#category").val();
    //selectedValue = Kategorie nach der gefiltert werden soll. 

    //ajax call
    $.ajax({
        type: "GET",
        url: "../Backend/logic/requestHandler.php",
        data: {
            method: "loadAllProducts",
        },
        dataType: "json",
        success: function (data) {
            $("#mainView").empty();
            let $row = $("<div class='row'></div>");
            for (let i in data) {
                let cur = data[i];
                if (selectedValue === "") { 
                    displayAll(cur, $row);
                } else if (cur.kategorie === selectedValue) {
                    displayAll(cur, $row);
                }
            }
            fillCart();
        },
        error: function () {
            alert("Fehler bei der Abfrage!");
        },
    });
}

function displayAll(data, $row) { //Produkte anzeigen
    let starsHTML = '';
    for (let i = 0; i < data.bewertung; i++) { //sterne anzeigen für die bewertung des produkts
        starsHTML += '<span class="fa fa-star checked"></span>';
    }
    for (let i = data.bewertung; i < 5; i++) {
        starsHTML += '<span class="fa fa-star"></span>';
    }
    let pictureCacheRemover = new Date().getTime();
    //html element für ein produkt erzeugen, inkl bild,produktname, preis, beschreibung und anzahl der sterne für die bewertung
    let productHTML = `
        <div class="col-sm-6 col-md-4 col-lg-3">
            <div class="product card product-card">
            <div class="card-img-container">
                <div class="img-wrapper">
                <img src="../Frontend/res/img/${data.name}.jpg?${pictureCacheRemover}" class="card-img-top product-img" alt="${data.name}">
                </div>
            </div>
            <div class="card-body product-card-body">
                <h5 class="card-title">${data.name}</h5>
                <p class="card-text price">${data.preis}€</p>
                <p class="card-text description text-sm text-break">${data.beschreibung}</p>
                <p class="card-text stars">${starsHTML}</p>
                <button class="btn btn-success add-to-cart-btn" data-product-id="${data.id}">In den Warenkorb hinzufügen</button>
            </div>
            </div>
        </div>
    `;

    //dieses produkt in der startseite abbilden

    let $product = $(productHTML);

    $row.append($product);

    

    if ($row.children().length === 4) {
        $("#mainView").append($row);
        $row = $("<div class='row'></div>");
    } else {
        $("#mainView").append($row);
    }
}

function addCart(productID) { //produkt im warenkorb hinzufügen
    //ajax call, bei dem man die productdetails aus der db holt. 
    $.ajax({
        type: "GET",
        url: "../Backend/logic/requestHandler.php",
        data: {
            method: "loadProductByID",
            param: productID
        },
        dataType: "json",
        success: function (response) {
            if (response.data) {
                let item = response.data;
                addItemtoCart(item);
            } else {
                alert("Bitte versuchen Sie es später erneut!");
            }
        },
        error: function () {
            alert("Fehler bei der Abfrage!");
        },
    });
}

function addItemtoCart(data) { //ein Produkt dem Warenkorb hinzufügen
    let myCart = [];
    if (sessionStorage.getItem("myCart")) { //sessionarray warenkorb holen
        myCart = JSON.parse(sessionStorage.getItem("myCart"));
    }

    let existingItem = myCart.find((item) => item.id === data.id); //überprüft, ob ein product bereits im warenkorb ist, indem es schaut ob die ids matchen

    if (existingItem) { //wenn das produkt bereits im warenkorb ist, wird nur quant um 1 erhöht. 
        existingItem.quant += 1;
    } else { //wenn das produkt noch nicht im warenkorb ist, werden folgende daten dem warenkorb hinzugefügt
        myCart.push({
            id: data.id,
            name: data.name,
            price: data.preis,
            beschreibung: data.beschreibung,
            cat: data.kategorie,
            quant: 1,
        });
    }

    sessionStorage.setItem("myCart", JSON.stringify(myCart));

    let length = myCart.reduce((total, item) => total + item.quant, 0); //anzahl der produkte im warenkorb erhöhen. 
    updateCartCounter(length);

    // die produkte im warenkorb dynamisch updaten. 
    updateCartItems(myCart);
}

function updateCartItems(myCart) {
    const $cartItems = $("#cartItems");
    const $cartTotal = $("#cartTotal");

    $cartItems.empty();
    $cartTotal.empty();

    

    if (myCart.length > 0) {
        let gesamtpreis = 0;

        

        for (let i = 0; i < myCart.length; i++) {
            const item = myCart[i];

            //html element wird erstellt für die einzelnen produkte im warenkorb
            const $item = $(`
          <div class="list-group-item d-flex align-items-center">
            <img src="../Frontend/res/img/${item.name}.jpg" alt="${item.name}" class="cart-item-img">
            <div class="flex-grow-1">
              <div>Name: ${item.name}</div>
              <div>Preis: ${item.price}</div>
              <div>Anzahl: ${item.quant}</div>
              <div class="btn-group" role="group">
                <button class="btn btn-danger remove-btn" data-item="${i}">-</button>
                <button class="btn btn-success add-btn" data-item="${i}">+</button>
              </div>
            </div>
          </div>
        `);

            $item.find(".remove-btn").on("click", function () { //anzahl eines produkts verringern
                removeItem(item);
            });

            $item.find(".add-btn").on("click", function () { //anzahl eines produkts erhöhen
                addCart(item.id);
            });

            $cartItems.append($item);  //im warenkorb anzeigen

            gesamtpreis += item.price * item.quant; //gesamtpreis berechnen
        }


        $cartTotal.html(`<div class="mt-3">Gesamtpreis: ${gesamtpreis}€</div>`); //gesamtpreis anzeigen
        $('#orderCart').show();
    } else { //wenn der warenkorb leer ist
        $cartItems.html('<h2>Ihr Warenkorb ist leer</h2>');
        $('#orderCart').hide();
    }
}

function fillCart() { 
    const isAdmin = getCookie('admin') === 'true'; 
    const isLoggedIn = getCookie('username') ? true : false;

    if (isLoggedIn && isAdmin) { //kontrolliert ob user und admin eingeloggt sind
        return;
    }

    const myCart = JSON.parse(sessionStorage.getItem("myCart")); //holt warenkorkarray aus session storage

    if (myCart && myCart.length > 0) { //wenn der warenkorb nicht leer ist, werden die einzelnen produkte angezeigt. 
        updateCartItems(myCart);
    } else {
        $("#cartItems").html('<h2>Ihr Warenkorb ist leer</h2>');
        $("#cartTotal").empty();
        $("#orderCart").hide();
    }

}

function removeItem(data) { //anzahl eines produkts um 1 verringern
    let myCart = [];
    if (sessionStorage.getItem("myCart")) {
        myCart = JSON.parse(sessionStorage.getItem("myCart"));
    }

    for (let i = 0; i < myCart.length; i++) {
        if (myCart[i].id === data.id) {
            if (myCart[i].quant === 1) {//wenn Anzahl 1 verringert werden soll, wird das ganze produkt aus dem array entfernt
                myCart.splice(i, 1); 
                break;
            } else {
                myCart[i].quant = myCart[i].quant - 1; //sonst wird nur die anzahl verringert.
            }
        }
    }
    sessionStorage.setItem("myCart", JSON.stringify(myCart)); //speichert das array in der array

    let length = myCart.reduce((total, item) => total + item.quant, 0); // anzahl der produkte im warenkorb aktualisieren
    updateCartCounter(length);

    // Aktualisiert die Cart Elemente dynamisch
    updateCartItems(myCart);
}

function addExistingItem(data) { //ein produkt hinzufügen, was bereits im warenkorb ist
    let myCart = [];
    if (sessionStorage.getItem("myCart")) {
        myCart = JSON.parse(sessionStorage.getItem("myCart"));
    }

    for (let i = 0; i < myCart.length; i++) {
        if (myCart[i].id === data.id) { 
            myCart[i].quant = myCart[i].quant + 1; //anzahl des produkts um 1 erhöhen
            break;
        }
    }

    sessionStorage.setItem("myCart", JSON.stringify(myCart));

    //Aktualisiert die Cart Elemente dynamisch
    updateCartItems(myCart);
}