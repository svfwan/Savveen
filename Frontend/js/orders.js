//Bestellungen einsehen:
$(document).ready(function () {
  $(document).on("click", "#showOrders", function () {
    console.log("alte Bestellungen einsehen");
    console.log("username" + getCookie("username"));

    $("#modal-placeholder").empty();
    $("#modal-placeholder").load("sites/orders.html #OrdersModal", function () {
      $("#OrdersModal").modal("show"); //dar
      goGetIt();
    });
  });

  //ajax call:  product quantity price from table orders
});

function goGetIt() {
  console.log("Username: " + getCookie("username"));
  let username = getCookie("username");

  $.ajax({
    type: "GET",
    url: "../Backend/logic/requestHandler.php",
    data: {
      method: "getUserid",
      param: JSON.stringify({
        un: username,
      }),
    },
    dataType: "json",
    success: function (response) {
      console.log(response);

      for (let i in response) {
        console.log("Userid: " + response[i].id);
        getOrderInfo(response[i].id);
      }

      //Artikel im Warenkorb anzeigen
    },
    error: function (error) {
      console.log(error);
    },
  }); //ajax call ende
}

function getOrderInfo(id) {
  $.ajax({
    type: "GET",
    url: "../Backend/logic/requestHandler.php",
    data: {
      method: "getOrders",
      param: JSON.stringify({
        userid: id,
      }),
    },
    dataType: "json",
    success: function (response) {
      console.log(response);
      for (let i in response) {
        displayOrder(response[i]);
      }
    },
    error: function (error) {
      console.log(error);
    },
  }); //ajax call ende
}

function displayOrder(arr) {
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);

    let tr = $("<tr>");
    let td1 = $("<td>");
    td1.append(arr[i].productname);
    tr.append(td1);

    let td2 = $("<td>");
    td2.append(arr[i].quantity);
    tr.append(td2);

    let td3 = $("<td>");
    td3.append(arr[i].price * arr[i].quantity);
    tr.append(td3);

    $("#product").append(tr);

    if (i == arr.length - 1) {
      //lieferadrs
      let tr2 = $("<tr>");
      let td3 = $("<td>");
      td3.append(
        "Lieferadresse:       " +
          arr[i].street +
          " " +
          arr[i].postcode +
          " " +
          arr[i].city +
          "<br>"
      );
      tr2.append(td3);

      $("#product").append(tr2);

      //rechnungsnummer:

      let tr = $("<tr>");
      let td8 = $("<td>");

      td8.append("Rechnungsnummer: ", arr[i].receipt_id);
      tr.append(td8);

      $("#product").append(tr);

      //rechnungsnummer:

      let tr3 = $("<tr>");
      let td4 = $("<td>");

      td4.append("Gesamtsumme: ", arr[i].total);
      tr3.append(td4);

      $("#product").append(tr3);
    }
  }
  /*
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
      */
}
