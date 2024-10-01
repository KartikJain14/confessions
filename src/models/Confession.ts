import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize'; // Import the Sequelize instance

export class Confession extends Model {
  public id!: number;
  public text!: string;
  public createdAt!: Date; // Automatically populated
  public ipAddress!: string; // For storing IP address
  public userAgent!: string; // For storing user agent
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize, // Pass the Sequelize instance here
    tableName: 'confessions',
    timestamps: false, // Disable automatic timestamps if you are managing them manually
  }
);
