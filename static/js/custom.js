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

var product = new Vue ({
    el: '#product',
    data: {
        currentModel: {"body" : true},
        props: {
            src: "/static/models/body.STL",
            backgroundAlpha: 0.0,
            rotation: {
                x: 0.6,
                y: 0,
                z: 0,
            },
            scale: {
                x: 0.8,
                y: 0.8,
                z: 0.8
            },
        }
    },
    methods: {
        onMouseUp(event) {
            if (!g_currentDraggable || !event) {
                g_dropStatus = false;
                return;
            }

            var nextModel = this.updateModel(event.point.x,
                                             -event.point.z,
                                             g_currentDraggable);
            if (nextModel) {
                this.currentModel = nextModel;
                this.buildModel(nextModel);
                g_dropStatus = true;
            }
            else {
                g_dropStatus = false;
            }
        },
        getId () {
            return this['$options'].el;
        },
        buildModel (nextModel) {
            var modelName = "";
            if ("body" in nextModel) {
                modelName += "body";
            }
            if ("cover" in nextModel) {
                modelName += "_cover";
            }
            if ("sleeve" in nextModel) {
                modelName += "_sleeve";
            }
            if ("screw" in nextModel) {
                modelName += "_screw" + nextModel["screw"].toString();
            }
            this.props.src = `/static/models/${modelName}.STL`;
        },
        updateModel (px, py, droppedElement) {
            var nextModel = null;
            var currentModel = this.currentModel;
            if (droppedElement === "#cover") {
                nextModel = this.handleDroppedCover(currentModel);
            }
            else if (droppedElement === "#sleeve") {
                nextModel = this.handleDroppedSleeve(currentModel);
            }
            else if (droppedElement === "#screw") {
                nextModel = this.handleDroppedScrew(px, py, currentModel);
            }
            return nextModel;
        },
        handleDroppedCover (currentModel) {
            if ("cover" in currentModel) {
                return null;
            }
            else {
                currentModel["cover"] = true;
                return currentModel;
            }
        },
        handleDroppedSleeve (currentModel) {
            if ("sleeve" in currentModel) {
                return null;
            }
            else if (!("cover" in currentModel)) {
                return null;
            }
            else {
                currentModel["sleeve"] = true;
                return currentModel;
            }
        },
        handleDroppedScrew (px, py, currentModel) {
            if (!("cover" in currentModel)) {
                return null;
            }

            var new_screw = null;
            if (!("screw" in currentModel)) {
                new_screw = 1;
            }
            else if (currentModel["screw"] === 1) {
                /* Check if diagonal or by side */
                if (px > 0 && py < 0) {
                    new_screw = 4;
                }
                else {
                    new_screw = 2;
                }
            }
            else if (currentModel["screw"] === 2 ||
                     currentModel["screw"] === 4) {
                new_screw = 8;
            }
            else if (currentModel["screw"] === 8) {
                new_screw = 16;
            }

            if (new_screw) {
                currentModel["screw"] = new_screw;
                return currentModel;
            }
            else {
                return null;
            }
        }
    }
});

var g_dropStatus = false;
var g_currentDraggable = null;

const draggableItem = {
    data: function () { return {
        events: "all",
        default_scale: 0.8,
        props: {
            backgroundAlpha: 0.0,
            controllable: false,
            rotation: {
                x: 1.57,
                y: 0,
                z: 0,
            },
            scale: {
                x: 0.8,
                y: 0.8,
                z: 0.8
            },
        }
    }},
    methods: {
        onLoad () {
            this.init(this.getId());
            this.rotate();
        },
        onDragStart (event, draggable) {
            this.events = "none";
            g_currentDraggable = this.getId();
        },
        onDragEnd (event, draggable) {
            setTimeout(this.verifyDrop, 50);
        },
        init (elementId) {
            $(elementId).draggable({
                enable : true,
                start  : this.onDragStart,
                update : this.onDragEnd,
            });
        },
        rotate () {
            this.props.rotation.z += 0.01;
            requestAnimationFrame( this.rotate );
        },
        scaleSet (scale)
        {
            this.props.scale.x = scale;
            this.props.scale.y = scale;
            this.props.scale.z = scale;
        },
        squeeze () {
            var new_scale = this.props.scale.x - 0.05;
            this.scaleSet(new_scale);
            if (new_scale > 0) {
                requestAnimationFrame( this.squeeze );
            }
            else {
                this.revert(0);
                this.emerge();
            }
        },
        emerge () {
            var new_scale = this.props.scale.x + 0.05;
            if (new_scale < this.default_scale) {
                this.scaleSet(new_scale);
                requestAnimationFrame( this.emerge );
            }
            else {
                this.scaleSet(this.default_scale);
            }
        },
        resetAfterDrag() {
            this.events = "all";
        },
        revert(time_ms) {
            $(this.getId()).animate({top: 0, left: 0}, time_ms);
            setTimeout(this.resetAfterDrag, time_ms);
        },
        verifyDrop() {
            if (g_dropStatus) {
                this.getAccepted();
                g_dropStatus = false;
            }
            else {
                this.getRejected();
            }
            g_currentDraggable = null;
        },
        getAccepted() {
            this.squeeze();
        },
        getRejected() {
            this.revert(400);
        },
        getId () {
            return this['$options'].el;
        }
    }
}

var sleeve = new Vue({
    mixins: [draggableItem],
    el: '#sleeve',
    data: {
        props: {
            src: "static/models/sleeve.STL"
        }
    }
})

var cover = new Vue({
    mixins: [draggableItem],
    el: '#cover',
    data: {
        props: {
            src: "static/models/cover.STL"
        }
    }
})

var screw = new Vue({
    mixins: [draggableItem],
    el: '#screw',
    data: {
        props: {
            src: "static/models/screw_angle.STL",
        },
    },
})

window.onload = function() {
    var ivstor = window.setInterval(function() { doUpdate()}, 500);
}

document.addEventListener("touchend", function(evt){
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
