const db = require('../config/db');

const CalendarEvent = {
    getByUserId: async (userId) => {
        try {
            console.log('Buscando eventos para usuario:', userId);
            const [rows] = await db.execute(`
                SELECT 
                    ce.id,
                    ce.user_id,
                    ce.title,
                    ce.day,
                    ce.month,
                    ce.year,
                    DATE_FORMAT(ce.time_from, '%H:%i') as timeFrom,
                    DATE_FORMAT(ce.time_to, '%H:%i') as timeTo,
                    ce.recipe_id as recipeId,
                    ce.created_at as createdAt
                FROM calendar_events ce
                WHERE ce.user_id = ? 
                ORDER BY ce.year, ce.month, ce.day, ce.time_from ASC`,
                [userId]
            );

            return rows;
        } catch (error) {
            console.error('Error en getByUserId:', error);
            throw error;
        }
    },

    create: async (userId, eventData) => {
        try {
            const { title, day, month, year, timeFrom, timeTo, recipeId } = eventData;

            if (!title || !day || !month || !year || !timeFrom || !timeTo) {
                throw new Error('Faltan campos requeridos');
            }

            const validatedData = {
                day: parseInt(day),
                month: parseInt(month),
                year: parseInt(year)
            };

            const formatTime = (time) => time.split(':').slice(0, 2).join(':');

            const [result] = await db.execute(
                `INSERT INTO calendar_events 
                (user_id, title, day, month, year, time_from, time_to, recipe_id) 
                VALUES (?, ?, ?, ?, ?, STR_TO_DATE(?, '%H:%i'), STR_TO_DATE(?, '%H:%i'), ?)`,
                [
                    userId, 
                    title, 
                    validatedData.day, 
                    validatedData.month, 
                    validatedData.year, 
                    formatTime(timeFrom), 
                    formatTime(timeTo), 
                    recipeId || null
                ]
            );

            return {
                id: result.insertId,
                userId,
                title,
                ...validatedData,
                timeFrom: formatTime(timeFrom),
                timeTo: formatTime(timeTo),
                recipeId
            };
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    },

    delete: async (eventId, userId) => {
        try {
            console.log('Eliminando evento:', { eventId, userId });
            const [result] = await db.execute(
                'DELETE FROM calendar_events WHERE id = ? AND user_id = ?',
                [eventId, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en delete:', error);
            throw error;
        }
    },

    getById: async (eventId, userId) => {
        try {
            console.log('Buscando evento:', { eventId, userId });

            const [rows] = await db.execute(`
                SELECT 
                    id,
                    user_id as userId,
                    title,
                    day,
                    month,
                    year,
                    TIME_FORMAT(time_from, '%H:%i') as timeFrom,
                    TIME_FORMAT(time_to, '%H:%i') as timeTo,
                    recipe_id as recipeId,
                    created_at as createdAt
                FROM calendar_events 
                WHERE id = ? AND user_id = ?
                LIMIT 1`,
                [parseInt(eventId), parseInt(userId)]
            );

            console.log('Resultado de la consulta:', rows);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error en getById:', error);
            throw error;
        }
    },

    update: async (eventId, userId, eventData) => {
        try {
            const { title, day, month, year, timeFrom, timeTo, recipeId } = eventData;
            
            const [result] = await db.execute(`
                UPDATE calendar_events 
                SET 
                    title = ?,
                    day = ?,
                    month = ?,
                    year = ?,
                    time_from = TIME_FORMAT(?, '%H:%i'),
                    time_to = TIME_FORMAT(?, '%H:%i'),
                    recipe_id = ?
                WHERE id = ? AND user_id = ?`,
                [
                    title,
                    parseInt(day),
                    parseInt(month),
                    parseInt(year),
                    timeFrom,
                    timeTo,
                    recipeId || null,
                    parseInt(eventId),
                    parseInt(userId)
                ]
            );

            if (result.affectedRows === 0) {
                return null;
            }

            return {
                id: parseInt(eventId),
                userId: parseInt(userId),
                title,
                day: parseInt(day),
                month: parseInt(month),
                year: parseInt(year),
                timeFrom,
                timeTo,
                recipeId: recipeId || null
            };
        } catch (error) {
            console.error('Error en update:', error);
            throw error;
        }
    }
};

module.exports = CalendarEvent; 