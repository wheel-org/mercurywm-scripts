// mmm: MercuryWM Module Manager
// Version: 2.1

function getData(url) {
    var xml = new XMLHttpRequest();
    xml.open('GET', url, false);
    xml.send(null);
    if (xml.status == 200) return xml.responseText;
    return '';
}

// Argument checking
if (args.length === 0) {
    script.output('mmm: MercuryWM Module Manager');
    script.output('Usage: mmm [install | remove | update] [MODULE] [-f]');
    script.output('       mmm [auto-update | list]');
    script.output('');
    script.output('Flags:');
    script.output('    -f: force install/remove');
    return;
}
else if (args.length > 3) {
    script.output('Invalid number of arguments');
    return;
}
var force = false;

if (args.length == 3 && args[2] === '-f') {
    force = true;
}

// Get .mmm config file
var configFile = script.getFile('~/.mmm');
var config = {};
// Config is a list of modules, e.g. {"echo": "2.2", "man": "1.1", ...}
if (configFile === false) {
    // mmm config file not found
    script.writeFile('~/.mmm', '');
}
else if (configFile.data) {
    var modules = configFile.data.trim().split(/\r?\n/);
    config = modules.reduce((acc, mod) => {
        var [name, version] = mod.split('@');
        acc[name] = version;
        return acc;
    }, {});
}

var module = args[1] || "";
var update = false;
const idx = module.indexOf('/');
const author = module.substr(0, idx);
const pkg = module.substr(idx + 1);
const fileName = author ? author + '-' + pkg : module;

if (args[0] === 'update') {
    update = true;
    args[0] = 'install';
}
if (args[0] === 'install') {
    // Find module
    script.output('Searching for module ' + module);

    const url = author ?
        'https://raw.githubusercontent.com/' + author + '/' + pkg + '/master/' :
        'https://raw.githubusercontent.com/wheel-org/mercurywm-scripts/master/modules/' + pkg + '/';

    // Get version
    var version = getData(url + 'VERSION');
    if (!version) {
        script.output('Could not find module ' + module);
        return;
    }
    // Get rid of newline
    version = version.trim();

    // Don't do strict == for the version compare since numbers could be
    //   interpreted as string
    if (config[module] && config[module] == version) {
        // Exists Already
        if (!force) {
            if (update) {
                script.output(
                  'Module ' +
                    module +
                    '@' +
                    config[module] +
                    ' is already the latest version!'
                );
            }
            else {
                script.output(
                  'Module ' + module + '@' + config[module] + ' already exists!'
                );
            }
            return;
        }
    }

    // Load module
    script.output('Retrieving version ' + version);
    var code = getData(url + version + '/main.js');
    if (!code) {
        script.output('Could not retrieve module ' + module + '@' + version);
        return;
    }

    // Save module to file system
    if (config[module]) {
        script.output(
          'Reloading module from ' +
            module +
            '@' +
            config[module] +
            ' to ' +
            module +
            '@' +
            version
        );
    }
    config[module] = version;

    script.writeFile('~/.bin/' + fileName, code);

    // Look for additional files that the module needs
    const additionalFiles = getData(url + 'FILES');
    if (additionalFiles) {
        const files = additionalFiles.trim().split('\n');
        script.output('Additional files found: ' + files.join(', '));

        /* This call could complain if another package by this author has caused
         * this dir to be created already */
        script.exec('mkdir ~/.bin/' + author);
        script.exec('mkdir ~/.bin/' + author + '/' + pkg);

        files.forEach((file) => {
            const content = getData(url + version + '/' + file);
            if (!content) {
                script.output('Failed to retrieve ' + file + '.');
                return;
            }
            script.writeFile('~/.bin/' + author + '/' + pkg + '/' + file, content);
        });
    }

    // Load man page
    script.output('Retrieving man page');
    var man = getData(url + version + '/man.md');
    if (!man) {
        script.output('Could not retrieve man page for ' + module + '@' + version);
        return;
    }
    script.writeFile('~/.man/' + module, man);
    script.output('====================================');
    script.output(man);
    script.output('====================================');
}
else if (args[0] === 'remove') {
    var file = script.getFile('~/.bin/' + fileName);

    if (file !== false && config[module]) {
        script.deleteFile('~/.bin/' + fileName);
        script.output('Module ' + module + '@' + config[module] + ' removed!');
        delete config[module];
    }
    else if (config[module]) {
        script.output(
          'Looks like this module was already removed! Removed from list of installed modules.'
        );
        delete config[module];
    }
    else if (file !== false) {
        script.output(
          'Found the executable but was not logged as installed. Removing executable.'
        );
        script.deleteFile('~/.bin/' + fileName);
    }
    else {
        script.output('Module ' + module + ' is not installed!');
    }
} else if (args[0] === 'auto-update') {
    Object.keys(config).forEach(function(mod) {
        script.output('Updating ' + mod + '...');
        script.exec('mmm update ' + mod);
        script.output('\n');
    });
    script.output('All modules brought up to date!');
}
else if (args[0] === 'list') {
    script.output('Installed packages:');
    Object.keys(config).forEach(function(mod) {
        script.output(mod + '@' + config[mod]);
    });
}
else {
    script.output('Unrecognized command: ' + args[0]);
}

// Rewrite Config
var newConfigFile = Object.keys(config)
  .map(mod => mod + '@' + config[mod])
  .join('\n');
script.writeFile('~/.mmm', newConfigFile);
