//Bestellungen einsehen:
$(document).ready(function () {

  $(document).on('click', '#showOrders', function () {
      console.log("alte Bestellungen einsehen"); 
      console.log("username" + getCookie('username'));

      let un = getCookie('username'); 
      goGetIt(un); 

   /*   $('#modal-placeholder').load('sites/orders.html', function () {

          $('#OrdersModal').modal('show');//dar
     
    });
    */

    //ajax call:  product quantity price from table orders
  }) })

   function goGetIt(u){

    $.ajax({
      type: 'GET',
      url: '../../Backend/logic/requestHandler.php',
      data: {
          method: 'getOrders',
          param: JSON.stringify({
            username: u, //username weitergeben
          })
      },
      dataType: 'json',
      success: function (response) {
          console.log(response);
          let last = false;
          console.log("ERFOLGREICH"); 
          for(let i in response){
            
            getProductPrices(response[i].product_id, response[i].quantity, response[i].street, response[i].postcode, response [i].city, response[i].receipt_id, response[i].total); 
          }

      },
      error: function (error) {
          console.log(error);
      },
  });//ajax call ende 

   }
   
    function getProductPrices(pid, quant, street, plz, city, receipt_id, total){ //product_id, quant, receipt_id
 console.log("getProductPrice()"); 
      $.ajax({
        type: 'GET',
        url: '../../Backend/logic/requestHandler.php',
        data: {
            method: 'getProductPrice',
            param: JSON.stringify({
              id: pid, //username weitergeben
            })
        },
        dataType: 'json',
        success: function (response) {
            //  console.log(response);
           
        for(let i in response){
          displayOrder(response[i].name, quant, response[i].preis, street, plz, city, receipt_id,total);
        }

        //product_id, quant, receipt_id, preis, name
    
        },
        error: function (error) {
            console.log(error);
        },
    });//ajax call ende 

    }

  

    function displayOrder(name, quant, preis, street, plz, city, receipt_id, total ){

      let tr = $("<tr>"); 
      let td1 = $("<td>");
      td1.append(name);
      tr.append(td1);

      let td2 = $("<td>");
      td2.append(quant);
      tr.append(td2);

      let td3 = $("<td>");
      td3.append(preis * quant);
      tr.append(td3);

      
      let td4 = $("<td>");
      td4.append(street);
      tr.append(td4);

      let td5 = $("<td>");
      td5.append(plz);
      tr.append(td5);

      let td6 = $("<td>");
      td6.append(city);
      tr.append(td6);

      let td7 = $("<td>");
      td7.append(receipt_id);
      tr.append(td7);

    


      $("#product").append(tr);
    

    }