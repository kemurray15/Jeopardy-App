module.exports = function (sequelize, DataTypes) {
	return sequelize.define('qa', {
		question: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 250]
			}
		},
		answer: {
			type: DataTypes.STRING,
			allowNull: false
		},
		known: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	});
};