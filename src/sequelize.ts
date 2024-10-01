import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './confessions.sqlite', // Specify the SQLite database file
});

export default sequelize;
