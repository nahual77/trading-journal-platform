import { supabase } from '../supabaseClient';
import { TradingJournal } from '../types/trading';

const JOURNALS_TABLE = 'journals';

export const getJournalsForUser = async (userId: string): Promise<TradingJournal[]> => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase.from(JOURNALS_TABLE).select('*').eq('user_id', userId);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching journals:', error);
    return [];
  }
};

export const createJournalInDb = async (userId: string, journal: Omit<TradingJournal, 'id' | 'entries'>): Promise<TradingJournal | null> => {
  if (!userId) return null;
  try {
    const { data, error } = await supabase.from(JOURNALS_TABLE).insert([{ ...journal, user_id: userId }]).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating journal:', error);
    return null;
  }
};

export const updateJournalNameInDb = async (journalId: string, name: string): Promise<void> => {
  try {
    const { error } = await supabase.from(JOURNALS_TABLE).update({ name }).eq('id', journalId);
    if (error) throw error;
  } catch (error) {
    console.error('Error updating journal name:', error);
  }
};

export const deleteJournalInDb = async (journalId: string): Promise<void> => {
  try {
    const { error } = await supabase.from(JOURNALS_TABLE).delete().eq('id', journalId);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting journal:', error);
  }
};

export const updateJournalDataInDb = async (journalId: string, updates: Partial<TradingJournal>): Promise<void> => {
  try {
    const { error } = await supabase.from(JOURNALS_TABLE).update(updates).eq('id', journalId);
    if (error) throw error;
  } catch (error) {
    console.error('Error updating journal data:', error);
  }
};