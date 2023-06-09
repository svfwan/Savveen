var un = "undefined";
//warenkorb bestellen
$(document).ready(function () {

    $(document).on('click', '#orderCart', function () {
        console.log("clicked");
        let isLoggedIn = !!getCookie('username');
        console.log('Bestellen...');

        if (!isLoggedIn) {
            alert("Bitte melden Sie sich an, um zu bestellen!");
            // Load the content of login.html into the modal placeholder and show the login modal
            $('#modal-placeholder').load('sites/login.html', function () {
                $('#loginModal').modal('show');
            });
            return;
        } else if (isLoggedIn) {
            $('#modal-placeholder').load('sites/cart.html', function () {
                $('#cartModal').modal('show');
            });


            //get userid: 
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
                        askAdress(response[i].id);
                    }

                    //Artikel im Warenkorb anzeigen
                },
                error: function (error) {
                    console.log(error);
                },
            }); //ajax call ende

        }
    });

    function askAdress(id) {
        //ask for adress
        $('#modal-placeholder').load('sites/cart.html', function () {
            $('#AdressModal').modal('show');
            //get total:

            let total = document.getElementById("cartTotal").innerText;
            console.log(total);



            $("#newAdrsButton").on("click", function () {
                console.log("neue Adresse");
                createAdress(id, total);

            })

            $("#oldAdrsButton").on("click", function () {
                console.log("alte Adresse");

                getOriginalAddress(id, total);



            })
            return;
        });


    }

    //alte Lieferadresse: 
    //Alte Lieferadresse:
    function getOriginalAddress(id, total) {  //überarbeiten
        console.log("getOriginalAddress");

        $.ajax({
            type: "GET",
            url: "../Backend/logic/requestHandler.php",

            data: {
                method: "getAddress",
                param: JSON.stringify({
                    userid: id
                }),
            },
            dataType: 'json',
            success: function (response) {
                //receipt id weitergeben:
                console.log(response);
                for (let i in response) {
                    console.log(response[i].adresse + response[i].plz + response[i].ort);
                    createReceipt(id, total, response[i].adresse, response[i].plz, response[i].ort);
                }


            },
            error: function (xhr, status, error) {
                // show error
                console.log("error");
                console.log(xhr, status, error);
            }
        });
    }

    //neue Lieferadresse: 
    function createAdress(id, total) {
        let correct = true;
        console.log("createAdress()");
        //adresse, plz, ort in db
        let street = $("#street").val();
        let postcode = $("#plz").val();
        let ort = $("#ort").val();

        console.log(street + postcode + ort);

        if (street == "" || ort == "" || postcode == "") {
            window.alert("Adresse unvollständig");
            correct = false;
        }

        if (postcode.match(/[a-zA-Z]/)) {
            console.log("plz does contain a letter.");
            window.alert("Bitte überprüfen Sie die Postleitzahl");
            correct = false;
        }

        if (correct == true) {
            //in db einfügen.
            createReceipt(id, total, street, postcode, ort);
        }
    }

    //Rechnung erstellen
    function createReceipt(id, gesamtpreis, street, plz, city) {

        //timestamp 
        const jetzt = new Date();
        const zeitstempel = jetzt.toISOString().split('T')[0];
        console.log(zeitstempel);

        //hier einen ajax call für id machen oder usernamen eingeben
        $.ajax({
            type: 'POST',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'createReceipt',
                param: JSON.stringify({
                    gesamt: gesamtpreis,
                    userid: id,
                    adress: street,
                    postcode: plz,
                    ort: city,
                })
            },
            dataType: 'json',
            success: function (response) {
                // handle success
                getReceiptID(id);
                console.log("success");
            },
            error: function (xhr, status, error) {
                // show error
                console.log("error");
                console.log(xhr, status, error);
            }
        });
    }
    function getReceiptID(id) {
        console.log("getReceiptID");
        $.ajax({
            type: 'GET',
            url: '../Backend/logic/requestHandler.php',
            data: {
                method: 'getCurrentReceipt_id',
            },
            dataType: 'json',
            success: function (response) {
                //receipt id weitergeben:
                console.log(response[0].receipt_id);
                orderCart(id, response[0].receipt_id);

            },
            error: function (xhr, status, error) {
                // show error
                console.log("error");
                console.log(xhr, status, error);
            }
        });

    }


    //process order
    function orderCart(id, receipt_id) {
        console.log("orderCart()");
        //Daten zum Einfügen in die Datenbank 
        let storedCart = JSON.parse(sessionStorage.getItem("myCart"));


        for (let i = 0; i < storedCart.length; i++) {
            console.log("Prod-ID: " + storedCart[i].id);
            console.log("Quant: " + storedCart[i].quant);

            $.ajax({
                type: 'POST',
                url: '../Backend/logic/requestHandler.php',
                data: {
                    method: 'processOrder',
                    param: JSON.stringify({
                        product_id: storedCart[i].id,
                        quantity: storedCart[i].quant,
                        userid: id,
                        receiptid: receipt_id,

                    })
                },
                dataType: 'json',
                success: function (response) {
                    // handle success
                    // empty myCart in sessionStorage or reset
                    let array = JSON.parse(sessionStorage.getItem("myCart"));
                    console.log("vorher");
                    for (let i = 0; i < array.length; i++) {
                        console.log(array[0]);
                    }
                    array.splice(0, array.length);
                    console.log("nachher");
                    for (let i = 0; i < array.length; i++) {
                        console.log(array[0]);
                    }

                    // Speichern des geleerten Arrays im Session Storage
                    sessionStorage.setItem("myCart", JSON.stringify(array));

                    // show invoice:
                    console.log("success");


                    updateCartItems(array);

                    updateCartCounter(0);
                    // $('#modal-placeholder').hide(); 



                },
                error: function (xhr, status, error) {
                    // show error
                    console.log("error");

                }
            });

            //bestand reduzieren

            $.ajax({
                type: 'POST',
                url: '../Backend/logic/requestHandler.php',
                data: {
                    method: 'reduceStock',
                    param: JSON.stringify({
                        product_id: storedCart[i].id,
                        quantity: storedCart[i].quant,

                    })
                },
                dataType: 'json',
                success: function (response) {

                    console.log("bestand aktualisiert");

                },
                error: function (xhr, status, error) {
                    // show error
                    console.log("error");

                }
            });


        }
    }


    //Bestellung erfolgreich:


});
