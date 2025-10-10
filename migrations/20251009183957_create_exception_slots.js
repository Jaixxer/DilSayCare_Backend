/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("exceptions", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("recurring_slot_id").notNullable().references("id").inTable("recurring_slots").onDelete("CASCADE");
        table.date("date").notNullable();
        table.enum("type", ["deleted", "modified"]).notNullable();
        table.time("new_start_time").nullable(); // nullable for deleted exceptions
        table.time("new_end_time").nullable(); // nullable for deleted exceptions
        table.timestamps(true, true);

        // Add indexes for better query performance
        table.index(['recurring_slot_id', 'date']);
        table.index(['date']);
    });

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("exceptions");

};
