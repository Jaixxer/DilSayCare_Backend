export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday to Saturday

export interface CreateTimeSlotDto {
    daysOfWeek: DayOfWeek[];
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
}

export interface UpdateSlotDto {
    slotId: string;
    date: string;      // YYYY-MM-DD format
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
}

export interface DeleteSlotDto {
    slotId: string;
    date: string;      // YYYY-MM-DD format
}

export interface GetWeeklySlotsDto {
    startDate: string; // YYYY-MM-DD format
    endDate: string;   // YYYY-MM-DD format
}
