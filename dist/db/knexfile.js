"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    development: {
        client: "pg",
        connection: {
            host: "localhost",
            user: "postgres",
            password: "TestPassword023",
            database: "dilsaycare",
        },
        migrations: {
            directory: "../../migrations",
            tableName: "knex_migrations",
        },
    },
};
exports.default = config;
