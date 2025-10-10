
import { Router } from 'express';
import * as slotsController from '../controllers/slotsController';

const router = Router();

// Create recurring slots
router.post('/create', slotsController.createSlots);

// Get weekly slots
router.get('/weekly', slotsController.getWeeklySlots);

// Update a specific slot (creates exception)
router.put('/update', slotsController.updateSlot);

// Delete a specific slot (creates exception)
router.delete('/delete', slotsController.deleteSlot);

// Delete entire recurring slot pattern
router.delete('/recurring/:id', slotsController.deleteRecurringSlot);

export default router;