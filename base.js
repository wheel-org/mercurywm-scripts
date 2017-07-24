var id = "";
(function () {
    function loadScript(url, callback) {
        var script = document.createElement("script")
        script.type = "text/javascript";
        if (script.readyState) { //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else { //Others
            script.onload = function () {
                callback();
            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }
    loadScript("/jquery-3.2.1.min.js", function () {
        $(document).ready(function() {
            var cKey = 67;
            $(document).keydown(function(e) {
                console.log(e);
                if (e.ctrlKey && e.keyCode == cKey) {
                    done();
                    console.log("Control c pressed");
                }
            });
        });
    });
})();

function done() {
    parent.postMessage("done " + id, "*");
}
function receiveMessage(event) {
    var parts = event.data.split(" ");
    if (parts[0] == "id") {
        id = parts[1];
        alert("Got message");
    }
}
window.addEventListener("message", receiveMessage, false);
