var Sequelize = require('sequelize'),
	c = require('./conf');

var Container = c.config.db.define( 'container', {
	regionNumber: {
		type: Sequelize.INTEGER,
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
	groupNumber: {
		type: Sequelize.INTEGER,
		field: 'group_number'
	}
} , {
	timestamps: true
});

exports.models = {
	container: Container
}
