var express = require('express'),
	r = require('./server/route.js'),
	app = express(),
	bodyParser = require('body-parser')

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
	})
);

app.get('/api/containers', r.routes.getContainers);
app.get('/api/container/:id', r.routes.getContainerById);
app.post('/api/container', r.routes.getContainerByName);
app.post('/api/container', r.routes.containerEntry);
app.delete('/api/container/:id', r.routes.containerDelete);
app.post('/api/container/:id', r.routes.containerUpdate);

app.listen(8000, function() {
	console.log('server is running');
});
