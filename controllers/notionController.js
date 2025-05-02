import { getNotesFromNotion } from '../services/notionService.js';

export const getNotes = async (req, res) => {
  try {
    const notes = await getNotesFromNotion();
    res.json(notes);
  } catch (error) {
    res.status(500).json([]);
  }
};
