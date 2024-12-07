const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const authMiddleware = require('../middleware/AuthMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Logging middleware (opcional, para debugging)
router.use((req, res, next) => {
    console.log('Ruta de calendario accedida:', {
        method: req.method,
        path: req.path,
        userId: req.user?.id
    });
    next();
});

// Rutas
router.get('/events', calendarController.getRecipes);
router.get('/events/:eventId', calendarController.getEventById);
router.post('/events', calendarController.createEvent);
router.put('/events/:eventId', calendarController.updateEvent);
router.delete('/events/:eventId', authMiddleware, calendarController.deleteEvent);
router.post('/events/:eventId/complete', calendarController.markEventAsCompleted);
router.post('/events/:eventId/checklist', calendarController.updateIngredientChecklist);

module.exports = router; 