nginx-o
==================

###### Programmatically manipulate a running Nginx instance

## Installation
In your project directory, run the following command.
```
npm install nginx-o --save
```

## Example
### Creating an instance

```
var Nginx = require('nginx-o');
var nginx = new Nginx();
// -- or --
var nginx = new Nginx({
	sudo: true,
	pidFile: '/run/nginx.pid',
	confDir: '/usr/local/etc/nginx/conf.d/'
});
```
The configuration is automatically loaded depending on the operating system. The default configuration lives in /conf. Feel free to contribute.

### Lifecycle Events
You can listen to start & stop events from Nginx.
```
nginx.on('started', function () { console.log('nginx has started'); });
nginx.on('stopped', function () { console.log('nginx has stopped'); });
```

### Methods
You can start, stop & reload any nginx instance with the following methods. Both callback and promises are supported.
```
nginx.start();
nginx.stop();
nginx.reload();

// callback
nginx.start(function (err) {
	
});

// promises
nginx.stop().then(function () {
	// success
}, function (err) {
	// errror
});
```
