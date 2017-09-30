// mmm: MercuryWM Module Manager 
// Version: 1.0

// Argument checking
if (args.length === 0) {
    script.output("mmm: MercuryWM Module Manager");
	script.output("Usage: mmm [install | remove] [MODULE]");
	script.output("       mmm [auto-update]");
	return;
}
else if (args.length > 2) {
	script.output("Invalid number of arguments");
	return;
}

// Setup .mmm config file
var configFile = script.getFile("~/.mmm");
var config = [];
// Config is a list of modules, eg [["echo", "2.2"], ["man", "1.1"]] etc
if (configFile === false) {
    // mmm config file not found
    script.writeFile("~/.mmm", "");
    config = [];
}
else {
    var modules = configFile.data.trim().split(/\r?\n/);
    for (var i = 0; i < modules.length; i++) {
        var moduleParts = modules[i].split("@");
        config.push(moduleParts);
    }
}

function indexOfModule(moduleName) {
    for (var i = 0; i < config.length; i++) {
        if (config[i][0] === moduleName) {
            return i;
        }
    }  
    return -1;
}

function getData(url) {
	var xml = new XMLHttpRequest();
	xml.open("GET", url, false);
	xml.send(null);
	if (xml.status == 200) return xml.responseText;
	return "";
}

if (args[0] === "install") {
	// Find module
	var module = args[1];
	script.output("Searching for module " + module);

	var url = "https://raw.githubusercontent.com/wheel-org/mercurywm-scripts/master/modules/" + module + "/";

	var version = getData(url + "VERSION");
	if (!version) {
		script.output("Could not find module " + module);
		return;
	}
	// Get rid of newline
	version = version.trim();
	var index = indexOfModule(module);
	// Don't do strict == for the version compare since numbers could be
	//   interpreted as string
	if (index !== -1 && config[index][1] == version) {
		// Exists Already
		script.output("Module " + config[index].join("@") + " already exists!");
		return;
	}

	// Load module
	script.output("Retrieving version " + version);
	var code = getData(url + version + "/main.js");
	if (!code) {
		script.output("Could not retrieve module " + module + "@" + version);
		return;
	}

	// Save module to file system
	if (index !== -1) {
		script.output("Reloading module from " + config[index].join("@") +
			" to " + [module, version].join("@"));
		config[index][1] = version;
	}
	else {
		config.push([module, version]);
	}
	script.writeFile("~/bin/" + module, code);
	// Load man page
	script.output("Retrieving man page");
	var man = getData(url + version + "/man.md");
	if (!man) {
		script.output("Could not retrieve man page for " + module + "@" + version);
		return;
	}
	script.output("====================================");
	script.output(man);
	script.output("====================================");
}
else if (args[0] === "remove") {
	var index = indexOfModule(args[1]);
	var file = script.getFile("~/bin/" + args[1]);
	if (file !== false && index !== -1) {
		script.deleteFile("~/bin/" + args[1]);
		script.output("Module " + config[index].join("@") + " removed!");
		config.splice(index, 1);
	}
	else if (index !== -1) {
		script.output("Looks like this module was already removed! Removed from list of installed modules.");
		config.splice(index, 1);
	}
	else if (file !== false) {
		script.output("Found the executable but was not logged as installed. Removing executable.");
		script.deleteFile("~/bin/" + args[1]);
	}
	else {
		script.output("Module " + args[1] + " is not installed!");
	}
}
else if (args[0] === "auto-update") {

}
else { 
	script.output("Unrecognized command: " + args[0]);
}

// Rewrite Config 
console.log(config);
var newConfigFile = config.reduce(function (acc, mod) { return acc.concat([mod.join("@")]); }, []);
console.log(newConfigFile);
script.writeFile("~/.mmm", newConfigFile.join("\n"));

