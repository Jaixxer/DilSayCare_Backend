import knex from "knex";
const knexConfig = require("./knexfile");
const db = knex(knexConfig.development);
export default db;
