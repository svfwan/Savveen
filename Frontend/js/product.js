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

    ContinuousSearch();

    loadAllProducts();

    fillCart();
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

function ContinuousSearch() {
    let $input = $("<input>").on("input", function (e) {
        const value = e.target.value;
        console.log(value);

        $.ajax({
            type: "GET",
            url: "../Backend/logic/requestHandler.php",
            data: {
                method: "filterConSearch",
                param: JSON.stringify({
                    letter: value,
                }),
            },
            dataType: "json",
            success: function (data) {
                console.log(data);
                $("#mainView").empty();
                if (data.length === 0 && value !== "") {
                    window.alert("Keine Produkte gefunden");
                }
                let $row = $("<div class='row'></div>");
                for (let i in data) {
                    console.log(data[i]);
                    displayAll(data[i], $row);
                }
                fillCart();
            },
            error: function (xhr, status, error) {
                console.log(xhr, status, error);
                window.alert("Error: Seite kann nicht geladen werden");
            },
        });
    });
}

function displayCategory() {
    const selectedValue = $("#category").val();
    console.log("Kategorie: " + selectedValue);

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
                if (selectedValue === "" || cur.category === selectedValue) {
                    displayAll(cur, $row);
                    console.log("cur: " + cur);
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
    let productHTML = `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="product card product-card">
          <div class="card-img-container">
            <div class="img-wrapper">
              <img src="../Frontend/res/img/${data.name}.jpg" class="card-img-top product-img" alt="${data.name}">
            </div>
          </div>
          <div class="card-body product-card-body">
            <h5 class="card-title">${data.name}</h5>
            <p class="card-text">Preis: ${data.preis}</p>
            <p class="card-text">Bewertung: ${data.bewertung}/5</p>
            <button class="btn btn-success add-to-cart-btn">In den Warenkorb hinzufügen</button>
          </div>
        </div>
      </div>
    `;

    let $product = $(productHTML);
    $row.append($product);

    if ($row.children().length === 4) {
        $("#mainView").append($row);
        $row = $("<div class='row'></div>");
    }

    $row.on("click", ".add-to-cart-btn", function (event) {
        event.stopPropagation(); // Stop event propagation
        addCart(data);
    });
}

// Stock > 0?
function addCart(product) {
    $.ajax({
        type: "GET",
        url: "../Backend/logic/requestHandler.php",
        data: {
            method: "checkStock",
            param: JSON.stringify({
                name: product.name,
            }),
        },
        dataType: "json",
        success: function (data) {
            console.log(data);
            if (data && data.length > 0) {
                const cur = data[0]; // Assuming the response contains a single item
                console.log(cur);
                if (cur.bestand > 0) {
                    addItemtoCart(cur);
                } else {
                    window.alert("Dieses Produkt haben wir leider nicht mehr auf Lager");
                }
            }
        },
        error: function (xhr, status, error) {
            console.log(xhr, status, error);
            window.alert("Error: Seite kann nicht geladen werden");
        },
    });
}

function addItemtoCart(data) {
    let myCart = [];
    if (sessionStorage.getItem("myCart")) {
        myCart = JSON.parse(sessionStorage.getItem("myCart"));
    }

    let existingItem = myCart.find((item) => item.name === data.name);

    if (existingItem) {
        existingItem.quant += 1;
    } else {
        myCart.push({
            name: data.name,
            price: data.preis,
            bewertung: data.bewertung,
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
                addExistingItem(item);
            });

            $cartItems.append($item);

            gesamtpreis += item.price * item.quant;
        }

        $cartTotal.html(`<div class="mt-3">Gesamtpreis: ${gesamtpreis}€</div>`);
    } else {
        $cartItems.html('<h2>Ihr Warenkorb ist leer</h2>');
        $('#orderCart').hide();
    }
}

function fillCart() {
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
        if (myCart[i].name == data.name) {
            if (myCart[i].quant == 1) {
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
        if (myCart[i].name == data.name) {
            myCart[i].quant = myCart[i].quant + 1;
            break;
        }
    }

    sessionStorage.setItem("myCart", JSON.stringify(myCart));

    // Update the cart items dynamically
    updateCartItems(myCart);
}