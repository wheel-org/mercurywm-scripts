window.onload = function() {
    var cKey = 67; // 'c'
    window.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.keyCode === cKey) {
            // Quit extension on Ctrl+C
            done();
        }
    });

    document.body.style.margin = '0px';
    document.body.style.overflow = 'hidden';

    var textareas = document.getElementsByTagName('textarea');
    for(var i = 0; i < textareas.length; i++) {
        textareas[i].onkeydown = function(e) {
            if(e.keyCode === 9 || e.which === 9) {
                // Output tab character instead of switching focus
                e.preventDefault();
                var s = this.selectionStart;
                this.value = this.value.slice(0, this.selectionStart) + '\t' + this.value.slice(this.selectionEnd);
                this.selectionEnd = s + 1;
            }
        }
    }
};

function getQueryParams(qs) {
    var query = qs.split('+').join(' '),
        params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}
var $_GET = getQueryParams(document.location.search);
console.log($_GET);
var id = $_GET.id
var params = JSON.parse($_GET.params);
var env = JSON.parse($_GET.env);
var workingDirectory = $_GET.workingDirectory;
var fileRequestCallback = {};

function sendMessage(msg) {
    parent.postMessage(JSON.stringify(msg), '*');
}

function getEnv(key) {
    return env[key] || '';
}

function setEnv(key, value) {
    env[key] = value;
    sendMessage({
      type: 'env',
      key,
      value
    });
}

function done() {
    sendMessage({
      type: 'done',
      id
    });
}

function getFile(path, callback) {
    fileRequestCallback[path] = callback;
    sendMessage({
      type: 'requestFile',
      path
    });
}

function writeFile(path, content) {
    sendMessage({
      type: 'writeFile',
      path,
      content
    });
}

window.addEventListener('message', receiveMessage, false);

function receiveMessage(event) {
    var message = JSON.parse(event.data);
    if (message.type === 'file') {
        if (fileRequestCallback[message.path]) {
            fileRequestCallback[message.path](message.contents);
            delete fileRequestCallback[message.path];
        }
    }
}
