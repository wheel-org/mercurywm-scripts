window.onload = function() {
    var cKey = 67;
    window.addEventListener("keydown", function(e) {
        console.log(e);
        if (e.ctrlKey && e.keyCode === cKey) {
            done();
        }
    });
    document.body.style.margin = "0px";
    document.body.style.overflow = "hidden";
    var textareas = document.getElementsByTagName('textarea');
    var count = textareas.length;
    for(var i = 0; i < count; i++){
        textareas[i].onkeydown = function(e){
            if(e.keyCode==9 || e.which==9){
                e.preventDefault();
                var s = this.selectionStart;
                this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
                this.selectionEnd = s+1; 
            }
        }
    }
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
var params = JSON.parse($_GET["params"]);
var env = JSON.parse($_GET["env"]);
var workingDirectory = $_GET["workingDirectory"];
var fileRequestCallback;

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
            parent.postMessage("env|" + key + "|" + value, "*");
            return;
        }
    }
    env.push({ key: key, value: value });
    parent.postMessage("env|" + key + "|" + value, "*");
}

function done() {
    parent.postMessage("done|" + id, "*");
}

function getFile(path, callback) {
    fileRequestCallback = callback;
    parent.postMessage("requestFile|" + path, "*");
}

function writeFile(path, content) {
    parent.postMessage("writeFile|" + path + "|" + content, "*");
}

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
    var message = event.data;
    var parts = event.data.split("|"); 
    if (parts[0] === "file") {
        if (fileRequestCallback != null) {
            fileRequestCallback(message.substring(message.indexOf("|") + 1));
        }
        fileRequestCallback = null;
    }
}
