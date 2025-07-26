import { Model, DataTypes, Sequelize } from 'sequelize';
import initializeSequelize from '../sequelize';

// Define the model class
export class Confession extends Model {
  public id!: number;
  public text!: string;
  public score!: number;
  public createdAt!: Date;
  public archived!: boolean;
}

// Function to initialize the Confession model
export const initializeConfessionModel = async (sequelize: Sequelize) => {
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
    },
    {
      sequelize, // Pass the Sequelize instance
      tableName: 'confessions',
      timestamps: false,
    }
  );
};