if (args.length === 0) {
    script.output('man: Display manual about a command');
    script.output('Usage: man [commmand name]');
}
else {
    args.forEach(command => display(command));
}

function display(command) {
    var manFile = script.getFile('~/.man/' + command);
    if (manFile) {
        script.output(manFile.data);
    }
    else {
        script.output('No entry for ' + command);
    }
}