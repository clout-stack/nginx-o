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
	confDir: '/usr/local/etc/nginx/conf.d' // directory containing .conf files
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

/** callback example */
nginx.start(function (err) {
	
});

/** promises example */
nginx.stop().then(function () {
	// success
}, function (err) {
	// errror
});
```

### Methods for managing vhosts
Programmatically ```create, read, update & delete``` vhosts. This will require your Nginx configuration file to require a http section where their is "an ```include directive``` for all .conf files from a certain folder". (We represent this in our library as ```confDir```); [https://kcode.de/wordpress/2033-nginx-configuration-with-includes](More information.)

#### Create
```
nginx.create({
	id: '', // unique identifier
	raw: '', // raw server block
	template: 'default', // path or string representing template
	values: '' // values to be filled in by template
})
.then(nginx.reload) // reload nginx
.then(function (response) {
	// success
})
.catch(function (err) {
	// error
});
```

An example would be 
```
nginx.create({
	id: 'test',
	template: 'default',
	values: {
		cname: 'example.com',
		port: 80,
		proxy_pass: 'http://localhost:8080'
	}
})
```
### Read
```
nginx.read('unique identifier');
```

### Update
```
nginx.update('unique identifier', {
	/**
	 * same options as create
	 */
	template: 'default',
	values: {
		cname: 'example.com',
		port: 80,
		proxy_pass: 'http://localhost:8080'
	}
});
```

#### Delete
```
nginx.delete('unique identifier')
```
