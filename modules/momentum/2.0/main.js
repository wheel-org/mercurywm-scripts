if (args.length === 0) {
    script.output("momentum: a clone of the productivity extension");
    script.output("Usage: momentum [install | remove]");
    return;
}
else if (args.length > 1) {
    script.output("Invalid number of arguments");
    return;
}
else if (args[0] === "remove") {
    if (script.getDirectory("~/.momentum")) script.deleteDirectory("~/.momentum");
    script.output("momentum has been removed. Run 'workspace remove' to remove the created workspace.");
    return;
}
else if (args[0] !== "install") {
    script.output("Unknown argument " + args[0]);
    return;
}

// Install

if (script.getDirectory("~/.momentum")) {
    script.output("momentum is already installed!")
    return;
}

script.output("Installing momentum...");

// Writing files

script.output("Writing files...")

var files = {
    'greeting': {
        html: `\
<div style="text-align: center;">
    <h2 id="greeting" style="
        color: white;
        font-family: Helvetica;
        font-size: 3em;
        font-weight: 500;
    "></h2>
</div>`,
        js: `\
var g = document.getElementById('greeting');
var d = new Date();
var greet = 'morning';
if (d.getHours() >= 12 && d.getHours() < 18) greet = 'afternoon';
else if (d.getHours() >= 18 && d.getHours <= 23) greet = 'evening';

var username = env.username || 'MercuryWM';
g.innerHTML = 'Good ' + greet + ', ' + username + '.';`
    },
    'time': {
        html: `\
<div style="width: 100%; text-align: center;">
    <h1 id="time" style="
        color: white;
        font-size: 10em;
        font-family: Helvetica;
        font-weight: 500;
    "></h1>
</div>`,
        js: `\
var t = document.getElementById('time');

(function loop() {
    var d = new Date();
    t.innerHTML = ('' + d.getHours()).padStart(2, '0') + ':' +
                  ('' + d.getMinutes()).padStart(2, '0');
    setTimeout(loop, 1000 * 60);
})();`
    },
    'todo': {
        html: `\
<div style="text-align: center; color: white;">
    <h3 style="
        font-weight: 300;
        font-size: 2em;
        font-family: Helvetica;
    ">What is your main focus for today?</h3>
    <input id="todo-input" type="text" style="
        background: 0;
        border: 0;
        border-bottom: 3px solid white;
        outline: 0;
        width: 40%;
        font-size: 2em;
        text-align: center;
        color: white;
    ">
    <h3 id="todo-text" style="
        font-weight: 300;
        font-size: 1.5em;
        font-family: Helvetica;
        display: none;
    "></h3>
</div>`,
        js: `\
var ti = document.getElementById('todo-input');
var tt = document.getElementById('todo-text');

ti.addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        ti.style.display = 'none';
        tt.style.display = 'block';
        tt.innerHTML = ti.value;
    }
});`
    },
    'quote': {
        html: `\
<div style="text-align: center;">
    <p id="quote" style="
        color: white;
        font-family: Helvetica;
        font-size: 1.2em;
    ">“Wherever you go, go with all your heart.”</p>
</div>`,
        js: 'console.log("lol")'
    }
};

var formatFiles = [];

Object.keys(files).forEach(f => {
    if (files[f].html) {
        formatFiles.push(script.createFile(f, files[f].html));
    }
    if (files[f].js) {
        formatFiles.push(script.createFile(f + "js", files[f].js));
    }
});

script.createDirectory(".momentum", formatFiles);

// Creating workspace

script.output("Setting up workspace...");

var windows = [
    {
        x: 0,
        y: 0,
        w: 10,
        h: 100,
        command: ''
    },{
        x: 10,
        y: 0,
        w: 80,
        h: 35,
        command: ''
    },{
        x: 10,
        y: 35,
        w: 80,
        h: 23,
        command: 'time'
    },{
        x: 10,
        y: 58,
        w: 80,
        h: 12,
        command: 'greeting'
    },{
        x: 10,
        y: 70,
        w: 80,
        h: 20,
        command: 'todo'
    },{
        x: 10,
        y: 90,
        w: 80,
        h: 10,
        command: 'quote'
    },{
        x: 90,
        y: 0,
        w: 10,
        h: 20,
        command: ''
    },{
        x: 90,
        y: 20,
        w: 10,
        h: 80,
        command: ''
    }
];

var formatWindows = windows.map(w => Object.assign({},
    script.createWindow(w.x, w.y, w.w, w.h, Date.now() + Math.random() * 100000 | 0), {
    terminal: Object.assign(script.createTerminal(), {
        history: [w.command
            ? 'render ~/.momentum/' + w.command + ' ~/.momentum/' + w.command + 'js'
            : 'text'
        ],
        isExtension: true,
        runningCommand: w.command ? 'render' : 'text',
        params: w.command
            ? ['~/.momentum/' + w.command, '~/.momentum/' + w.command + 'js']
            : []
    })
}));

script.addWorkspace(formatWindows);

script.output("momentum installed! Open the new workspace to view momentum.")
