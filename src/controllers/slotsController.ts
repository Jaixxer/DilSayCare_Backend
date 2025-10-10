import { Request, Response } from 'express';
import { CreateTimeSlotDto, UpdateSlotDto, DeleteSlotDto, GetWeeklySlotsDto } from '../dtos/slots';
import * as slotsService from '../services/slots.service';

export const createSlots = async (req: Request, res: Response) => {
    try {
        const { daysOfWeek, startTime, endTime } = req.body as CreateTimeSlotDto;

        // Validate required fields
        if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
            return res.status(400).json({ message: 'Missing or invalid required field: daysOfWeek' });
        }

        if (typeof startTime !== 'string' || typeof endTime !== 'string') {
            return res.status(400).json({ message: 'Missing or invalid required fields: startTime, endTime' });
        }

        if (!startTime.trim() || !endTime.trim()) {
            return res.status(400).json({ message: 'startTime and endTime must be non-empty strings' });
        }

        // Validate day of week values
        const validDays = daysOfWeek.every(day => day >= 0 && day <= 6);
        if (!validDays) {
            return res.status(400).json({ message: 'daysOfWeek must contain values between 0 and 6' });
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            return res.status(400).json({ message: 'startTime and endTime must be in HH:MM format' });
        }

        // Validate that start time is before end time (convert to minutes for proper comparison)
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        
        if (startMinutes >= endMinutes) {
            return res.status(400).json({ message: 'startTime must be before endTime' });
        }

        const slots = await slotsService.createTimeSlot({ daysOfWeek, startTime, endTime });
        return res.status(201).json({
            message: 'Slots created successfully',
            data: slots
        });

    } catch (error) {
        console.error('Error creating slots:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getWeeklySlots = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query as Partial<GetWeeklySlotsDto>;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required' });
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(400).json({ message: 'Dates must be in YYYY-MM-DD format' });
        }

        const slots = await slotsService.getWeeklySlots(startDate, endDate);
        return res.status(200).json({
            message: 'Weekly slots retrieved successfully',
            data: slots
        });

    } catch (error) {
        console.error('Error getting weekly slots:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateSlot = async (req: Request, res: Response) => {
    try {
        const { slotId, date, startTime, endTime } = req.body as UpdateSlotDto;

        // Validate required fields
        if (!slotId || !date || !startTime || !endTime) {
            return res.status(400).json({ message: 'slotId, date, startTime, and endTime are required' });
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ message: 'date must be in YYYY-MM-DD format' });
        }

        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            return res.status(400).json({ message: 'startTime and endTime must be in HH:MM format' });
        }

        // Validate that start time is before end time (convert to minutes for proper comparison)
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        
        if (startMinutes >= endMinutes) {
            return res.status(400).json({ message: 'startTime must be before endTime' });
        }

        const exception = await slotsService.updateSlot(slotId, date, startTime, endTime);
        return res.status(200).json({
            message: 'Slot updated successfully',
            data: exception
        });

    } catch (error) {
        console.error('Error updating slot:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteSlot = async (req: Request, res: Response) => {
    try {
        const { slotId, date } = req.body as DeleteSlotDto;

        // Validate required fields
        if (!slotId || !date) {
            return res.status(400).json({ message: 'slotId and date are required' });
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ message: 'date must be in YYYY-MM-DD format' });
        }

        const exception = await slotsService.deleteSlot(slotId, date);
        return res.status(200).json({
            message: 'Slot deleted successfully',
            data: exception
        });

    } catch (error) {
        console.error('Error deleting slot:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteRecurringSlot = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Slot ID is required' });
        }

        await slotsService.deleteRecurringSlot(id);
        return res.status(200).json({
            message: 'Recurring slot deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting recurring slot:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
