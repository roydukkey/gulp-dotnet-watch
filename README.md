# gulp-dotnet-watch

dotnet-watch plugin for [Gulp](https://github.com/gulpjs/gulp)

## Install

```
npm install gulp-dotnet-watch --save-dev
```

Don't forget to install the [dotnet-watch](https://github.com/aspnet/dotnet-watch#how-to-install) tooling.

## Basic Usage

```javascript
var gulp = require('gulp'),
	dotnet = require('gulp-dotnet-watch');

gulp.task('watch-server', function () {
	dotnet.watch('run', {
		cwd: './Web'
	});
});
```

## Advanced Usage

```javascript
var gulp = require('gulp'),
	dotnet = require('gulp-dotnet-watch');

gulp.task('watch-server', function (cb) {
	var watcher = new dotnet({
		cwd: './Web',
		logLevel: 'error',
		options: ['verbose'],
		arguments: {
			framework: 'net451',
			arg1: 'value'
		}
	});

	watcher.watch('run', cb);
});
```

## Options

#### cwd

The `cwd` option should be the path where the [dotnet-watch](https://github.com/aspnet/dotnet-watch#how-to-install) tooling is available.

**Default:** './'

#### options

Toggle options such as `--verbose` or `--no-build` are to be placed in the `options` array.

**Default:** null

#### arguments

The `arguments` option is a object for any key/value arguments. For example, `--framework net451 -- --arg1 value1` would result in `{ framework: 'net451, arg1: 'value1' }`.

**Default:** null

#### logLevel

This option will determine the level of log information that will be output to the console. Log information will include any information equal to or less severe than the configured value.

**Default:** 'info'<br />
**Values:** 'error', 'warning', 'info', 'silent'

## Methods

#### dotnet.watch(task [, options [, callback]])

This static method will start a watch process for the provided `task`, and can be configured by passing an `options` object. The method will return an active watcher instance, and the `callback` will be issued once the watch process has started the application. Supported `task`s include 'run' and 'test', however others may still work.

#### new dotnet([options]).watch(task [, callback])

This method will start a watch process for the provided `task`. The method will return an active watcher instance, and the `callback` will be issued once the watch process has started the application.

#### new dotnet([options]).kill()

This method will kill the active watch process on the watcher instance.


## License

MIT
