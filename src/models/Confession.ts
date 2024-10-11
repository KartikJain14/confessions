import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize'; // Import the Sequelize instance

export class Confession extends Model {
  public id!: number;
  public text!: string;
  public score!: number;
  public createdAt!: Date; // Automatically populated
  public archived!: boolean; // Automatically populated
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
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
