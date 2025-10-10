"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecurringSlot = exports.deleteSlot = exports.updateSlot = exports.getWeeklySlots = exports.createSlots = void 0;
const slotsService = __importStar(require("../services/slots.service"));
const createSlots = async (req, res) => {
    try {
        const { daysOfWeek, startTime, endTime } = req.body;
        if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
            return res.status(400).json({ message: 'Missing or invalid required field: daysOfWeek' });
        }
        if (typeof startTime !== 'string' || typeof endTime !== 'string') {
            return res.status(400).json({ message: 'Missing or invalid required fields: startTime, endTime' });
        }
        if (!startTime.trim() || !endTime.trim()) {
            return res.status(400).json({ message: 'startTime and endTime must be non-empty strings' });
        }
        const validDays = daysOfWeek.every(day => day >= 0 && day <= 6);
        if (!validDays) {
            return res.status(400).json({ message: 'daysOfWeek must contain values between 0 and 6' });
        }
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            return res.status(400).json({ message: 'startTime and endTime must be in HH:MM format' });
        }
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
    }
    catch (error) {
        console.error('Error creating slots:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createSlots = createSlots;
const getWeeklySlots = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required' });
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(400).json({ message: 'Dates must be in YYYY-MM-DD format' });
        }
        const slots = await slotsService.getWeeklySlots(startDate, endDate);
        return res.status(200).json({
            message: 'Weekly slots retrieved successfully',
            data: slots
        });
    }
    catch (error) {
        console.error('Error getting weekly slots:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getWeeklySlots = getWeeklySlots;
const updateSlot = async (req, res) => {
    try {
        const { slotId, date, startTime, endTime } = req.body;
        if (!slotId || !date || !startTime || !endTime) {
            return res.status(400).json({ message: 'slotId, date, startTime, and endTime are required' });
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ message: 'date must be in YYYY-MM-DD format' });
        }
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            return res.status(400).json({ message: 'startTime and endTime must be in HH:MM format' });
        }
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
    }
    catch (error) {
        console.error('Error updating slot:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateSlot = updateSlot;
const deleteSlot = async (req, res) => {
    try {
        const { slotId, date } = req.body;
        if (!slotId || !date) {
            return res.status(400).json({ message: 'slotId and date are required' });
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({ message: 'date must be in YYYY-MM-DD format' });
        }
        const exception = await slotsService.deleteSlot(slotId, date);
        return res.status(200).json({
            message: 'Slot deleted successfully',
            data: exception
        });
    }
    catch (error) {
        console.error('Error deleting slot:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteSlot = deleteSlot;
const deleteRecurringSlot = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Slot ID is required' });
        }
        await slotsService.deleteRecurringSlot(id);
        return res.status(200).json({
            message: 'Recurring slot deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting recurring slot:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteRecurringSlot = deleteRecurringSlot;
