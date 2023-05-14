
//wenn Seite fertig geladen, alle Produkte anzeigen:
$(document).ready(function () {
  let storedCart = JSON.parse(sessionStorage.getItem("myCart"));

  //Anzahl der Produkte 


  if (storedCart && storedCart.length > 0) {

    for (let i = 0; i < storedCart.length; i++) {
      length = length + storedCart[i].quant;
    }
  }

  $("#cartcounter").text(length);



  //Daten aus Datenbank holen
  $.ajax({
    type: "GET",
    url: "../../Backend/logic/requestHandler.php",
    //cache: false,
    data: {
      method: "loadAllProducts",
    },
    dataType: "json", //muss immer json sein
    success: function (data) {
      for (let i in data) {
        let cur = data[i];
        console.log(data[i]);
        displayAll(cur);
      }
    },
    error: function (xhr, status, error) {
      console.log("Ajax Call funktioniert nicht");
      window.alert("Error: Seite kann nicht geladen werden");
    },
  });

  //Wenn Kategory Button geklickt
  $(document).on("click", "#search", function () {
    $("#Produkte").empty();
    //console.log("Clicked");
    var selectElement = document.getElementById("Kategorie"); // select the "Kategorie" element
    var selectedValue = selectElement.value; // get the selected value
    //console.log(selectedValue);
    //Ajax call für bestimmte category

    $.ajax({
      type: "GET",
      url: "../../Backend/logic/requestHandler.php",
      //cache: false,
      data: {
        method: "loadAllProducts",
      },
      dataType: "json", //muss immer json sein
      success: function (data) {
        for (let i in data) {
          let cur = data[i];
          if (cur.Category == selectedValue) {
            console.log(data[i]);
            displayAll(cur);
          }
        }
      },
      error: function (xhr, status, error) {
        console.log("Ajax Call funktioniert nicht");
        window.alert("Error: Seite kann nicht geladen werden");
      },
    });
  });

  function displayAll(data) {
    //image erstellen pro file eintrag mit jquery.
    let $cart = $("<button>");
    //onclick -> addCart();
    $cart.on("click", function () {
      addCart(data);
    });

    $cart.append("In den Warenkorb hinzufügen  <br>");
    let $product = $("<div>");
    //$product.attr("id",idx);
    $product.append($cart);
    let $marker = $("<img>");
    $marker.attr("src", "../../Backend/productpictures/" + data.Name + ".jpg");
    $product.append(" <br> Name: " + data.Name + "<br>");
    $product.append("Preis: " + data.Price + "<br>");
    $product.append("Bewertung: " + data.Bewertung + "/5 <br>");
    $product.append($marker);
    $("#Produkte").append($product);
  }

  //Stcok > 0 ?
  function addCart(product) {
    //Daten werden mit Ajax Call aus der Datenbank geholt und es wird überprüft, ob
    //es stock gibt
    $.ajax({
      type: "GET",
      url: "../../Backend/logic/requestHandler.php",
      //cache: false,
      data: {
        method: "checkStock",
        param: JSON.stringify({
          Name: product.Name,
        }),
      },
      dataType: "json", //muss immer json sein
      success: function (data) {
        console.log(data);
        //eig wird immer nur ein Datensatz weitergegeben, also sollte es ohne Schleife funktionieren
        for (let i in data) {
          let cur = data[i];
          console.log(data[i]);
          if (cur.stock > 0) {
            addItemtoCart(cur);
          } else {
            window.alert(
              "Dieses Produkt haben wir leider nicht mehr auf Lager"
            );
          }
        }
      },
      error: function (xhr, status, error) {
        console.log("Ajax Call funktioniert nicht");
        console.log(xhr, status, error);
        //window.alert("Error: Seite kann nicht geladen werden");
      },
    });
  }

  function addItemtoCart(data) {

    let cart = false;
    let idx = 0;
    let anzahl = 1;

    let myCart = [];
    if (sessionStorage.getItem('myCart')) { //Wenn es in der Session schon ein myCart gibt
      myCart = JSON.parse(sessionStorage.getItem('myCart'));
    }

    //Wenn das Produkt bereits im warenkorb ist:
    for (let i = 0; i < myCart.length; i++) {

      if (myCart[i].name == data.Name) {
        console.log("Produkt bereits im Warenkorb");
        cart = true;
        idx = i;
        anzahl = myCart[i].quant;
        break;
      }
    }


    if (cart) {//cart = true
      myCart[idx].quant = anzahl + 1;
    }
    else {

      //noch nicht im warenkorb:

      myCart.push({
        name: data.Name,
        price: data.Price,
        bewertung: data.Bewertung,
        cat: data.Category,
        quant: anzahl,

      });
    }

    //überprüfen
    console.log(myCart);

    //Warenkorb im Session Storage speichern.
    sessionStorage.setItem("myCart", JSON.stringify(myCart));

    let length = 0;
    for (let i = 0; i < myCart.length; i++) {
      length = myCart[i].quant + length;
    }
    $("#cartcounter").text(length);

    //POST REQUEST: stock runtersetzen: unnötig, weil stock wird eh erst ab zahlung zurückgesetzt. 

    /*  $.ajax({
        type: 'POST',
        url: "../../Backend/logic/requestHandler.php",
        data: {
          method: 'reduceStock',
          param: JSON.stringify({
            Name: data.Name,
            Stock: data.stock,
          })
        },
        dataType: 'json',
        success: function (response) {
         
          console.log("Stock wurde reduziert ");
        },
        error: function (xhr, status, error) {
          console.log(xhr, status, error);
        }
      });
      */
    //Post ende
  }

});

//Öffne Warenkorb: 

function openCart() {
  //Warenkorb 
  window.open("cart.html", "_blank");
  //window.focus();
  fillCart();

}
//Warenkorb füllen

function fillCart() {
  let storedCart = JSON.parse(sessionStorage.getItem("myCart"));
  let gesamtpreis = 0;
  //-- 
  for (let i = 0; i < storedCart.length; i++) {


    let $item = $("<div>");
    let $marker = $("<img>");
    $marker.attr("src", "../../Backend/productpictures/" + storedCart[i].name + ".jpg");

    $item.append("Anzahl: " + storedCart[i].quant);
    //remove item
    let $remove = $("<button>");
    $remove.append("-");
    $remove.on("click", function () {
      removeItem(storedCart[i]);
    });

    //add item to cart:
    let $add = $("<button>");
    $add.append("+");
    $add.on("click", function () {

      addExistingItem(storedCart[i]);
    });

    $item.append($marker);
    $item.append($remove);
    $item.append($add);
    $("#cart").append("<br>");
    $("#cart").append($item);

    let $li = $("<li>");
    $li.attr("id", i);
    ($li).append("Name: " + storedCart[i].name + "<br>");
    ($li).append("Preis: " + storedCart[i].price * storedCart[i].quant + "<br>");
    ($li).append("Bewertung: " + storedCart[i].bewertung + "/5 <br>");
    $("#cart").append($li);
    gesamtpreis = gesamtpreis + storedCart[i].price * storedCart[i].quant;

  }


  $("#cart").append("<br> Gesamtpreis: " + gesamtpreis + "€");

}

function removeItem(data) {
  //data aus dem  array entfernen (einfach anzahl erstellen)
  // myArray.splice(2, 1); an der Position 2, 1 item entfernen
  let myCart = [];
  if (sessionStorage.getItem('myCart')) {
    myCart = JSON.parse(sessionStorage.getItem('myCart'));
  }



  for (let i = 0; i < myCart.length; i++) {

    if (myCart[i].name == data.name) {
      myCart.splice(i, 1);
      break;
    }
  }
  //
  sessionStorage.setItem("myCart", JSON.stringify(myCart));

  $("#cart").empty();
  fillCart();

  //stock in der datenbank wieder raufsetzen - eig müsste man den stock nicht runtersetzen, bis es tatsächlich wird
}

function addExistingItem(data) {

  let myCart = [];
  if (sessionStorage.getItem('myCart')) {
    myCart = JSON.parse(sessionStorage.getItem('myCart'));
  }

  myCart.push({
    name: data.name,
    price: data.price,
    bewertung: data.bewertung,
    cat: data.cat


  });

  // console.log("MyCart gepushed");
  //Warenkorb im Session Storage speichern.
  sessionStorage.setItem("myCart", JSON.stringify(myCart));

  $("#cart").empty();
  fillCart();

}
