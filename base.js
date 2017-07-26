window.onload = function() {
    var cKey = 67;
    document.addEventListener("keydown", function(e) {
        console.log(e);
        if (e.ctrlKey && e.keyCode === cKey) {
            done();
        }
    });
    document.body.style.margin = "0px";
    document.body.style.overflow = "hidden";
};
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
function setEnv(key, value) {
    for (var i = 0; i < env.length; i++) {
        if (env[i].key == key) {
            env[i].value = value;
            return;
        }
    }
    env.push({ key: key, value: value });
    parent.postMessage("env|" + key + "|" + value);
}
function done() {
    parent.postMessage("done|" + id, "*");
}
