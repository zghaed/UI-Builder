var config = require('./conf'),
	m = require('./model');

var getContainers = function(req, res) {
	m.models.container.findAll({
		order: 'createdAt DESC'
	}).then(function(result){
		res.send(result);
	}, function(err){
		console.log(err);
	});
};

var getContainerById = function(req, res) {
	var id = req.params.id;
	m.models.container.findOne({
		where: {
			id: id
		}
	}).then(function(result){
		res.send(result);
	}, function(err){
		console.log(err);
	});
};

var getContainerByName = function(req, res) {
	var box = req.body.box,
		group = req.body.group;
	m.models.container.findOne({
		where: {
			groupNumber: group,
			boxName: box
		}
	}).then(function(result){
		res.send(result);
	}, function(err){
		console.log(err);
	});
};

var containerEntry = function(req, res) {
	var box = req.body.box,
		template = req.body.template,
		data = req.body.data,
		horizontal = req.body.horizontal,
		group = req.body.group;
	m.models.container.sync()
		.then(function() {
			return 	m.models.container.create({
				boxName: box,
				groupNumber: group,
				containerTemplate: template,
				containerData: data,
				isHorizontal: horizontal
			});
		})
		.then(function(data) {
			res.send({
				status: 'OK',
				data: data
			});
		});
};

var containerUpdate = function(req, res) {
	var box = req.body.box,
		template = req.body.template,
		data = req.body.data,
		horizontal = req.body.horizontal,
		group = req.body.group;
	var id = req.params.id;
	m.models.container.findOne({
		where: {
			id: id
		}
	}).then(function(container){
		if (!container) {
			return res.send('Container not found!');
		}
		return container
		.updateAttributes({
			boxName: box,
			groupNumber: group,
			containerTemplate: template,
			containerData: data,
			isHorizontal: horizontal
		}).then(function(result){
			console.log('successful');
			console.log(result);
			res.send(result);
		}, function(err){
			console.log(err);
		});
	}, function(err){
		console.log('error');
		console.log(err);
	});
};

var boxUpdate = function(req, res) {
	var box = req.body.box,
		template = req.body.template,
		data = req.body.data,
		horizontal = req.body.horizontal,
		group = req.body.group;
	var name = req.params.name;
	return m.models.container.findAll({
		where: {
			boxName: name
		}
	}).then(function(container){
		if (!container) {
			return res.send('No box found!');
		}
		for (var i in container) {
			container[i].updateAttributes({
				boxName: box,
				groupNumber: group,
				containerTemplate: template,
				containerData: data,
				isHorizontal: horizontal
			});
		}
	}).then(function(result){
		res.send(result);
	}, function(err){
		console.log(err);
	});
};

var containerDelete = function(req, res) {
	var id = req.params.id;
	m.models.container.findOne({
		where: {
			id: id
		}
	})
	.then(function(container) {
		if (!container) {
			return res.send('Container not found!');
		}
		return container
			.destroy()
			.then(function(result){
				res.send(result);
			}, function(err){
				console.log(err);
			});
	});
};

exports.routes = {
	getContainers: getContainers,
	getContainerById: getContainerById,
	containerEntry: containerEntry,
	containerDelete: containerDelete,
	containerUpdate: containerUpdate,
	boxUpdate: boxUpdate,
	getContainerByName: getContainerByName
};
