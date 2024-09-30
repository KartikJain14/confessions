import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize'; // Import the Sequelize instance

export class Confession extends Model {
  public id!: number;
  public text!: string;
}

Confession.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize, // Pass the Sequelize instance here
    tableName: 'confessions',
  }
);
