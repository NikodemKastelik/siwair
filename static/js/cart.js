// ========== reusable functions ==========
// delete item from cart
function cartDeleteItem(item) {
    var element = item.closest(".cart-item");
    element.addEventListener("animationend", function () {
        
        let cart = this.closest(".cart");
        cart.removeChild(this);
        // append empty element
        if (cart.querySelectorAll(".cart-item").length === 0) {
            const cartEmptyItem = document.createElement("div");
            cartEmptyItem.classList.add(
                "cart-item",
                "d-flex",
                "align-items-center",
                "my-3",
                "cart-empty"
            );

            cartEmptyItem.innerHTML =`
                <!-- empty cart item -->
                <h4 class="text-center text-uppercase text-white center"> Brak produktów w zamówieniu </h4>
                <!--end of empty cart item -->
            `;

            cart.appendChild(cartEmptyItem);
            updateNumberOfParts();
        }
    });
    element.classList.add("delete-cart-item");
    
};

// restricts input for the given textbox to the given inputFilter.
function setInputFilter(textbox, inputFilter) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
        textbox.addEventListener(event, function() {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            }
            updateNumberOfParts();
        });
    });
}

// update number of parts displayed under the cart container
function updateNumberOfParts() {

    let numberOfParts = 0;
    document.getElementById("cart").querySelectorAll(".cart-quantity-container").forEach( function (e) {
        let number = parseInt(e.children[0].value);
        if (isNaN(number)) {
            number = 0;
        }
        numberOfParts += number;
    });

    document.getElementById("cart-total").innerHTML = numberOfParts.toString();

};

// ========== iife ==========
// configure insert cart element button, configure cart item insertion
(function() {
    'use strict';
    const addCartBtn = document.querySelectorAll(".cart-add-item-button");

    addCartBtn.forEach(function(btn){
        btn.addEventListener("click", function(event) {

            if (!("cover" in product.currentModel)) {
                alert("Produkt musi mieć pokrywę")
                return;
            }
            else if (!("screw" in product.currentModel)) {
                alert("Produkt musi mieć przynajmniej jedną śrubę")
                return;
            }

            // clear empty element
            document.querySelectorAll(".cart-empty").forEach(function(element) {
                element.closest(".cart").removeChild(element);
            });

            // HTML element to be appended
            const cartItem = document.createElement("div");
            cartItem.classList.add(
                "cart-item",
                "d-flex",
                "justify-content-between",
                "align-items-center",
                "text-capitalize",
                "my-3",
                "row"
            );

            // modelProps definiton for binding
            const modelProps = new Object();
            modelProps.body = product.currentModel["body"];

            // legacy, cover is essential for the assembly
            if ("cover" in product.currentModel){
                modelProps.cover = product.currentModel["cover"];
            }

            // product name and code
            cartItem.productName = "body_cover";
            cartItem.productCode = "F4.0_BC00"

            let sleeveCodeLen= 1;
            let screwCodeLen = 1;

            if ("sleeve" in product.currentModel) {
                cartItem.productCode = cartItem.productCode.substr(0, 6 + sleeveCodeLen) + 'S'
                    + cartItem.productCode.substr(cartItem.productCode.length - screwCodeLen, cartItem.productCode.length);
                cartItem.productName += "_sleeve";
                modelProps.sleeve = product.currentModel["sleeve"];
            }
            if ("screw" in product.currentModel) {
                cartItem.productCode = cartItem.productCode.substr(0, 6 + sleeveCodeLen + screwCodeLen) + product.currentModel["screw"].toString();
                cartItem.productName += "_screw" + product.currentModel["screw"].toString();
                modelProps.screw = product.currentModel["screw"];
            }

            cartItem.id = cartItem.productName;

            var addItem = true;
            document.getElementById("cart").querySelectorAll('#' + cartItem.productName.toString()).forEach( function (element) {
                let quantityElement = element.children[1].children[0].children[1].children[0];
                if (parseInt(quantityElement.value) < 10 && addItem===true){
                    quantityElement.value = (parseInt(quantityElement.value) + 1).toString();
                    addItem = false;
                }
            });
            if (addItem){

                // element HTML
                cartItem.innerHTML = `
                    <!-- cart item -->
                        <div class="d-flex col-6 justify-content-around align-items-center align-content-center">
                            <div class="cart-item-image">
                                <img class="img-fluid rounded-circle" src="static/models_signatures/${ cartItem.productName }.jpg" alt="">
                            </div>
                            <div class="item-text">
                                <p id="cart-item-title" class="font-weight-bold mb-0">${ cartItem.productCode }</p>
                            </div>
                        </div>
                        <div class="d-flex col-6 justify-content-around align-items-center align-content-center">
                            <div class="d-flex justify-content-between align-items-center text-capitalize my-3">
                                <div>
                                    <button class="quantity-left-minus cart-item-button btn btn-outline-light" type="button" name="button">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                </div>
                                <div class="cart-quantity-container">
                                    <input type="text" id="quantity" name="quantity" class="form-control input-number cart-input" value="1" min="1" max="100">
                                </div>
                                    <div>
                                    <button  class="quantity-right-plus cart-item-button btn btn-outline-light" type="button" name="button">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                            <button id="cart-item-remove" class="cart-delete-item-button btn cart-item-remove">
                                <i class="fas fa-trash fa-1x"></i>
                            </button>
                        </div>
                    <!--end of  cart item -->
                `;

                document.getElementById("cart").appendChild(cartItem);

                // configure increase button
                const plusBtn = document.querySelectorAll(".cart")[0].lastChild.querySelectorAll(".quantity-right-plus")[0];
                plusBtn.addEventListener("click", function(plusEvent) {
                    let plus = plusEvent.target.closest("div").parentElement.getElementsByTagName("input")[0];
                    let val = parseInt(plus.value);
                    if (val < 10) {
                        val += 1;
                    } else {
                        val= 10;
                    }
                    plus.value = val;
                    updateNumberOfParts();
                });

                // confugure decrease button
                const minusBtn = document.querySelectorAll(".cart")[0].lastChild.querySelectorAll(".quantity-left-minus")[0];
                minusBtn.addEventListener("click", function(minusEvent) {
                    let minus = minusEvent.target.closest("div").parentElement.getElementsByTagName("input")[0];
                    let val = parseInt(minus.value);
                    if (val > 1) {
                        val -= 1;
                        minus.value = val;
                    } else {
                        cartDeleteItem(minus);
                    }
                    updateNumberOfParts();
                });

                // configure delete button
                const deleteBtn = document.querySelectorAll(".cart")[0].lastChild.querySelectorAll(".cart-item-remove")[0];
                deleteBtn.addEventListener("click", function(deleteEvent) {
                    let del = deleteEvent.target;
                    cartDeleteItem(del);
                });

                // configure input textbox filter
                setInputFilter(document.querySelectorAll(".cart")[0].lastChild.querySelectorAll("input")[0], function(value) {
                   return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 10); 
                });

                // configure image click
                const image = document.querySelectorAll(".cart")[0].lastChild.querySelectorAll(".cart-item-image")[0];
                image.addEventListener("click", function(showEvent) {
                    let show = showEvent.target;
                        product.buildModel(modelProps)
                });

                // update cart total
                updateNumberOfParts();
            }
        });
    });

})();

// configure empty order button
(function() {
    'use strict';
    document.querySelectorAll("#empty-cart").forEach(function(btn) {
        btn.addEventListener("click", function(emptyEvent) {
            Array.from(document.querySelectorAll(".cart")[0].children).forEach(function(cartItem) {
                if (!cartItem.classList.contains("cart-empty")){
                    cartDeleteItem(cartItem);
                }
            });
        });
    });
}());

// configure confirm order button
(function() {
    'use strict';
    document.querySelectorAll("#confirm-order").forEach(function(btn) {
        btn.addEventListener("click", function(confirmEvent) {
            var order = "";
            var orderObjArr = [];
            Array.from(document.querySelectorAll(".cart")[0].children).forEach(function(cartItem) {
                if (!cartItem.classList.contains("cart-empty")){
                    order += cartItem.querySelectorAll("#cart-item-title")[0].innerText + ' ' + cartItem.querySelectorAll("#quantity")[0].value.toString() + '\n';
                    orderObjArr.push({
                        recipe: cartItem.querySelectorAll("#cart-item-title")[0].innerText,
                        quantity: cartItem.querySelectorAll("#quantity")[0].value.toString()
                    });
                }
            });
            // uncomment alert for debugging purposes
            //alert(order);
            // AJAX used to send data to the server
            $.ajax({
                url:"/setorder",
                type: "POST",
                contentType:"application/json",
                dataType:"json",
                data: JSON.stringify(orderObjArr)
            });
            Array.from(document.querySelectorAll(".cart")[0].children).forEach(function(cartItem) {
                if (!cartItem.classList.contains("cart-empty")){
                    cartDeleteItem(cartItem);
                }
            });
        });
    });
}());

