function done() {
    parent.postMessage("done " + id, "*");
}
function receiveMessage(event) {
    var parts = event.data.split(" ");
    if (parts[0] == "id") {
        id = parts[1];
    }
}
window.addEventListener("message", receiveMessage, false);

$(document).ready(function() {
    var cKey = 67;

    $(document).keydown(function(e) {
        if (e.ctrlKey && e.keyCode == cKey) {
            done();
            console.log("Control c pressed");
        }
    });
});