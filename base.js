var id = "";
function done() {
    parent.postMessage("F" + id, "*");
}
parent.postMessage("RequestID", "*");

function receiveMessage(event) {
    id = event.data;
}
window.addEventListener("message", receiveMessage, false);

$(document).ready(function() {
    var cKey = 67;

    $(document).keydown(function(e) {
        if (e.ctrlKey && e.keyCode == cKey) done();
    });
});
