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

window.onload = function() { var ivstor = window.setInterval(function() { doUpdate()}, 500);}
