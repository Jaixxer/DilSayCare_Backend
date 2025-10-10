/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("recurring_slots", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.integer("day_of_week").notNullable(); // 0-6 (Sunday to Saturday)
        table.time("start_time").notNullable();
        table.time("end_time").notNullable();
        table.timestamps(true, true);

        // Add indexes for better query performance
        table.index(['day_of_week']);
    })

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("recurring_slots");

};
