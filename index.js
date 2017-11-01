var l = function(o) {console.log(o);},
		root = process.env.CTXPATH,
		Core = require('../core'),
		restify = require('restify'),
		app = restify.createServer(),
		io = require('socket.io')(app.server),
		cores = {andrei: new Core(root + '/data/' + 'andrei' + '.json')};
		
app.get('/ctx/:user/put/:text', (req, res, next) => {
	var core = cores[req.params.user.toLowerCase()];
	res.contentType = 'text';
	res.send(core ? core.put(req.params.text) : 'no such user');
	next();
});

app.get('/ctx/:user/get/:text', (req, res, next) => {
	var core = cores[req.params.user.toLowerCase()];
	res.contentType = 'text';
	res.send(core ? core.get(req.params.text).join('\n') : 'no such user');
	next();
});

app.get('/ctx/:user/hints/:text', (req, res, next) => {
	var core = cores[req.params.user.toLowerCase()];
	res.contentType = 'text';
	res.send(core ? core.hints(req.params.text).join('\n') : 'no such user');
	next();
});

app.get('/ctx/socket.io.js', restify.serveStatic({
	directory: __dirname + '/node_modules/socket.io-client/dist',
	file: 'socket.io.slim.js'
}));

app.get('/ctx/:user', restify.serveStatic({
	directory: __dirname,
	file: 'index.html'
}));

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

cores.andrei.onPut = function(text) {
	io.emit('put', text);	
};		
		
app.listen(3201, () => {
	// console.log('%s listening at %s', app.name, app.url);
});