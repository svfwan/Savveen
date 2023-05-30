//wenn Seite fertig geladen, alle Produkte anzeigen:
$(document).ready(function () {
  let storedCart = JSON.parse(sessionStorage.getItem("myCart"));

  //Anzahl der Produkte. soll neben dem warenkorb symbol sein -  
  if (storedCart && storedCart.length > 0){    
    for (let i = 0; i < storedCart.length; i++){
      length = length + storedCart[i].quant; 
    }
  }
  $('#cartCounter').text(length);
   

  $("#mainView").empty();
  let $btn = $("<button>");
  $btn.attr("id","btn"); 
  $btn.text("Search"); 
 $("#prod").append($btn); 

 
 

  filterCategory(); 
  //filter
  ContinousSearch();

  //Daten aus Datenbank holen
  $.ajax({
    type: "GET",
    url: "../Backend/logic/requestHandler.php",
    //cache: false,
    data: {
      method: "loadAllProducts",
    },
    dataType: "json", //muss immer json sein
    success: function (data) {
      for (let i in data) {
        let cur = data[i];
        //console.log(data[i]);
        displayAll(cur);
      }
    },
    error: function (xhr, status, error) {
      console.log("Ajax Call funktioniert nicht");
      window.alert("Error: Seite kann nicht geladen werden");
    },
  });
}); //ende doc. load

function ContinousSearch(){
  console.log("ContinuousSearch()"); 
  let input = $("<input>"); 
  $("#prod").append("<br>Filter: "); 
  $("#prod").append(input); 
  $("#prod").append("<br> <br>"); 

  const i = document.querySelector("input");
  const log = document.getElementById("prod");

i.addEventListener("input", updateValue);

}

function updateValue(e) {
  console.log("updateValue()");
  console.log(e.target.value); 
  //ajax call - filterConSearch

  $.ajax({
    type: "GET",
    url: "../Backend/logic/requestHandler.php",
    data: {
      method: "filterConSearch",
      param: JSON.stringify({
      letter : e.target.value,
      }),
    },
    dataType: "json", //muss immer json sein
    success: function (data) {
      console.log(data);
      $("#mainView").empty(); 
      if(data.length == 4 && e.target.value != ""){ // bearbeiten
        window.alert("Keine Produkte gefunden"); 

      }
      //eig wird immer nur ein Datensatz weitergegeben, also sollte es ohne Schleife funktionieren
      for (let i in data) {

        console.log(data[i]);
        displayAll(data[i]); 
      }
    },
    error: function (xhr, status, error) {
      console.log(xhr, status, error);
      window.alert("Error: Seite kann nicht geladen werden");
    },
  });
 //ajax ende
}





function filterCategory(){
  console.log("filterCategory()"); 
  //Search Button
    
  //Input Feld, um nach Kategorien zu filtern: 

var opt1 = $("<option>");
opt1.attr("value", "Skincare");
opt1.attr("text","Skincare"); 
opt1.append("Skincare"); 
$("#Kategorie").append(opt1); 

var opt2 = $("<option>");
opt2.attr("value", "MakeUp");
opt2.attr("text","MakeUp"); 
opt2.append("MakeUp"); 
$("#Kategorie").append(opt2); 

var opt3 = $("<option>");
opt3.attr("value", "Parfum");
opt3.attr("text","Parfum"); 
opt3.append("Parfum");
$("#Kategorie").append(opt3); 

$("#btn").on("click", function () {
  displayCategory(); 
});
}


function displayCategory(){ //onclick display category
  console.log("displayCategory()");
    
      // select the "Kategorie" element: funktioniert nicht
     var selectedValue = $("#Kategorie").val(); // get the selected value
      console.log("Kategorie: " + selectedValue);
      //Ajax call für bestimmte category
  
      $.ajax({
        type: "GET",
        url: "../Backend/logic/requestHandler.php", //Das url soll von der index.html seite aus sein ? 
        //cache: false,
        data: {
          method: "loadAllProducts",
        },
        dataType: "json", //muss immer json sein
        success: function (data) {
          $("#mainView").empty();
          console.log("mainView leer gemacht"); 
           
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
         // window.alert("Error: Seite kann nicht geladen werden");
          console.log(xhr, status, error);
        },
      });
    } 

  function displayAll(data) {
    
    //image erstellen pro file eintrag mit jquery.
   console.log("DisplayAll()"); 
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
    $marker.attr("src", "../Backend/productpictures/" + data.Name + ".jpg");
    $product.append(" <br> Name: " + data.Name + "<br>");
    $product.append("Preis: " + data.Price + "<br>");
    $product.append("Bewertung: " + data.Bewertung + "/5 <br>");
    $product.append($marker);
    $("#mainView").append($product);
    fillCart(); 
  }

  //Stcok > 0 ?
  function addCart(product) {
    console.log("addCart()"); 
   
    $.ajax({
      type: "GET",
      url: "../Backend/logic/requestHandler.php",
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
        console.log(xhr, status, error);
        window.alert("Error: Seite kann nicht geladen werden");
      },
    });
  }

  function addItemtoCart(data) {
    console.log("AddItemtoCart"); 
     //data aus db
    let cart = false; 
    let idx = 0; 
    let myCart = [];
    if(sessionStorage.getItem('myCart')){ //Wenn es in der Session schon ein myCart gibt
      myCart = JSON.parse(sessionStorage.getItem('myCart'));
    }

    //Produkt bereits im Warenkorb
    for (let i = 0; i< myCart.length; i++){
       if (myCart[i].id == data.Product_id){
        console.log("Produkt bereits im Warenkorb"); 
        cart = true; 
        idx = i;
      break; 
      }
    }

    if (cart){//cart = true
      console.log("Produkt bereits im Warenkorb 1"); 
      if (myCart[idx].quant ==  myCart[idx].stock){
        //Produkt nicht mehr auf Lager
        window.prompt("Dieses Produkt haben wir nicht mehr auf Lager");
      }
      else{
      myCart[idx].quant = myCart[idx].quant + 1;
      console.log(myCart[idx].quant); 
      print(myCart[idx].quant)
      } 

    }

    else { //cart == false
      console.log("Produkt nicht im Warenkorb"); 
    myCart.push({
      id: data.Product_id, 
      name: data.Name,
      price: data.Price,
      bewertung: data.Bewertung,
      cat: data.Category,
      quant: 1,
      stock: data.stock,
    });
  }

    //überprüfen
    console.log(myCart); 
  
    //Warenkorb im Session Storage speichern.
    sessionStorage.setItem("myCart", JSON.stringify(myCart));
  
    let length = 0; 
    for (let i = 0; i< myCart.length; i++){
        length = myCart[i].quant + length; 
        console.log(myCart[i]); 
    }
    $('#cartCounter').text(length);

  
    fillCart(); 
  

  }
  


//Warenkorb füllen
function fillCart(){
  $("#offcanvasRight").empty(); 

  console.log("fillCart()"); 
//wenn das arr not null, dann warenkorb anzeigen 
  if(sessionStorage.getItem('myCart')){

  let storedCart = JSON.parse(sessionStorage.getItem("myCart"));
  let gesamtpreis = 0; 

  //-- items erstellen
 for(let i = 0; i< storedCart.length; i++){
  console.log(storedCart[i]); 
  let $item = $("<div>");
  let $marker = $("<img>");
  $marker.attr("src", "../Backend/productpictures/" + storedCart[i].name + ".jpg");
  $item.append($marker);

  $item.append("<br> Anzahl: " + storedCart[i].quant);
  $item.append("<br>");
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

  $("#offcanvasRight").append("<br>");
 $item.append($remove); 
 $item.append($add);
 $("#offcanvasRight").append("<br>");
  $("#offcanvasRight").append($item);

  let $li = $("<li>"); 
  $li.attr("id", i);
   ($li).append("Name: " + storedCart[i].name + "<br>");
   ($li).append("Preis: " + storedCart[i].price * storedCart[i].quant + "<br>");
  ($li).append("Bewertung: " + storedCart[i].bewertung + "/5 <br>");
  $("#offcanvasRight").append($li); 
  gesamtpreis = gesamtpreis + storedCart[i].price * storedCart[i].quant; 
}

$("#offcanvasRight").append("<br> Gesamtpreis: " + gesamtpreis + "€"); 
 }

 //order button
  
 let $order = $("<button>");
 $order.attr("id","order"); 
 $order.text("CheckOut"); 
 $("#offcanvasRight").append($order); 

 $order.on("click", function () {
  orderProducts(); 
});





}

//removeitem
function removeItem(data){
  console.log("removeItem()");

  // myArray.splice(2, 1); an der Position 2, 1 item entfernen
  let myCart = [];
  if(sessionStorage.getItem('myCart')){
    myCart = JSON.parse(sessionStorage.getItem('myCart'));
  }
    for(let i = 0; i< myCart.length; i++){
    if (myCart[i].name == data.name){
      if (myCart[i].quant == 1){
      myCart.splice(i,1);
      break;
      }
      else {
        myCart[i].quant = myCart[i].quant - 1; 
      }
    }
  }
  sessionStorage.setItem("myCart", JSON.stringify(myCart));

  $("#offcanvasRight").empty(); 
  fillCart(); 

}

//anzahl erhöhen
function  addExistingItem(data){
  $("#offcanvasRight").empty();
  console.log("addExistingItem()"); 
  console.log("Existing:" + data.id + data.name + data.quant);

let idx = 0; 
  myCart = JSON.parse(sessionStorage.getItem('myCart'));
  
    for (let i = 0; i< myCart.length; i++){
       if (myCart[i].id == data.id){
        console.log("Produkt bereits im Warenkorb"); 
        idx = i;
      break; 
      }
    }

  
   
    if (myCart[idx].quant ==  myCart[idx].stock){
      //Produkt nicht mehr auf Lager
      window.alert("Dieses Produkt haben wir nicht mehr auf Lager");
    }
    else{
    myCart[idx].quant = myCart[idx].quant + 1;
    console.log(myCart[idx].quant); 
    print(myCart[idx].quant)
    } 
       

    

  //Warenkorb im Session Storage speichern.
  sessionStorage.setItem("myCart", JSON.stringify(myCart));
  fillCart(); 
}
//Bestellen
function orderProducts(){
  console.log("orderProducts()"); 

  
  console.log("angemeldet?"); 
      // Always make an AJAX request to get the session information
      // change to get request
      $.ajax({
          type: 'GET',
          url: '../Backend/logic/requestHandler.php',
          data: {
              method: 'getSessionInfo',
          },
          dataType: 'json',
          success: function (response) {
              console.log(response);
              if ( response.status === 'loggedInUser') {
                  console.log("User eingeloggt"); 
                  
                  let userid = getCookie('userid');
                  console.log("USERID:" + userid);
                  window.open("sites/cart.html");
              
              }
              else if (response.status !== 'loggedInAdmin') {
                  window.alert("Please login to checkOut");  
              }
          },
          error: function (error) {
              console.log(error);
          },
      });
  
}
 
