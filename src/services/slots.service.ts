import db from "../db/db";
import { CreateTimeSlotDto, DayOfWeek } from "../dtos/slots";

export interface RecurringSlot {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    created_at: Date;
    updated_at: Date;
}

export interface Exception {
    id: string;
    recurring_slot_id: string;
    date: string;
    type: 'deleted' | 'modified';
    new_start_time?: string;
    new_end_time?: string;
    created_at: Date;
    updated_at: Date;
}

export interface WeeklySlot {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    is_exception: boolean;
    recurring_slot_id?: string;
}

export const createTimeSlot = async (data: CreateTimeSlotDto): Promise<RecurringSlot[]> => {
    try {
        const { daysOfWeek, startTime, endTime } = data;
        const slots: RecurringSlot[] = [];

        for (const dayOfWeek of daysOfWeek) {
            const [slot] = await db('recurring_slots')
                .insert({
                    day_of_week: dayOfWeek,
                    start_time: startTime,
                    end_time: endTime
                })
                .returning('*');
            slots.push(slot);
        }

        return slots;
    } catch (error) {
        throw new Error(`Failed to create time slot: ${error}`);
    }
};

export const getWeeklySlots = async (startDate: string, endDate: string): Promise<WeeklySlot[]> => {
    try {
        const recurringSlots = await db('recurring_slots').select('*');

        const exceptions = await db('exceptions')
            .select('*', db.raw('date::text as date'))
            .whereBetween('date', [startDate, endDate]);
        
        console.log('Recurring Slots:', JSON.stringify(recurringSlots, null, 2));
        console.log('Exceptions:', JSON.stringify(exceptions, null, 2));
        console.log('Date range:', startDate, 'to', endDate);

        const weeklySlots: WeeklySlot[] = [];
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
                    } else if (exception.type === 'modified') {
                        const startTime = exception.new_start_time!.substring(0, 5);
                        const endTime = exception.new_end_time!.substring(0, 5);
                        weeklySlots.push({
                            id: exception.id,
                            date: dateStr,
                            start_time: startTime,
                            end_time: endTime,
                            is_exception: true,
                            recurring_slot_id: recurringSlot.id
                        });
                    }
                } else {
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
    } catch (error) {
        throw new Error(`Failed to get weekly slots: ${error}`);
    }
};

export const updateSlot = async (slotId: string, date: string, startTime: string, endTime: string): Promise<Exception> => {
    try {
        const existingException = await db('exceptions')
            .where({
                recurring_slot_id: slotId,
                date: date
            })
            .first();

        if (existingException) {
            const [updatedException] = await db('exceptions')
                .where('id', existingException.id)
                .update({
                    type: 'modified',
                    new_start_time: startTime,
                    new_end_time: endTime,
                    updated_at: new Date()
                })
                .returning('*');
            return updatedException;
        } else {
            const [newException] = await db('exceptions')
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
    } catch (error) {
        throw new Error(`Failed to update slot: ${error}`);
    }
};

export const deleteSlot = async (slotId: string, date: string): Promise<Exception> => {
    try {
        const existingException = await db('exceptions')
            .where({
                recurring_slot_id: slotId,
                date: date
            })
            .first();

        if (existingException) {
            const [updatedException] = await db('exceptions')
                .where('id', existingException.id)
                .update({
                    type: 'deleted',
                    new_start_time: null,
                    new_end_time: null,
                    updated_at: new Date()
                })
                .returning('*');
            return updatedException;
        } else {
            const [newException] = await db('exceptions')
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
    } catch (error) {
        throw new Error(`Failed to delete slot: ${error}`);
    }
};

export const deleteRecurringSlot = async (slotId: string): Promise<void> => {
    try {
        await db('recurring_slots').where('id', slotId).del();
    } catch (error) {
        throw new Error(`Failed to delete recurring slot: ${error}`);
    }
};
