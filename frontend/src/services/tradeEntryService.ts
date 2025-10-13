import { supabase } from '../supabaseClient';
import { TradeEntry } from '../types/trading';

const ENTRIES_TABLE = 'trade_entries';

export const getEntriesForJournal = async (journalId: string): Promise<TradeEntry[]> => {
  if (!journalId) return [];
  try {
    const { data, error } = await supabase.from(ENTRIES_TABLE).select('*').eq('journal_id', journalId).order('operationNumber', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching trade entries:', error);
    return [];
  }
};

export const createEntryInDb = async (journalId: string, entry: Omit<TradeEntry, 'id'>): Promise<TradeEntry | null> => {
  if (!journalId) return null;
  try {
    const { data, error } = await supabase.from(ENTRIES_TABLE).insert([{ ...entry, journal_id: journalId }]).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating trade entry:', error);
    return null;
  }
};

export const updateEntryInDb = async (entryId: string, updates: Partial<TradeEntry>): Promise<TradeEntry | null> => {
  try {
    const { data, error } = await supabase.from(ENTRIES_TABLE).update(updates).eq('id', entryId).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating trade entry:', error);
    return null;
  }
};

export const deleteEntryInDb = async (entryId: string): Promise<void> => {
  try {
    const { error } = await supabase.from(ENTRIES_TABLE).delete().eq('id', entryId);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting trade entry:', error);
  }
};