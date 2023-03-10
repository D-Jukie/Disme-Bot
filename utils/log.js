const chalk = require('chalk');

module.exports = (text, type) => {
  switch (type) {
		case "warn":
			process.stderr.write(chalk.hex("#ff5208")(`\r» ERROR « `) + text + '\n');
			break;
		case "error":
			process.stderr.write(chalk.bold.hex("#ff0000").bold(`\r» ERROR « `) + text + '\n');
			break;
		case "load":
      process.stderr.write(chalk.cyan(`\r» NEW USER « `) + text + '\n');
			break;
		default:
			process.stderr.write(chalk.cyan(`\r» ${type.toUpperCase()} « `) + text + '\n');
			break;
	}
};
module.exports.error = (text, type) => {
	process.stderr.write(chalk.bold.hex("#000000").bold(`\r» ${type} « `) + text + '\n');
};

module.exports.err = (text, type) => {
  process.stderr.write(chalk.bold.hex("#ff0000").bold(`\r» ${type} « `) + text) + '\n';
};

module.exports.warn = (text, type) => {
	process.stderr.write(chalk.bgYellow.hex("#000000").bold(`\r» ${type} « `) + text + '\n');
};

module.exports.master = (text, type) => {
  process.stderr.write(chalk.hex("#ff5208")(`\r» ${type} « `) + text + '\n');
};

module.exports.blue = (text, type) => {
  process.stderr.write(chalk.hex("#0568f2").bold(`\r» ${type} « `) + text + '\n');
};

module.exports.green = (text, type) => {
  process.stderr.write(chalk.green.bold(`\r» ${type} « `) + text + '\n');
};

module.exports.pink = (text, type) => {
  process.stderr.write(chalk.hex("#f205c3").bold(`\r» ${type} « `) + text + '\n');
};

module.exports.purple = (text, type) => {
  process.stderr.write(chalk.hex("#a700ffff").bold(`\r» ${type} « `) + text + '\n');
};
module.exports.banner = (data) => {
	const rdcl = ['blue', 'yellow', 'green', 'red', 'magenta', 'yellowBright', 'blueBright', 'magentaBright']
	const color = chalk[rdcl[Math.floor(Math.random() * rdcl.length)]]
	console.log(color(data));
}
module.exports.loader = (data, option) => {
	switch (option) {
		case "warn":
			process.stderr.write(chalk.hex("#ff5208")(`\r» Disme Project « `) + data + '\n');
			break;
		case "error":
			process.stderr.write(chalk.bold.hex("#ff0000").bold(`\r» Disme Project « `) + data + '\n');
			break;
		default:
			process.stderr.write(chalk.cyan(`\r» Disme Project « `) + data + '\n');
			break;
	}
}
