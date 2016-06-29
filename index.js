'use strict';

var SERVICE_NAME = 'dotnet-watch'
	, assign = require('object-assign')
	, gutil = require('gulp-util')
	, spawn = require('child_process').spawn;

const logLevels = {
	error: 1,
	warning: 2,
	info: 3,
	silent: 4
};

const defaults = {
	cwd: './',
	logLevel: 'info',
	options: null, // For value flags. ie. [ 'verbose', 'no-build' ]
	arguments: null // For key/value flags. ie. { framework: 'net451', configuration: 'Debug', customArg1: 'Custom Value 1' }
};

function log(logLevel, targetLevel, msg, data) {
	if (logLevel >= targetLevel) {
		msg = msg.toString().trim();

		if (msg.length > 0) {
			let color = logLevel === logLevels.error
				? gutil.colors.red
				: logLevel === logLevels.warning
					? gutil.colors.yellow
					: gutil.colors.blue;

			msg = `${color(SERVICE_NAME)}: ${msg}`;

			if (data) {
				gutil.log(msg, data);
			}
			else {
				gutil.log(msg);
			}
		}
	}
}

function buildCommand(task, opts, args) {
	let output = ['watch'];

	if (opts !== null) {
		opts = opts.slice(0);
	}
	args = assign({}, args);

	// @dotnet: <verbose> must come before task
	if (opts !== null) {
		opts = AddOptions(output, opts, ['verbose'], true);
	}

	output.push(task);

	// @Test: <project> comes directly after task
	if (task === 'test' && args !== null && args.hasOwnProperty('project')) {
		output.push(args.project);

		delete args.project;
	}

	// Value Options
	if (opts !== null) {
		for (let i = 0; i < opts.length; i++) {
			AddOptions(output, opts, [opts[i]], false);
		}
	}

	// Key Value Options
	if (args !== null) {
		if (task === 'run') {

			// @Run: <framework>, <configuration>, <project> come before custom arguments
			AddArguments(output, args, ['framework', 'configuration', 'project'], true);

			// @Run: custom argument indication
			if (Object.keys(args).length > 0) {
				output.push('--');
			}
		}

		for (let arg in args) {
			AddArguments(output, args, [arg], false);
		}
	}

	return output;
}

function AddOptions(output, source, names, doDelete) {
	for (let i = 0; i < names.length; i++) {
		let index = source.indexOf(names[i]);

		if (index >= 0) {
			output.push('--' + names[i]);

			if (doDelete) {
				source = source.filter(e => e !== names[i]);
			}
		}
	}

	return source;
}

function AddArguments(output, source, names, doDelete) {
	for (let i = 0; i < names.length; i++) {
		if (source.hasOwnProperty(names[i])) {
			output.push('--' + names[i], source[names[i]]);

			if (doDelete) {
				delete source[names[i]];
			}
		}
	}
}

class DotnetWatch {

	static watch(task, options, callback) {
		return new DotnetWatch(options).watch(task, callback);
	}

	constructor(options) {
		this.options = assign({}, defaults, options);
	}

	watch(task, done) {
		let logLevel = logLevels[this.options.logLevel];

		if (this._child) {
			log(logLevels.info, logLevel, 'Already watching');
		}
		else {
			if (!this._child) {
				process.on('exit', () => this.kill());
			}

			let args = buildCommand(task, this.options.options, this.options.arguments);

			this.isWatching = true;

			this._child = spawn('dotnet', args, {
				cwd: this.options.cwd
			});

			this._child.stdout.on('data', (data) => {
				log(logLevels.info, logLevel, data);

				if (data.indexOf('Ctrl+C') > -1) {
					if (done) {
						log(logLevels.info, logLevel, 'Passing to callback');

						done();
					}
				}
			});

			this._child.stderr.on('data', (data) => {
				log(logLevels.error, logLevel, data);
			});

			this._child.on('close', () => {
				this.isWatching = false;
			});

			this._child.on('error', (error) => {
				log(logLevels.error, logLevel, error.stack);
			});
		}

		return this;
	}

	kill() {
		if (this._child) {
			this._child.kill();
		}

		return this;
	}
}

module.exports = DotnetWatch;
