import express from 'express';
import { getNotes } from '../controllers/notionController.js';

const router = express.Router();

// Rota para buscar notas do Notion
router.get('/notes', getNotes);

export default router;
