
//Abrufen des Arrays aus der Session:
//var cart = JSON.parse(sessionStorage.getItem('cart'));  //session warenkorb

//wenn Seite fertig geladen, alle Produkte anzeigen:
$(document).ready(function () {
  let storedCart = JSON.parse(sessionStorage.getItem("myCart"));
  let length = storedCart.length;
  $("#cartcounter").text(length);

  console.log("Warenkorb Länge onload: " + length);
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
    console.log(selectedValue);
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
    console.log("SRC: " + data.Name);
    $marker.attr("src", "../../Backend/productpictures/" + data.Name + ".jpg");
    $product.append(" <br> Name: " + data.Name + "<br>");
    $product.append("Preis: " + data.Price + "<br>");
    $product.append("Bewertung: " + data.Bewertung + "/5 <br>");
    $product.append($marker);
    $("#Produkte").append($product);
  }

  //Produkt wird dem Warenkorb hinzugefügt.
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
    console.log("createStockArr wird betreten");
    let myCart = [];
    if(sessionStorage.getItem('myCart')){
      myCart = JSON.parse(sessionStorage.getItem('myCart'));
    }
  
    myCart.push({
      name: data.Name,
      price: data.Price,
      bewertung: data.Bewertung,
      cat: data.Category,
    });
  
    console.log("MyCart gepushed");
    //Warenkorb im Session Storage speichern.
    sessionStorage.setItem("myCart", JSON.stringify(myCart));
  
    length = myCart.length;
    $("#cartcounter").text(length);
  
    //hier irgendwo PUSH REQUEST: stock runtersetzen
  }
  
});
