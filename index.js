var l = function(o) {console.log(o);},
		root = process.env.CTXPATH,
		Core = require('../core'),
		restify = require('restify'),
		app = restify.createServer(),
		io = require('socket.io')(app.server),
		cores = {andrei: new Core(root + '/data/' + 'andrei' + '.json')};

function request(verb, ...params) {
	return (req, res, next) => {
		var core = cores[req.params.user.toLowerCase()],
				ps = params.slice();
		ps.unshift(req.params.text);
		res.contentType = 'text';
		res.send(core ? core[verb].apply(core, ps).join('\n') : 'no such user');
		next();
	}
}
		
app.get('/ctx/:user/hints/:text', request('hints'));

app.get('/ctx/:user/get/:text', request('get'));
app.get('/ctx/:user/get-exact/:text', request('get', {exact: true}));

app.get('/ctx/:user/head/:text', request('head'));
app.get('/ctx/:user/head-exact/:text', request('head', {exact: true}));

app.get('/ctx/:user/put/:text', request('put'));

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