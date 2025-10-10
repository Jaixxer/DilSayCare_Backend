

const config = {
  development: {
    client: "pg",
    connection: {
     URL: process.env.DATABASE_URL 
    },
    migrations: {
      directory: "../../migrations",
      tableName: "knex_migrations",
    },
  },
};

module.exports = config;
