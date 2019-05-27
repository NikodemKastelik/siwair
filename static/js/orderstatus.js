// ========== reusable functions ==========

function updateOrderTotal() {
    let numberOfParts = 0;
    document.getElementById("order-status").querySelectorAll(".order-status-item").forEach( function (e) {
        let number = parseInt(e.getAttribute("data-quantity"));
        if (isNaN(number)) {
            number = 0;
        }
        numberOfParts += number;
    });
    document.getElementById("order-status-total").innerHTML = numberOfParts.toString();
}

// send order removal request
function orderDeleteItem(item) {
  var orderItem = item.closest(".order-status-item");
  $.ajax({
                url:"/deleteorder",
                type: "POST",
                contentType:"application/json",
                dataType:"json",
                data: JSON.stringify(orderItem.id)
  });
}

// update current order
function orderCurrentStatusUpdate(){
  $.getJSON("/getcurrentorder").done(function(data){
    if ("id" in data){

      // get current order status element
      var currentItem = document.getElementById("order-status-current-item");
      var addCurrentItem = false;

      // check if the current ordet status elelment is null (no such element)
      if (currentItem == null){
        // add received element
        addCurrentItem = true
      }
      else{
        // check if current element is received element
        if (currentItem == null) {
            addCurrentItem = true;
        } else if (currentItem.getAttribute("data-id").toString().toUpperCase() != data.id.toString().toUpperCase()){
          // id is different
          addCurrentItem = true;
        } else {
          // check sum of part quantity
          quantitySum = 0;
          data.contents.forEach(function(element) {
            quantitySum += parseInt(element.quantity);
          });
          if (quantitySum != parseInt(currentItem.closest(".order-status-current-item").getAttribute("data-quantity"))){
            // parts quantity is different
            addCurrentItem = true;

          }
        }
      }
      if (addCurrentItem){

        // clear empty element
        let parent = document.getElementById("order-status-current");
        document.querySelectorAll(".order-status-current-empty").forEach(function(element) {
          parent.removeChild(element);
        });

        document.querySelectorAll(".order-status-current-item").forEach(function(element) {
          parent.removeChild(element);
            if (!(element.classList.contains("order-status-current-empty"))) {
                element.classList.remove("order-status-current-item");
                element.classList.add("order-status-done-item");
                element.id = "";
                let date = new Date();
                element.endDate = "dnia: " + (parseInt(date.getMonth()) + 1).toString() + "." + date.getDate() + " o godzinie: " + date.getHours() + ":" + ("0" + date.getMinutes()).slice(-2);
                element.children[1].innerHTML = `
                    <div class="d-flex flex-column col-12 justify-content-around align-items-center align-content-center text-center">
                        <div class="item-text">
                          <p id="order-status-done-time" class="font-weight-bold mb-0"> Zakończono: ${ element.endDate.toString() }</p>
                        </div>
                    </div>
                `;
                document.getElementById("order-status-done").appendChild(element);
                setTimeout( function () {
                    var orderDoneStatus = document.getElementById("order-status-done");
                    orderDoneStatus.removeChild(element);
                }, 10000);
            }
        });

        // HTML element to be appended
        const currentOrderItem = document.createElement("div");
        currentOrderItem.classList.add(
          "order-status-current-item",
          "d-flex",
          "justify-content-between",
          "align-items-center",
          "my-3",
          "row"
        );
        quantitySum = 0;
        data.contents.forEach(function(element) {
          quantitySum += parseInt(element.quantity);
        });
        currentOrderItem.id = "order-status-current-item";
        currentOrderItem.setAttribute("data-quantity",quantitySum.toString());
        currentOrderItem.setAttribute("data-id", data.id.toString());
        currentOrderItem.products = "<ul class=\"order-part-list\">";
        data.contents.forEach(function(element) {
            currentOrderItem.products += "<li>" +  element.quantity.toString() + "x  " + element.recipe.toString() + "</li>";
        });
        currentOrderItem.products += "</ul>";

        // element HTML
        currentOrderItem.innerHTML = `
            <!-- cart item -->
                <div class="d-flex flex-wrap flex-row col-12 justify-content-around align-items-center align-content-center">
                    <div class="d-flex col-sm-12 col-md-6 justify-content-around align-items-center align-content-center">
                        <div class="item-text">
                            <p id="order-status-item-id" class="font-weight-bold mb-0"> Nr zamówienia: ${ currentOrderItem.getAttribute("data-id").toString() }</p>
                        </div>
                    </div>
                    <div class="d-flex col-sm-12 col-md-6 justify-content-around align-items-center align-content-center">
                        <div class="item-text">
                            <p id="order-status--item-products" class="font-weight-bold mb-0">Zawartość zamówienia: ${ currentOrderItem.products }</p>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="progress" style="height:25px">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" id="progressbar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%; height: 25px">
                        </div>
                    </div>
                </div>
          <!--end of  cart item -->
          `;

        document.getElementById("order-status-current").appendChild(currentOrderItem);
      }
      else{
        // set progressbar value
        var progressbar = document.getElementById("progressbar");
        progressbar.setAttribute("aria-valuenow", data.progress.toString());
        progressbar.style.width = data.progress.toString() + '%';
      }
    }
    else{

      let appendEmpty = true;
      // delete current order element
      document.querySelectorAll(".order-status-current-item").forEach(function(element) {
        var orderCurrentStatus = element.closest(".order-status-current");
        if (element.classList.contains("order-status-current-empty")) {
            appendEmpty = false;
        } else {
            orderCurrentStatus.removeChild(element);
        }
        if (!(element.classList.contains("order-status-current-empty"))) {
            element.classList.remove("order-status-current-item");
            element.classList.add("order-status-done-item");
            element.id = "";
            let date = new Date();
            element.endDate = "dnia: " + (parseInt(date.getMonth()) + 1).toString() + "." + date.getDate() + " o godzinie: " + date.getHours() + ":" + ("0" + date.getMinutes()).slice(-2);
            element.children[1].innerHTML = `
                <div class="d-flex flex-column col-12 justify-content-around align-items-center align-content-center text-center">
                    <div class="item-text">
                      <p id="order-status-done-time" class="font-weight-bold mb-0"> Zakończono: ${ element.endDate.toString() }</p>
                    </div>
                </div>
            `;
            document.getElementById("order-status-done").appendChild(element);
            setTimeout( function () {
                var orderDoneStatus = document.getElementById("order-status-done");
                orderDoneStatus.removeChild(element);
            }, 10000);
        }
      });

      if (appendEmpty) {
          // insert empty element
          const orderCurrentStatusEmptyItem = document.createElement("div");
          orderCurrentStatusEmptyItem.classList.add(
            "order-status-current-item",
            "d-flex",
            "align-items-center",
            "my-3",
            "order-status-current-empty"
          );

          orderCurrentStatusEmptyItem.innerHTML =`
          <!-- empty cart item -->
            <h4 class="text-center text-uppercase text-white center"> Brak zamówień w produkcji </h4>
          <!--end of empty cart item -->
          `;
           var orderStatus = document.getElementById("order-status-current");
          orderStatus.appendChild(orderCurrentStatusEmptyItem);
      }
    }
  })
}

// update order queue
function orderStatusUpdate(){
  $.getJSON("/getorderqueue").done(function(dataReceived){
    // convert JSON data to an array
    data = Array.from(dataReceived);
    // remove missing elements
    Array.from(document.getElementById("order-status").children).forEach(function(element) {
      if (! element.classList.contains("order-status-empty")){
        if (data.find(o => o.id === element.id.toString()) == null){
          element.addEventListener("animationend", function () {
              let container = this.closest(".order-status");
              if (!(container == null)) {
                  container.removeChild(this);
                  updateOrderTotal();
              }
          });
          element.classList.add("delete-status-item");
    
        }
      }
    });

    // iterate over elements to check if any should be added
    if (Array.isArray(data) && data.length){
      // remove empty element
      let parent = document.getElementById("order-status");
      document.querySelectorAll(".order-status-empty").forEach(function(element) {
        parent.removeChild(element);
      });
      // insert order elements
      data.forEach(function(element) {
        // get current order status element
        var currentItem = document.getElementById(element.id.toString());
        var addCurrentItem = false;

        // check if the current ordet status elelment is null (no such element)
        if (currentItem == null){
          // add received element
          addCurrentItem = true

        }
        else{
          // check sum of part quantity
          quantitySum = 0;
          element.contents.forEach(function(element) {
            quantitySum += parseInt(element.quantity);
          });
          if (quantitySum != parseInt(currentItem.getAttribute("data-quantity"))){
            // parts quantity is different
            addCurrentItem = true;
            var parent = document.getElementById("order-status");
            parent.removeChild(document.getElementById(element.id))
          }
        }
        if (addCurrentItem){

          // clear empty element
          document.querySelectorAll(".order-status-current-empty").forEach(function(element) {
            element.closest(".order-status-current").removeChild(element);
          });


          // HTML element to be appended
          const currentOrderItem = document.createElement("div");
          currentOrderItem.classList.add(
            "order-status-item",
            "d-flex",
            "justify-content-between",
            "align-items-center",
            "my-3",
            "row"
          );
          quantitySum = 0;
          element.contents.forEach(function(element) {
            quantitySum += parseInt(element.quantity);
          });
          currentOrderItem.setAttribute("data-quantity",quantitySum.toString());
          currentOrderItem.id = element.id.toString();
          currentOrderItem.products = "<ul class=\"order-part-list\">";
;
          element.contents.forEach(function(element) {
            currentOrderItem.products += "<li>" +  element.quantity.toString() + "x  " + element.recipe.toString() + "</li>";
          });
          currentOrderItem.products += "</ul>";

          // element HTML
        currentOrderItem.innerHTML = `
            <!-- cart item -->
                <div class="d-flex flex-wrap flex-row col-10 justify-content-around align-items-center align-content-center">
                    <div class="d-flex col-sm-10 col-md-5 justify-content-around align-items-center align-content-center">
                        <div class="item-text">
                            <p id="order-status-item-id" class="font-weight-bold mb-0"> Nr zamówienia: ${ currentOrderItem.id }</p>
                        </div>
                    </div>
                    <div class="d-flex col-sm-10 col-md-5 justify-content-around align-items-center align-content-center">
                        <div class="item-text">
                            <p id="order-status--item-products" class="font-weight-bold mb-0">Zawartość zamówienia: ${ currentOrderItem.products }</p>
                        </div>
                    </div>
                </div>
                <div class="d-flex flex-column col-2 justify-content-around align-items-center align-content-center">
                    <button id="order-status-item-remove" class="order-status-delete-item-button btn order-status-item-remove">
                        <i class="fas fa-trash fa-1x"></i>
                    </button>
                </div>
            <!--end of  cart item -->
        `;

          document.getElementById("order-status").appendChild(currentOrderItem);

          // configure delete button
          const deleteBtn = document.querySelectorAll(".order-status")[0].lastChild.querySelectorAll(".order-status-item-remove")[0];
          deleteBtn.addEventListener("click", function(deleteEvent) {
            let del = deleteEvent.target;
            orderDeleteItem(del);
          });

        updateOrderTotal();

        }
        else{
          // do not add an element
        }
      })
    } else{


      var orderStatusList = document.getElementById("order-status");
      // delete current order element
      let appendEmpty = true;
      document.querySelectorAll(".order-status-item").forEach(function(element) {
        if (element.classList.contains("order-status-empty")) {
            appendEmpty = false;
        } else {
            orderStatusList.removeChild(element);
        }
      });

      if (appendEmpty) {
          // insert empty element
          const orderStatusEmptyItem = document.createElement("div");
          orderStatusEmptyItem.classList.add(
            "order-status-item",
            "d-flex",
            "align-items-center",
            "my-3",
            "order-status-empty"
          );

          orderStatusEmptyItem.innerHTML =`
          <!-- empty cart item -->
            <h4 class="text-center text-uppercase text-white center"> Brak zamówień w kolejce </h4>
          <!--end of empty cart item -->
          `;

          orderStatusList.appendChild(orderStatusEmptyItem);
      }
      updateOrderTotal();
    }
  })
}

// ========== iife ==========
