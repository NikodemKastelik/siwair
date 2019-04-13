function getStatusColor(state)
{
    var color = "grey";
    if (state["Empty"]) {
      color = "white";
    }
    if (state["Ongoing"]) {
      color = "green";
    }
    if (state["Error"]) {
      color = "red";
    }
    return color;
}

function doUpdate()
{
    $.getJSON("/getstatus").done(function(data)
    {
        for (var station in data) {
            var state = data[station]
            $('#status_' + station).css('background-color', getStatusColor(state));
        }
    })
}

var product = new Vue({
    el: '#product',
    data: {
        dropStatus: null,
    },
    methods: {
        onMouseUp(event) {
            this.dropStatus = event;
        },
        statusGetAndClear(event) {
            var retval = this.dropStatus;
            this.dropStatus = null;
            return retval;
        }
    }
})

function partRevert(draggable, time_ms) {
    $(draggable).animate($(draggable).data('origPosition'), time_ms);
    setTimeout(function() {$(draggable).css('pointer-events', 'all');}, time_ms);
}

function getIdFromDraggable(draggable) {
    return "#" + draggable["$draggable"][0].id;
}

function getVueFromDraggable(draggable) {
    return draggable["$draggable"][0].__vue__;
}

function verifyDrop(draggable) {
    if (product.statusGetAndClear()) {
        getVueFromDraggable(draggable).squeeze();
    }
    else {
        partRevert(getIdFromDraggable(draggable), 400);
    }
}

function initializeDraggable(elementId) {
    $(elementId).draggable({
        enable : true,
        update : function(event, draggable) {
            setTimeout(function(){verifyDrop(draggable, 1000)});
        },
        start  : function() {
            $('#sleeve').css('pointer-events', 'none');
        },
    });
    $(elementId).data("origPosition", $(elementId).position());
}

var sleeve = new Vue({
    el: '#sleeve',
    data: {
        rotation: {
            x: 0,
            y: 0,
            z: 0
        },
        scale: {
            x: 1,
            y: 1,
            z: 1
        }
    },
    methods: {
        onMouseUp(event) {
        },
        onMouseDown(event) {
        },
        onLoad () {
            initializeDraggable(this.getId());
            this.rotate();
        },
        rotate () {
            this.rotation.y += 0.01;
            requestAnimationFrame( this.rotate );
        },
        scaleSet (scale)
        {
            this.scale.x = scale;
            this.scale.y = scale;
            this.scale.z = scale;
        },
        squeeze () {
            var new_scale = this.scale.x - 0.05;
            this.scaleSet(new_scale);
            if (new_scale > 0) {
                requestAnimationFrame( this.squeeze );
            }
            else {
                partRevert(this.getId(), 0);
                this.emerge();
            }
        },
        emerge () {
            var new_scale = this.scale.x + 0.05;
            if (new_scale < 1) {
                this.scaleSet(new_scale);
                requestAnimationFrame( this.emerge );
            }
            else {
                this.scaleSet(1.0);
            }
        },
        getId () {
            return this['$options'].el;
        }
    }
})

new Vue({
    el: '#screw',
    data: {
    }
})

window.onload = function() {
    var ivstor = window.setInterval(function() { doUpdate()}, 500);
}

var isDragging = false;

document.addEventListener("touchmove", function(evt){
    isDragging = true;
});

document.addEventListener("touchend", function(evt){
    if (!isDragging) {
        return;
    }
    isDragging = false;

    var touches = evt.changedTouches,
        first = touches[0],
        type = "mouseup"

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
                                  first.screenX, first.screenY,
                                  first.clientX, first.clientY, false,
                                  false, false, false, 0, null);

    var element = document.getElementById("product");
    element.firstChild.firstChild.dispatchEvent(simulatedEvent);
}, false)
