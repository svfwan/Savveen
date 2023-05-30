$(document).ready(function(){
  $("#adress").hide();   
 
    //überprüfen, ob Kunde eh angemeldet
    checkSession(); 
   
   
})

function checkSession(){
  console.log("checkSession()")
  $.ajax({
    type: 'GET',
    url: '../../Backend/logic/requestHandler.php',
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
            //Artikel im Warenkorb anzeigen
            displayCart(userid); 
        
        }
        else if (response.status !== 'loggedInAdmin') {
           window.open("../index.html"); 
        }
    },
    error: function (error) {
        console.log(error);
    },
});
}
//Artikel im Warenkorb anzeigen
function displayCart(userid){
  let gesamtpreis = 0; 
 
    let storedCart = JSON.parse(sessionStorage.getItem("myCart"));

    if (storedCart && storedCart.length > 0){    
        for (let i = 0; i < storedCart.length; i++){
          length = length + storedCart[i].quant; 
        }
      }
      $('#header').text(" Warenkorb (" + length + " Artikel)");

    $("#cart").empty(); 

    if(sessionStorage.getItem('myCart')){
  
    let storedCart = JSON.parse(sessionStorage.getItem("myCart"));
   
    //-- items erstellen
   for(let i = 0; i< storedCart.length; i++){
    console.log(storedCart[i]); 
    let $item = $("<div>");
    let $marker = $("<img>");
    $marker.attr("src", "../../Backend/productpictures/" + storedCart[i].name + ".jpg");
    $item.append($marker);
  
    $item.append("<br> Quantity: " + storedCart[i].quant);
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
  
    $("#cart").append("<br>");
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
  
  $("#cart").append("<br> Gesamtpreis: " + gesamtpreis + "€ <br>"); 
   


       //order cart:
       let $order = $("<button>");
       $order.append("Keep original shipping address");
       $order.on("click", function () {
        //createReceipt(userid, gesamtpreis);
        getOriginalAddress(userid, gesamtpreis);
      
       });
     
       $("#cart").append($order);
       $("#cart").append("<br>"); 
      


         //create shipping address:
         let $adress = $("<button>");
         $adress.append("New shipping address");
         $("#cart").append($adress);
         $adress.on("click", function () {
          $("#adress").show();
          
         });
        } 

        $("#newadrsbtn").on("click", function(){
          createAdress(userid, gesamtpreis); 
        })
      
}
//Alte Lieferadresse:
function getOriginalAddress(userid, gesamtpreis){  //überarbeiten
  console.log("getOriginalAddress");  

  $.ajax({
    type: "GET",
    url: "../../Backend/logic/requestHandler.php",
    
    data: {
        method: "getAddress",
        param: JSON.stringify({
          uid: userid
        }),
    },
    dataType: 'json',
    success: function (response) {
        //receipt id weitergeben:
        console.log("SUCCESS"); 
        d
  
    },
    error: function (xhr, status, error) {
        // show error
        console.log("error"); 
        console.log(xhr, status, error); 
    }
  });
  }

      
//neue Lieferadresse: 
function createAdress(uid, total){
  let correct = true; 
  console.log("createAdress()"); 
//adresse, plz, ort in db
  let street = $("#street").val();
  let postcode = $("#postcode").val();
  let ort = $("#city").val();
    
  if (street == "" || ort == "" || postcode == ""){
    window.alert("Adresse unvollständig");
    correct = false; 
  }

  if (postcode.match(/[a-zA-Z]/)) {
    console.log("plz does contain a letter.");
    window.alert("Bitte überprüfen Sie die Postleitzahl");
    correct = false; 
  } 

  if (correct == true){
    //in db einfügen.
    createReceipt(uid, total, street, postcode, ort); 
  }
}
//Rechnung erstellen
function createReceipt(uid, gesamtpreis, street, plz, city){

  $.ajax({
    type: 'POST',
    url: '../../Backend/logic/requestHandler.php',
    data: {
        method: 'createReceipt',
        param: JSON.stringify({
            total : gesamtpreis, 
            userid: uid,
            adress: street,
            postcode: plz, 
            ort: city, 
        })
    },
    dataType: 'json',
    success: function (response) {
        // handle success
        getReceiptID(uid);
       console.log("success"); 
    },
    error: function (xhr, status, error) {
        // show error
        console.log("error"); 
        console.log(xhr, status, error); 
    }
});
}

function getReceiptID(uid){
console.log("getReceiptID"); 


$.ajax({
  type: 'GET',
  url: '../../Backend/logic/requestHandler.php',
  data: {
      method: 'getCurrentReceipt_id',
  },
  dataType: 'json',
  success: function (response) {
      //receipt id weitergeben:
      console.log(response[0].receipt_id); 
      orderCart(uid, response[0].receipt_id); 

  },
  error: function (xhr, status, error) {
      // show error
      console.log("error"); 
      console.log(xhr, status, error); 
  }
});
}

  
function orderCart(uid, receipt_id){
    console.log("orderCart()"); 
    //Daten zum Einfügen in die Datenbank 
    let storedCart = JSON.parse(sessionStorage.getItem("myCart"));


    for(let i = 0; i < storedCart.length; i++){
  console.log("Prod-ID: " + storedCart[i].id);
  console.log("Quant: " + storedCart[i].quant);

$.ajax({
    type: 'POST',
    url: '../../Backend/logic/requestHandler.php',
    data: {
        method: 'processOrder',
        param: JSON.stringify({
            product_id: storedCart[i].id,
            quantity: storedCart[i].quant,
            userid: uid,
            receiptid: receipt_id,

        })
    },
    dataType: 'json',
    success: function (response) {
        // handle success
        // empty myCart in sessionStorage or reset
        let array = JSON.parse(sessionStorage.getItem("myCart"));
        console.log("vorher"); 
        for (let i = 0; i< array.length; i++){
          console.log(array[0]);
        }
        array.splice(0, array.length); 
          console.log("nachher"); 
        for (let i = 0; i< array.length; i++){
          console.log(array[0]);
        }

        // Speichern des geleerten Arrays im Session Storage
        sessionStorage.setItem("myCart", JSON.stringify(array));
      displayCart(uid); 
        // show invoice:
       console.log("success"); 
    },
    error: function (xhr, status, error) {
        // show error
        console.log("error"); 
    
    }
});
    }

  } 
