"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecurringSlot = exports.deleteSlot = exports.updateSlot = exports.getWeeklySlots = exports.createTimeSlot = void 0;
const db_1 = __importDefault(require("../db/db"));
const createTimeSlot = async (data) => {
    try {
        const { daysOfWeek, startTime, endTime } = data;
        const slots = [];
        for (const dayOfWeek of daysOfWeek) {
            const [slot] = await (0, db_1.default)('recurring_slots')
                .insert({
                day_of_week: dayOfWeek,
                start_time: startTime,
                end_time: endTime
            })
                .returning('*');
            slots.push(slot);
        }
        return slots;
    }
    catch (error) {
        throw new Error(`Failed to create time slot: ${error}`);
    }
};
exports.createTimeSlot = createTimeSlot;
const getWeeklySlots = async (startDate, endDate) => {
    try {
        const recurringSlots = await (0, db_1.default)('recurring_slots').select('*');
        const exceptions = await (0, db_1.default)('exceptions')
            .select('*', db_1.default.raw('date::text as date'))
            .whereBetween('date', [startDate, endDate]);
        console.log('Recurring Slots:', JSON.stringify(recurringSlots, null, 2));
        console.log('Exceptions:', JSON.stringify(exceptions, null, 2));
        console.log('Date range:', startDate, 'to', endDate);
        const weeklySlots = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dayOfWeek = date.getDay();
            const dateStr = date.toISOString().split('T')[0];
            const dayRecurringSlots = recurringSlots.filter(slot => slot.day_of_week === dayOfWeek);
            for (const recurringSlot of dayRecurringSlots) {
                const exception = exceptions.find(ex => {
                    const exceptionDateStr = ex.date;
                    const match = ex.recurring_slot_id === recurringSlot.id && exceptionDateStr === dateStr;
                    console.log(`Checking exception: recurring_slot_id=${ex.recurring_slot_id}, date=${exceptionDateStr}, looking for: ${recurringSlot.id}, ${dateStr}, match=${match}`);
                    return match;
                });
                console.log(`Date: ${dateStr}, DayOfWeek: ${dayOfWeek}, RecurringSlot: ${recurringSlot.id}, Exception: ${exception ? exception.id : 'none'}`);
                if (exception) {
                    if (exception.type === 'deleted') {
                        continue;
                    }
                    else if (exception.type === 'modified') {
                        const startTime = exception.new_start_time.substring(0, 5);
                        const endTime = exception.new_end_time.substring(0, 5);
                        weeklySlots.push({
                            id: exception.id,
                            date: dateStr,
                            start_time: startTime,
                            end_time: endTime,
                            is_exception: true,
                            recurring_slot_id: recurringSlot.id
                        });
                    }
                }
                else {
                    const startTime = recurringSlot.start_time.substring(0, 5);
                    const endTime = recurringSlot.end_time.substring(0, 5);
                    weeklySlots.push({
                        id: recurringSlot.id,
                        date: dateStr,
                        start_time: startTime,
                        end_time: endTime,
                        is_exception: false,
                        recurring_slot_id: recurringSlot.id
                    });
                }
            }
        }
        return weeklySlots;
    }
    catch (error) {
        throw new Error(`Failed to get weekly slots: ${error}`);
    }
};
exports.getWeeklySlots = getWeeklySlots;
const updateSlot = async (slotId, date, startTime, endTime) => {
    try {
        const existingException = await (0, db_1.default)('exceptions')
            .where({
            recurring_slot_id: slotId,
            date: date
        })
            .first();
        if (existingException) {
            const [updatedException] = await (0, db_1.default)('exceptions')
                .where('id', existingException.id)
                .update({
                type: 'modified',
                new_start_time: startTime,
                new_end_time: endTime,
                updated_at: new Date()
            })
                .returning('*');
            return updatedException;
        }
        else {
            const [newException] = await (0, db_1.default)('exceptions')
                .insert({
                recurring_slot_id: slotId,
                date: date,
                type: 'modified',
                new_start_time: startTime,
                new_end_time: endTime
            })
                .returning('*');
            return newException;
        }
    }
    catch (error) {
        throw new Error(`Failed to update slot: ${error}`);
    }
};
exports.updateSlot = updateSlot;
const deleteSlot = async (slotId, date) => {
    try {
        const existingException = await (0, db_1.default)('exceptions')
            .where({
            recurring_slot_id: slotId,
            date: date
        })
            .first();
        if (existingException) {
            const [updatedException] = await (0, db_1.default)('exceptions')
                .where('id', existingException.id)
                .update({
                type: 'deleted',
                new_start_time: null,
                new_end_time: null,
                updated_at: new Date()
            })
                .returning('*');
            return updatedException;
        }
        else {
            const [newException] = await (0, db_1.default)('exceptions')
                .insert({
                recurring_slot_id: slotId,
                date: date,
                type: 'deleted',
                new_start_time: null,
                new_end_time: null
            })
                .returning('*');
            return newException;
        }
    }
    catch (error) {
        throw new Error(`Failed to delete slot: ${error}`);
    }
};
exports.deleteSlot = deleteSlot;
const deleteRecurringSlot = async (slotId) => {
    try {
        await (0, db_1.default)('recurring_slots').where('id', slotId).del();
    }
    catch (error) {
        throw new Error(`Failed to delete recurring slot: ${error}`);
    }
};
exports.deleteRecurringSlot = deleteRecurringSlot;
