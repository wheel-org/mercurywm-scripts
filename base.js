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
            $("body").css("margin", "0px");
            $("body").css("overflow", "hidden");
        });
    });
})();
function getQueryParams(qs) {
    qs = qs.split("+").join(" ");
    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}

var $_GET = getQueryParams(document.location.search);
var id = $_GET["id"];
var env = JSON.parse($_GET["env"]);
function getEnv(key) {
    for (var i = 0; i < env.length; i++) {
        if (env[i].key == key) {
            return env[i].value;
        }
    }
    return "";
}
function done() {
    parent.postMessage("done " + id, "*");
}
