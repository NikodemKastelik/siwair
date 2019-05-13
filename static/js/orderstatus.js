// ========== reusable functions ==========

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
  console.log("delete:" + orderItem.id);
}

// update current order
function orderCurrentStatusUpdate(){
  $.getJSON("/getcurrentorder").done(function(data){
    if ("id" in data){

      // get current order status element
      var currentItem = document.getElementById("order-status-current-item-id");
      var addCurrentItem = false;

      // check if the current ordet status elelment is null (no such element)
      if (currentItem == null){
        // add received element
        addCurrentItem = true
      }
      else{
        // check if current element is received element
        if (currentItem.closest(".order-status-current-item").id.toString().toUpperCase() != data.id.toString().toUpperCase()){
          // id is different
          addCurrentItem = true
        }
        else{
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
        });

        // HTML element to be appended
        const currentOrderItem = document.createElement("div");
        currentOrderItem.classList.add(
          "order-status-current-item",
          "d-flex",
          "justify-content-between",
          "align-items-center",
          "text-uppercase",
          "my-3",
          "row"
        );
        quantitySum = 0;
        data.contents.forEach(function(element) {
          quantitySum += parseInt(element.quantity);
        });
        currentOrderItem.setAttribute("data-quantity",quantitySum.toString());
        currentOrderItem.id = data.id.toString();
        currentOrderItem.products = "";
        data.contents.forEach(function(element) {
          currentOrderItem.products += element.quantity.toString() + "x " + element.recipe.toString() + ", ";
        });
        currentOrderItem.products = currentOrderItem.products.substring(0, currentOrderItem.products.length-2);

        // element HTML
        currentOrderItem.innerHTML = `
        <!-- cart item -->
          <div class="d-flex flex-column col-xl-6 col-md-12 justify-content-around align-items-center align-content-center">
            <div class="item-text">
              <p id="order-status-current-item-id" class="font-weight-bold mb-0"> Nr zamówienia: ${ currentOrderItem.id }</p>
            </div>
            <div class="item-text">
              <p id="order-status-current-item-products" class="font-weight-bold mb-0">Zawartość zamówienia: ${ currentOrderItem.products }</p>
            </div>
          </div>
          <div class="col-xl-6 col-md-12">
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

      // delete current order element
      document.querySelectorAll(".order-status-current-item").forEach(function(element) {
        var orderCurrentStatus = element.closest(".order-status-current");
        orderCurrentStatus.removeChild(element);
      });

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
          let parent = element.closest(".order-status");
          parent.removeChild(element);
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
            "text-capitalize",
            "my-3",
            "row"
          );
          quantitySum = 0;
          element.contents.forEach(function(element) {
            quantitySum += parseInt(element.quantity);
          });
          currentOrderItem.setAttribute("data-quantity",quantitySum.toString());
          currentOrderItem.id = element.id.toString();
          currentOrderItem.products = "";
          element.contents.forEach(function(element) {
            currentOrderItem.products += element.quantity.toString() + "x " + element.recipe.toString() + ", ";
          });
          currentOrderItem.products = currentOrderItem.products.substring(0, currentOrderItem.products.length-2);

          // element HTML
          currentOrderItem.innerHTML = `
          <!-- cart item -->
            <div class="d-flex justify-content-around align-items-center align-content-center">
              <div class="item-text">
                <p id="order-status-item-id" class="font-weight-bold mb-0">${ currentOrderItem.id }</p>
              </div>
              <div class="item-text">
                <p id="order-status-item-products" class="font-weight-bold mb-0">${ currentOrderItem.products }</p>
              </div>
              <button id="order-status-item-remove" class="oder-status-delete-item-button btn order-status-item-remove">
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
        }
        else{
          // do not add an element
        }
      })
    }
    else{


      var orderStatusList = document.getElementById("order-status");
      // delete current order element
      document.querySelectorAll(".order-status-item").forEach(function(element) {
        orderStatusList.removeChild(element);
      });

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
  })
}

// ========== iife ==========
