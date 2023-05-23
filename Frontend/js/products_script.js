$(document).ready(function () {
  let storedCart = JSON.parse(sessionStorage.getItem("myCart"));
  let length = 0;

  if (storedCart && storedCart.length > 0) {
    for (let i = 0; i < storedCart.length; i++) {
      length += storedCart[i].quant;
    }
  }

  $("#cartCounter").text(length);
  $("#mainView").empty();

  $("#filterCategory").on("click", function () {
    displayCategory();
  });

  ContinuousSearch();

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
});

function ContinuousSearch() {
  let input = $("<input>");
  $("#prod").append("<br>Filter: ");
  $("#prod").append(input);
  $("#prod").append("<br> <br>");

  const i = document.querySelector("input");
  const log = document.getElementById("prod");

  i.addEventListener("input", updateValue);

  function updateValue(e) {
    console.log(e.target.value);

    $.ajax({
      type: "GET",
      url: "../Backend/logic/requestHandler.php",
      data: {
        method: "filterConSearch",
        param: JSON.stringify({
          letter: e.target.value,
        }),
      },
      dataType: "json",
      success: function (data) {
        console.log(data);
        $("#mainView").empty();
        if (data.length == 0 && e.target.value != "") {
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
  }
}

function displayCategory() {
  var selectedValue = $("#category").val();
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
          <img src="../Frontend/res/img/${data.name}.jpg" class="card-img-top product-img" alt="${data.name}">
        </div>
        <div class="card-body">
          <h5 class="card-title">${data.name}</h5>
          <p class="card-text">Preis: ${data.preis}</p>
          <p class="card-text">Bewertung: ${data.bewertung}/5</p>
          <button class="btn btn-primary add-to-cart-btn">In den Warenkorb hinzufügen</button>
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

  // Event delegation for "Add to Cart" button
  $row.on("click", ".add-to-cart-btn", function () {
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
      for (let i in data) {
        let cur = data[i];
        console.log(data[i]);
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
  let cart = false;
  let idx = 0;
  let anzahl = 1;

  let myCart = [];
  if (sessionStorage.getItem("myCart")) {
    myCart = JSON.parse(sessionStorage.getItem("myCart"));
  }

  for (let i = 0; i < myCart.length; i++) {
    if (myCart[i].name == data.name) {
      console.log("Produkt bereits im Warenkorb");
      cart = true;
      idx = i;
      anzahl = myCart[i].quant;
      break;
    }
  }

  if (cart) {
    myCart[idx].quant = anzahl + 1;
  } else {
    myCart.push({
      name: data.name,
      price: data.preis,
      bewertung: data.bewertung,
      cat: data.kategorie,
      quant: anzahl,
    });
  }

  console.log(myCart);
  sessionStorage.setItem("myCart", JSON.stringify(myCart));

  let length = 0;
  for (let i = 0; i < myCart.length; i++) {
    length = myCart[i].quant + length;
  }
  $("#cartCounter").text(length);

  fillCart();
}

function fillCart() {
  $("#cartItems").empty();

  console.log("FILLCART");
  if (sessionStorage.getItem("myCart")) {
    let storedCart = JSON.parse(sessionStorage.getItem("myCart"));
    let gesamtpreis = 0;

    for (let i = 0; i < storedCart.length; i++) {
      const item = storedCart[i];
      const $item = $("<div>");
      const $marker = $("<img>").attr("src", "../Frontend/res/img/" + item.name + ".jpg");

      $item.append("Anzahl: " + item.quant);

      const $remove = $("<button>").text("-").on("click", function () {
        removeItem(item);
      });

      const $add = $("<button>").text("+").on("click", function () {
        addExistingItem(item);
      });

      $item.append($marker, $remove, $add);
      $("#cartItems").append("<br>", $item);

      const $li = $("<li>").attr("id", i);
      $li.append("Name: " + item.name + "<br>");
      $li.append("Preis: " + item.price * item.quant + "<br>");
      $li.append("Bewertung: " + item.bewertung + "/5 <br>");
      $("#cartItems").append($li);

      gesamtpreis += item.price * item.quant;
    }

    $("#cartTotal").html("<br> Gesamtpreis: " + gesamtpreis + "€");
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

  $("#cartItems").empty();
  fillCart();
}

function addExistingItem(data) {
  console.log("addExistingItem wird betreten");
  $("#cartItems").empty();

  myCart = JSON.parse(sessionStorage.getItem("myCart"));

  for (let i = 0; i < myCart.length; i++) {
    if (myCart[i].name == data.name) {
      console.log(" check ");
      myCart[i].quant = myCart[i].quant + 1;
      break;
    }
  }

  sessionStorage.setItem("myCart", JSON.stringify(myCart));
  fillCart();
}
