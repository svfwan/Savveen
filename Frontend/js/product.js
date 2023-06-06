$(document).ready(function () {
    let storedCart = JSON.parse(sessionStorage.getItem("myCart"));
    let length = 0;

    if (storedCart && storedCart.length > 0) {
        for (let i = 0; i < storedCart.length; i++) {
            length += storedCart[i].quant;
        }
    }

    updateCartCounter(length);
    $("#mainView").empty();

    $("#filterCategory").on("click", function () {
        displayCategory();
    });

    $(document).on('input', '#searchTerm', function (e) {
        const value = e.target.value.trim();
        $("#category").val("");
        searchProducts(value);
    });

    $(document).on("click", ".add-to-cart-btn", function () {
        let productID = $(this).data('product-id');
        addCart(productID);
    });
});

function updateCartCounter(length) {
    $("#cartCounter").text(length);
}

function loadAllProducts() {
    $.ajax({
        type: "GET",
        url: "../Backend/logic/requestHandler.php",
        data: {
            method: "loadAllProducts",
        },
        dataType: "json",
        success: function (data) {
            let $row = $("<div class='row'></div>");
            for (let i in data) {
                let cur = data[i];
                displayAll(cur, $row);
            }

            fillCart();
        },
        error: function (error) {
            alert(error);
        },
    });
}

function searchProducts(value) {
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
                alert(response.error);
            } else {
                $("#mainView").empty();
                let $row = $("<div class='row'></div>");
                for (let i in response) {
                    displayAll(response[i], $row);
                }
            }
        },
        error: function (error) {
            alert("Fehler bei der Abfrage");
        },
    });
}

function displayCategory() {
    const selectedValue = $("#category").val();
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
                    console.log(cur.beschreibung);
                    displayAll(cur, $row);
                }
            }
            fillCart();
        },
        error: function (error) {
            alert(error);
        },
    });
}

function displayAll(data, $row) {
    let starsHTML = '';
    for (let i = 0; i < data.bewertung; i++) {
        starsHTML += '<span class="fa fa-star checked"></span>';
    }
    for (let i = data.bewertung; i < 5; i++) {
        starsHTML += '<span class="fa fa-star"></span>';
    }
    let pictureCacheRemover = new Date().getTime();
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


    let $product = $(productHTML);

    $row.append($product);

    if ($row.children().length === 4) {
        $("#mainView").append($row);
        $row = $("<div class='row'></div>");
    } else {
        $("#mainView").append($row);
    }
}

function addCart(productID) {
    let myCart = [];
    let quantityInCart = 0;
    if (sessionStorage.getItem("myCart")) {
        myCart = JSON.parse(sessionStorage.getItem("myCart"));
        for (let i = 0; i < myCart.length; i++) {
            if (myCart[i].id == productID) {
                quantityInCart = myCart[i].quant;
                break;
            }
        }
    }

    $.ajax({
        type: "GET",
        url: "../Backend/logic/requestHandler.php",
        data: {
            method: "checkStock",
            param: JSON.stringify({
                id: productID,
            }),
        },
        dataType: "json",
        success: function (response) {
            let item = response;
            let stock = item.bestand;
            if (quantityInCart + 1 <= stock) {
                addItemtoCart(item);
            } else {
                alert("Dieses Produkt haben wir leider nicht mehr auf Lager!");
            }
        },
        error: function () {
            alert("Fehler bei der Abfrage!");
        },
    });
}

function addItemtoCart(data) {
    let myCart = [];
    if (sessionStorage.getItem("myCart")) {
        myCart = JSON.parse(sessionStorage.getItem("myCart"));
    }

    let existingItem = myCart.find((item) => item.id === data.id);

    if (existingItem) {
        existingItem.quant += 1;
    } else {
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

    let length = myCart.reduce((total, item) => total + item.quant, 0);
    updateCartCounter(length);

    // Update the cart items dynamically
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

            $item.find(".remove-btn").on("click", function () {
                removeItem(item);
            });

            $item.find(".add-btn").on("click", function () {
                addCart(item.id);
            });

            $cartItems.append($item);

            gesamtpreis += item.price * item.quant;
        }


        $cartTotal.html(`<div class="mt-3">Gesamtpreis: ${gesamtpreis}€</div>`);
        $('#orderCart').show();
    } else {
        $cartItems.html('<h2>Ihr Warenkorb ist leer</h2>');
        $('#orderCart').hide();
    }
}

function fillCart() {
    const isAdmin = getCookie('admin') === 'true';
    const isLoggedIn = getCookie('username') ? true : false;

    if (isLoggedIn && isAdmin) {
        return;
    }

    const myCart = JSON.parse(sessionStorage.getItem("myCart"));

    if (myCart && myCart.length > 0) {
        updateCartItems(myCart);
    } else {
        $("#cartItems").html('<h2>Ihr Warenkorb ist leer</h2>');
        $("#cartTotal").empty();
        $("#orderCart").hide();
    }

}

function removeItem(data) {
    let myCart = [];
    if (sessionStorage.getItem("myCart")) {
        myCart = JSON.parse(sessionStorage.getItem("myCart"));
    }

    for (let i = 0; i < myCart.length; i++) {
        if (myCart[i].id === data.id) { // Updated comparison
            if (myCart[i].quant === 1) {
                myCart.splice(i, 1);
                break;
            } else {
                myCart[i].quant = myCart[i].quant - 1;
            }
        }
    }
    sessionStorage.setItem("myCart", JSON.stringify(myCart));

    let length = myCart.reduce((total, item) => total + item.quant, 0);
    updateCartCounter(length);

    // Update the cart items dynamically
    updateCartItems(myCart);
}

function addExistingItem(data) {
    let myCart = [];
    if (sessionStorage.getItem("myCart")) {
        myCart = JSON.parse(sessionStorage.getItem("myCart"));
    }

    for (let i = 0; i < myCart.length; i++) {
        if (myCart[i].id === data.id) { // Updated comparison
            myCart[i].quant = myCart[i].quant + 1;
            break;
        }
    }

    sessionStorage.setItem("myCart", JSON.stringify(myCart));

    // Update the cart items dynamically
    updateCartItems(myCart);
}