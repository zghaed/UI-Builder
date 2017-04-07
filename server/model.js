var Sequelize = require('sequelize'),
	c = require('./conf');

var Container = c.config.db.define( 'container', {
	regionNumber: {
		type: Sequelize.STRING,
		field: 'region_number'
	},
	containerContent: {
		type: Sequelize.TEXT,
		field: 'container_content'
	},
	isHorizontal: {
		type: Sequelize.BOOLEAN,
		field: 'is_horizontal'
	},
	order: {
		type: Sequelize.INTEGER,
		field: 'order'
	}
} , {
	timestamps: true
});

exports.models = {
	container: Container
}
