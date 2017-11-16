// mmm: MercuryWM Module Manager
// Version: 1.1

function getData(url) {
    var xml = new XMLHttpRequest();
    xml.open("GET", url, false);
    xml.send(null);
    if (xml.status == 200) return xml.responseText;
    return "";
}

// Argument checking
if (args.length === 0) {
    script.output("mmm: MercuryWM Module Manager");
    script.output("Usage: mmm [install | remove] [MODULE] [-f]");
    script.output("       mmm [auto-update | list]");
    script.output("");
    script.output("Flags:");
    script.output("    -f: force install/remove");
    return;
}
else if (args.length > 3) {
    script.output("Invalid number of arguments");
    return;
}
var force = false;

if (args.length == 3 && args[2] === "-f") {
    force = true;
}

// Get .mmm config file
var configFile = script.getFile("~/.mmm");
var config = {};
// Config is a list of modules, e.g. {"echo": "2.2", "man": "1.1", ...}
if (configFile === false) {
    // mmm config file not found
    script.writeFile("~/.mmm", "");
}
else if (configFile.data) {
    var modules = configFile.data.trim().split(/\r?\n/);
    config = modules.reduce((acc, mod) => {
        var [name, version] = mod.split("@");
        acc[name] = version;
        return acc;
    }, {});
}

var module = args[1];
if (args[0] === "install") {
    // Find module
    script.output("Searching for module " + module);

    var url = "https://raw.githubusercontent.com/wheel-org/mercurywm-scripts/master/modules/" + module + "/";

    // Get version
    var version = getData(url + "VERSION");
    if (!version) {
        script.output("Could not find module " + module);
        return;
    }
    // Get rid of newline
    version = version.trim();

    // Don't do strict == for the version compare since numbers could be
    //   interpreted as string
    if (config[module] && config[module] == version) {
        // Exists Already
        script.output("Module " + module + "@" + config[module] + " already exists!");
        if (force) {
            script.output("Forceful install will overwrite existing module!");
        }
        else {
            return;
        }
    }

    // Load module
    script.output("Retrieving version " + version);
    var code = getData(url + version + "/main.js");
    if (!code) {
        script.output("Could not retrieve module " + module + "@" + version);
        return;
    }

    // Save module to file system
    if (config[module]) {
        script.output("Reloading module from " + module + "@" + config[module] + " to " + module + "@" + version);
    }
    config[module] = version;
    script.writeFile("~/.bin/" + module, code);

    // Load man page
    script.output("Retrieving man page");
    var man = getData(url + version + "/man.md");
    if (!man) {
        script.output("Could not retrieve man page for " + module + "@" + version);
        return;
    }
    script.writeFile("~/.man/" + module, man);
    script.output("====================================");
    script.output(man);
    script.output("====================================");
}
else if (args[0] === "remove") {
    var file = script.getFile("~/.bin/" + module);

    if (file !== false && config[module]) {
        script.deleteFile("~/.bin/" + module);
        script.output("Module " + module + "@" + config[module] + " removed!");
        delete config[module];
    }
    else if (config[module]) {
        script.output("Looks like this module was already removed! Removed from list of installed modules.");
        delete config[module];
    }
    else if (file !== false) {
        script.output("Found the executable but was not logged as installed. Removing executable.");
        script.deleteFile("~/.bin/" + module);
    }
    else {
        script.output("Module " + module + " is not installed!");
    }
}
else if (args[0] === "auto-update") {

}
else if (args[0] === "list") {
    script.output("Installed packages:");
    Object.keys(config).forEach(function (mod) {
        script.output(mod + "@" + config[mod]);
    });
}
else {
    script.output("Unrecognized command: " + args[0]);
}

// Rewrite Config
var newConfigFile = Object.keys(config).map(mod => mod + "@" + config[mod]).join("\n");
script.writeFile("~/.mmm", newConfigFile);