
<?php
session_start();
//Array, um die Produkte zu speichern.

$myArray = array();
$idx = 0; 

include('../config/dbaccess.php');

$mysql = new mysqli($host, $user, $password,$database);
   
//wenn die Datenbank nicht verbinden konnte, wird ein error ausgegeben
    if($mysql -> connect_error){
        die("Datenbankverbindung nicht erfolgreich".$mysql->connect_error);
    }
   // echo("connected");

?>
<script>
    //idx für den javascript array
    let id = 0; //brauche ich das überhaupt. 
    let cartcounter = 0; 
</script>

    
<!DOCTYPE html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script
  src="https://code.jquery.com/jquery-3.6.4.min.js"
  integrity="sha256-oP6HI9z1XaZNBrJURtCoUT5SUnxFr8s3BzRl+cbzUq8="
  crossorigin="anonymous"></script>
    <title>Products</title>
</head>
<body>
    <!-- Warenkorb Symbol-->

<i class="fa fa-shopping-cart" style="font-size:48px;color:black;position:absolute; top:50; right:50;" ></i>
<p id = "cartcounter" style="font-size:18px;color:black;position:absolute; top:60; right:40;" >0</p>



<form method = "POST">
    <select id = "Kategorie" name = "Kategorie">
        <option id = "Kategorie1">Skincare</option>
        <option id = "Kategorie2">MakeUp</option>
        <option id = "Kategorie3">Parfum</option>
    </select>

    <button type = "submit" name = "search" id = "search" >Search</button>
   
    </form>

    <div id = "Produkte">
        <href></href>
    </div>  
    
    </body>
    </html>
    
    <?php 
//Nach Kategorien filtern

    require_once('../config/dbaccess.php');

    //Alle Kategorien
    $Category = '*';    
   // echo "Aktuelle Kategorie: " . $Category; 
  
    $tab = []; //wozu ?
    
    //Bestimmte Kategorie
        if (isset($_POST["search"]) && isset($_POST['Kategorie'])) {
            echo "Button wurde angeklickt"; 
            $Category = $_POST['Kategorie'];
          // echo "Kategorie wurde ausgewählt"; 
          // echo "Aktuelle Kategorie: " . $Category; 
            //prepared Statements for certain category
           $sql = $mysql -> prepare("SELECT Category, Name, Price, Bewertung FROM `products` WHERE `Category` = ? ");
           $sql->bind_param("s", $Category);
            } 

            else {
                $sql = $mysql -> prepare("SELECT Category, Name, Price, Bewertung FROM `products`"); //Where category = cat. 
            }




//$sql -> bind_param("ssfi","Category",) //Brauche ich das überhaupt ??
$sql -> execute(); 
$sql->bind_result($tab["Category"], $tab["Name"], $tab["Price"], $tab["Bewertung"]);

// Loop through the result set
while ($sql->fetch()) {
 
    $myArray[$idx] =  $tab["Name"]; "ARRAY: " .  $myArray[$idx]. "<br>"; $idx++; 
    $myArray[$idx] = $tab["Price"]; "ARRAY: " .  $myArray[$idx]. "<br>"; $idx++;
    $myArray[$idx] = $tab["Bewertung"];  "ARRAY: " .  $myArray[$idx]. "<br>";$idx++;

     
    echo "<script>var myArray = " . json_encode($myArray) . ";</script>";
     
    } 
$sql -> fetch();
$sql ->close();
$mysql -> close(); 


?>
<script>
for(let i = 0; i < myArray.length; i++){
//image erstellen pro file eintrag mit jquery. 

let $cart = $("<button>");
// $cart.attr("href", "products.html"); 
$cart.append("In den Warenkorb hinzufügen  <br>");

$cart.attr("onclick", "addCart('"+ myArray[i] + "')"); 


let $product = $("<div>");
$product.append($cart); 
let $marker = $("<img>");


$marker.attr("src", myArray[i] + ".jpg");
 //  console.log("SRC: " + myArray[i]); 
   $product.append(" <br> Name: " + myArray[i] + "<br>"); i++;
 //  console.log("Preis: "+ myArray[i]); 
   $product.append("Preis: " + myArray[i] + "<br>"); i++;
   $product.append("Bewertung: " + myArray[i] + "/5 <br>");

   
   $product.append($marker);
  $("#Produkte").append($product);
  
}

//Produkt wird dem Warenkorb hinzugefügt. 
//stock wird noch nicht überprüft, mehrdimensionale arrays in jscript ??
function addCart(name){ //name-preis-bewertung in einem json file hinzufügen 
    for(let i = 0; i< myArray.length; i++){
        if (myArray[i] == name){
            let price = myArray[i+1]; 
            let rate = myArray[i+2]; 
            console.log("Preis: " + price + "Bewertung: " + rate);
            
            fillCart(name, price, rate); 
        }  
    }
   // console.log("Produkt wurde dem Cart hinzugefügt: " + name); 
}

function fillCart(name, price, rate) {
  // Create a new object with the product attributes
  var product = {
    Bezeichnung: name,
    preis: price,
    bewertung: rate,
    idx: id
  };

  // Make an AJAX call to add the product to the JSON file
  $.ajax({
    type: "POST",
    url: "cart.json",
    data: JSON.stringify(product),
    dataType: "json",
    success: function(response) {
      console.log("Product added to cart:", product);
      //window.location.href = "cart.html"; soll nicht automatisch weitergeleitet werden
      cartcounter++;
      $("#cartcounter").text(cartcounter); 
      


    },
    error: function(error) {
      console.log("Failed to add product to cart:", product);
    }
  });
}



</script>
<?php 
?>
 