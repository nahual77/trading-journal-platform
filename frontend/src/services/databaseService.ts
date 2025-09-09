import { supabase } from '../components/supabaseClient';
import { 
  TradingJournal, 
  TradeEntry, 
  TradeImage, 
  ColumnDefinition, 
  MT5Config, 
  TradingPlan,
  AppState,
  DEFAULT_COLUMNS,
  DEFAULT_TRADING_PLAN
} from '../types/trading';

// =============================================
// SISTEMA DE CACHÉ PARA OPTIMIZACIÓN
// =============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class DatabaseCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 30000; // 30 segundos

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

const dbCache = new DatabaseCache();

// =============================================
// TIPOS PARA LA BASE DE DATOS
// =============================================

interface DatabaseJournal {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface DatabaseTradeEntry {
  id: string;
  journal_id: string;
  user_id: string;
  fecha: string;
  hora: string;
  razon_entrada: string | null;
  ratio: string | null;
  beneficio: string | null;
  leccion: string | null;
  emociones_antes: string | null;
  emociones_durante: string | null;
  emociones_despues: string | null;
  se_cumplio_plan: boolean;
  custom_fields: any;
  created_at: string;
  updated_at: string;
}

interface DatabaseTradeImage {
  id: string;
  trade_entry_id: string;
  user_id: string;
  name: string;
  url: string;
  thumbnail_url: string | null;
  image_type: 'antes' | 'durante' | 'entradas_no_tomadas' | 'que_sucedio_entradas' | 'screenshots';
  image_order: number;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

interface DatabaseColumn {
  id: string;
  journal_id: string;
  user_id: string;
  key: string;
  name: string;
  column_type: 'text' | 'number' | 'boolean' | 'date' | 'time' | 'image';
  visible: boolean;
  column_order: number;
  created_at: string;
  updated_at: string;
}

interface DatabaseMT5Config {
  id: string;
  journal_id: string;
  user_id: string;
  broker: string;
  account_number: string;
  server_name: string;
  password: string | null;
  api_token: string | null;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  connected: boolean;
  created_at: string;
  updated_at: string;
}

interface DatabaseTradingPlan {
  id: string;
  user_id: string;
  checklist: any;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

interface DatabaseUserPreferences {
  id: string;
  user_id: string;
  active_journal_id: string | null;
  theme: string;
  language: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// SERVICIO PRINCIPAL DE BASE DE DATOS
// =============================================

export class DatabaseService {
  private static instance: DatabaseService;
  
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // =============================================
  // MÉTODOS DE AUTENTICACIÓN
  // =============================================

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // =============================================
  // MÉTODOS PARA JOURNALS
  // =============================================

  async getJournals(): Promise<TradingJournal[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    try {
      console.log('🔄 Consultando trading_journals para usuario:', user.id);
      
      // Crear timeout de 8 segundos para esta consulta
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout en getJournals')), 8000)
      );
      
      const queryPromise = supabase
        .from('trading_journals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      const { data: journals, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.error('❌ Error en trading_journals:', error);
        return [];
      }

      if (!journals || journals.length === 0) {
        console.log('📝 No hay journals encontrados');
        return [];
      }

      console.log(`📊 Encontrados ${journals.length} journals, cargando datos...`);

      const tradingJournals: TradingJournal[] = [];

      // OPTIMIZACIÓN RADICAL: Cargar solo datos básicos primero, entradas después
      for (const journal of journals) {
        try {
          console.log(`🔄 Cargando journal básico: ${journal.name}`);
          
          // Cargar solo columnas y config MT5 (más rápido)
          const [columns, mt5Config] = await Promise.all([
            this.getJournalColumns(journal.id),
            this.getMT5Config(journal.id)
          ]);

          // Crear journal con entradas vacías inicialmente
          tradingJournals.push({
            id: journal.id,
            name: journal.name,
            entries: [], // Se cargarán después
            customColumns: columns,
            mt5Config: mt5Config || this.getDefaultMT5Config()
          });
          
          console.log(`✅ Journal ${journal.name} creado (entradas se cargarán después)`);
        } catch (journalError) {
          console.error(`❌ Error cargando journal ${journal.name}:`, journalError);
          // Continuar con los otros journals aunque uno falle
          tradingJournals.push({
            id: journal.id,
            name: journal.name,
            entries: [],
            customColumns: [],
            mt5Config: this.getDefaultMT5Config()
          });
        }
      }

      // TEMPORAL: No cargar entradas para evitar timeout
      console.log('⚠️ Carga de entradas desactivada temporalmente para evitar timeout');
      console.log('📝 Las entradas se cargarán cuando el usuario acceda a cada journal');
      
      // TODO: Implementar carga lazy de entradas por journal individual

      return tradingJournals;
    } catch (err) {
      console.error('❌ Error general en getJournals:', err);
      // En caso de error, retornar array vacío para que la app no se rompa
      return [];
    }
  }

  async createJournal(name: string): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('trading_journals')
      .insert({
        user_id: user.id,
        name,
        is_active: false
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async updateJournalName(journalId: string, name: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('trading_journals')
      .update({ name })
      .eq('id', journalId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async deleteJournal(journalId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('trading_journals')
      .delete()
      .eq('id', journalId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async setActiveJournal(journalId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Desactivar todos los journals del usuario
    await supabase
      .from('trading_journals')
      .update({ is_active: false })
      .eq('user_id', user.id);

    // Activar el journal seleccionado
    const { error } = await supabase
      .from('trading_journals')
      .update({ is_active: true })
      .eq('id', journalId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // =============================================
  // MÉTODOS PARA TRADE ENTRIES
  // =============================================

  async getTradeEntries(journalId: string): Promise<TradeEntry[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    try {
      console.log('🔄 Consultando base de datos para journal:', journalId);
      
      // Crear timeout de 8 segundos para esta consulta
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout en getTradeEntries')), 8000)
      );
      
      const queryPromise = supabase
        .from('trade_entries')
        .select('*')
        .eq('journal_id', journalId)
        .eq('user_id', user.id)
        .order('fecha', { ascending: false })
        .order('hora', { ascending: false });
      
      const { data: entries, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) throw error;

    const tradeEntries: TradeEntry[] = [];

    // OPTIMIZACIÓN: Cargar imágenes en paralelo con timeout individual
    for (const entry of entries || []) {
      try {
        const imageTimeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout cargando imágenes para entry ${entry.id}`)), 3000)
        );
        
        const imagesPromise = this.getTradeImages(entry.id);
        const images = await Promise.race([imagesPromise, imageTimeoutPromise]) as any;
        
        tradeEntries.push({
          id: entry.id,
          fecha: entry.fecha,
          hora: entry.hora,
          activo: entry.activo || '',
          razonEntrada: entry.razon_entrada || '',
          antes: images.filter(img => img.image_type === 'antes').map(this.mapDatabaseImageToTradeImage),
          durante: images.filter(img => img.image_type === 'durante').map(this.mapDatabaseImageToTradeImage),
          ratio: entry.ratio || '',
          beneficio: entry.beneficio || '',
          seCumplioElPlan: entry.se_cumplio_plan,
          leccion: entry.leccion || '',
          emocionesAntes: entry.emociones_antes || '',
          emocionesDurante: entry.emociones_durante || '',
          emocionesDespues: entry.emociones_despues || '',
          entradasNoTomadas: images.filter(img => img.image_type === 'entradas_no_tomadas').map(this.mapDatabaseImageToTradeImage),
          queSucedioConEntradasNoTomadas: images.filter(img => img.image_type === 'que_sucedio_entradas').map(this.mapDatabaseImageToTradeImage),
          screenshots: images.filter(img => img.image_type === 'screenshots').map(this.mapDatabaseImageToTradeImage),
          tipoOperacion: entry.tipo_operacion || '',
          customFields: entry.custom_fields || {}
        });
        
        console.log(`✅ Entry ${entry.id} cargado con ${images.length} imágenes`);
      } catch (imageError) {
        console.error(`❌ Error cargando imágenes para entry ${entry.id}:`, imageError);
        // Continuar con la entrada aunque las imágenes fallen
        tradeEntries.push({
          id: entry.id,
          fecha: entry.fecha,
          hora: entry.hora,
          activo: entry.activo || '',
          razonEntrada: entry.razon_entrada || '',
          antes: [],
          durante: [],
          ratio: entry.ratio || '',
          beneficio: entry.beneficio || '',
          seCumplioElPlan: entry.se_cumplio_plan,
          leccion: entry.leccion || '',
          emocionesAntes: entry.emociones_antes || '',
          emocionesDurante: entry.emociones_durante || '',
          emocionesDespues: entry.emociones_despues || '',
          entradasNoTomadas: [],
          queSucedioConEntradasNoTomadas: [],
          screenshots: [],
          tipoOperacion: entry.tipo_operacion || '',
          customFields: entry.custom_fields || {}
        });
      }
    }

      // OPTIMIZACIÓN: Guardar en caché (temporalmente desactivado para debug)
      // dbCache.set(cacheKey, tradeEntries, 30000); // 30 segundos
      // console.log('💾 Datos guardados en caché para journal:', journalId);

      console.log(`✅ getTradeEntries completado para journal ${journalId}: ${tradeEntries.length} entradas`);
      return tradeEntries;
    } catch (err) {
      console.error('❌ Error en getTradeEntries:', err);
      // En caso de error, retornar array vacío para que la app no se rompa
      return [];
    }
  }

  async createTradeEntry(journalId: string): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const today = new Date();
    
    const { data, error } = await supabase
      .from('trade_entries')
      .insert({
        journal_id: journalId,
        user_id: user.id,
        fecha: today.toISOString().split('T')[0],
        hora: today.toTimeString().split(' ')[0].substring(0, 5),
        razon_entrada: '',
        ratio: '',
        beneficio: '',
        se_cumplio_plan: false,
        leccion: '',
        emociones_antes: '',
        emociones_durante: '',
        emociones_despues: '',
        custom_fields: {}
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async updateTradeEntry(entryId: string, updates: Partial<TradeEntry>): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const dbUpdates: any = {};

    // Mapear campos de TradeEntry a campos de base de datos
    if (updates.fecha !== undefined) dbUpdates.fecha = updates.fecha;
    if (updates.hora !== undefined) dbUpdates.hora = updates.hora;
    if (updates.razonEntrada !== undefined) dbUpdates.razon_entrada = updates.razonEntrada;
    if (updates.ratio !== undefined) dbUpdates.ratio = updates.ratio;
    if (updates.beneficio !== undefined) dbUpdates.beneficio = updates.beneficio;
    if (updates.seCumplioElPlan !== undefined) dbUpdates.se_cumplio_plan = updates.seCumplioElPlan;
    if (updates.leccion !== undefined) dbUpdates.leccion = updates.leccion;
    if (updates.emocionesAntes !== undefined) dbUpdates.emociones_antes = updates.emocionesAntes;
    if (updates.emocionesDurante !== undefined) dbUpdates.emociones_durante = updates.emocionesDurante;
    if (updates.emocionesDespues !== undefined) dbUpdates.emociones_despues = updates.emocionesDespues;
    if (updates.customFields !== undefined) dbUpdates.custom_fields = updates.customFields;

    const { error } = await supabase
      .from('trade_entries')
      .update(dbUpdates)
      .eq('id', entryId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Actualizar imágenes si se proporcionaron
    if (updates.antes !== undefined) await this.updateTradeImages(entryId, 'antes', updates.antes);
    if (updates.durante !== undefined) await this.updateTradeImages(entryId, 'durante', updates.durante);
    if (updates.entradasNoTomadas !== undefined) await this.updateTradeImages(entryId, 'entradas_no_tomadas', updates.entradasNoTomadas);
    if (updates.queSucedioConEntradasNoTomadas !== undefined) await this.updateTradeImages(entryId, 'que_sucedio_entradas', updates.queSucedioConEntradasNoTomadas);
    if (updates.screenshots !== undefined) await this.updateTradeImages(entryId, 'screenshots', updates.screenshots);

    // OPTIMIZACIÓN: Invalidar caché después de actualizar
    dbCache.invalidate(`trade_entries_${user.id}`);
    console.log('🗑️ Caché invalidado después de actualizar entrada:', entryId);
  }

  async deleteTradeEntry(entryId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('trade_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // =============================================
  // MÉTODOS PARA IMÁGENES
  // =============================================

  async getTradeImages(entryId: string): Promise<DatabaseTradeImage[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    try {
      console.log('🖼️ Consultando imágenes para entry:', entryId);
      
      // Crear timeout de 3 segundos para esta consulta
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout en getTradeImages')), 3000)
      );
      
      const queryPromise = supabase
        .from('trade_images')
        .select('*')
        .eq('trade_entry_id', entryId)
        .eq('user_id', user.id)
        .order('image_type')
        .order('image_order');
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.error('❌ Error en trade_images:', error);
        return [];
      }

      console.log(`✅ ${data?.length || 0} imágenes cargadas para entry ${entryId}`);
      return data || [];
    } catch (err) {
      console.error('❌ Error general en getTradeImages:', err);
      return [];
    }
  }

  async addTradeImage(entryId: string, image: TradeImage, imageType: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('trade_images')
      .insert({
        trade_entry_id: entryId,
        user_id: user.id,
        name: image.name,
        url: image.url,
        thumbnail_url: image.thumbnail,
        image_type: imageType,
        image_order: 1
      });

    if (error) throw error;
  }

  async updateTradeImages(entryId: string, imageType: string, images: TradeImage[]): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Eliminar imágenes existentes de este tipo
    await supabase
      .from('trade_images')
      .delete()
      .eq('trade_entry_id', entryId)
      .eq('user_id', user.id)
      .eq('image_type', imageType);

    // Insertar nuevas imágenes
    if (images.length > 0) {
      const imageInserts = images.map((image, index) => ({
        trade_entry_id: entryId,
        user_id: user.id,
        name: image.name,
        url: image.url,
        thumbnail_url: image.thumbnail,
        image_type: imageType,
        image_order: index + 1
      }));

      const { error } = await supabase
        .from('trade_images')
        .insert(imageInserts);

      if (error) throw error;
    }
  }

  async removeTradeImage(imageId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('trade_images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // =============================================
  // MÉTODOS PARA COLUMNAS
  // =============================================

  async getJournalColumns(journalId: string): Promise<ColumnDefinition[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('journal_columns')
      .select('*')
      .eq('journal_id', journalId)
      .eq('user_id', user.id)
      .order('column_order');

    if (error) throw error;

    return (data || []).map(col => ({
      id: col.id,
      key: col.key,
      name: col.name,
      type: col.column_type,
      visible: col.visible,
      order: col.column_order
    }));
  }

  async addCustomColumn(journalId: string, column: Omit<ColumnDefinition, 'id' | 'order'>): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Obtener el siguiente orden
    const { data: lastColumn } = await supabase
      .from('journal_columns')
      .select('column_order')
      .eq('journal_id', journalId)
      .eq('user_id', user.id)
      .order('column_order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (lastColumn?.column_order || 0) + 1;

    const { error } = await supabase
      .from('journal_columns')
      .insert({
        journal_id: journalId,
        user_id: user.id,
        key: column.key,
        name: column.name,
        column_type: column.type,
        visible: column.visible,
        column_order: nextOrder
      });

    if (error) throw error;
  }

  async updateColumn(columnId: string, updates: Partial<ColumnDefinition>): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const dbUpdates: any = {};
    if (updates.key !== undefined) dbUpdates.key = updates.key;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.type !== undefined) dbUpdates.column_type = updates.type;
    if (updates.visible !== undefined) dbUpdates.visible = updates.visible;
    if (updates.order !== undefined) dbUpdates.column_order = updates.order;

    const { error } = await supabase
      .from('journal_columns')
      .update(dbUpdates)
      .eq('id', columnId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async removeColumn(columnId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('journal_columns')
      .delete()
      .eq('id', columnId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // =============================================
  // MÉTODOS PARA MT5 CONFIG
  // =============================================

  async getMT5Config(journalId: string): Promise<MT5Config | null> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('mt5_configs')
      .select('*')
      .eq('journal_id', journalId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    if (!data) return null;

    return {
      broker: data.broker,
      accountNumber: data.account_number,
      serverName: data.server_name,
      password: data.password || '',
      apiToken: data.api_token || '',
      balance: data.balance,
      equity: data.equity,
      margin: data.margin,
      freeMargin: data.free_margin,
      connected: data.connected
    };
  }

  async updateMT5Config(journalId: string, config: Partial<MT5Config>): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const dbUpdates: any = {};
    if (config.broker !== undefined) dbUpdates.broker = config.broker;
    if (config.accountNumber !== undefined) dbUpdates.account_number = config.accountNumber;
    if (config.serverName !== undefined) dbUpdates.server_name = config.serverName;
    if (config.password !== undefined) dbUpdates.password = config.password;
    if (config.apiToken !== undefined) dbUpdates.api_token = config.apiToken;
    if (config.balance !== undefined) dbUpdates.balance = config.balance;
    if (config.equity !== undefined) dbUpdates.equity = config.equity;
    if (config.margin !== undefined) dbUpdates.margin = config.margin;
    if (config.freeMargin !== undefined) dbUpdates.free_margin = config.freeMargin;
    if (config.connected !== undefined) dbUpdates.connected = config.connected;

    const { error } = await supabase
      .from('mt5_configs')
      .update(dbUpdates)
      .eq('journal_id', journalId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // =============================================
  // MÉTODOS PARA TRADING PLAN
  // =============================================

  async getTradingPlan(): Promise<TradingPlan> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    try {
      console.log('🔄 Consultando trading_plans para usuario:', user.id);
      
      const { data, error } = await supabase
        .from('trading_plans')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Usar maybeSingle en lugar de single

      if (error) {
        console.error('❌ Error en trading_plans:', error);
        // Si hay error, retornar el plan por defecto
        return DEFAULT_TRADING_PLAN;
      }

      if (!data) {
        console.log('📝 No hay trading plan, usando por defecto');
        return DEFAULT_TRADING_PLAN;
      }

      console.log('✅ Trading plan encontrado:', data);
      return {
        checklist: data.checklist || DEFAULT_TRADING_PLAN.checklist,
        lastUpdated: data.last_updated
      };
    } catch (err) {
      console.error('❌ Error general en getTradingPlan:', err);
      return DEFAULT_TRADING_PLAN;
    }
  }

  async updateTradingPlan(plan: Partial<TradingPlan>): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const dbUpdates: any = {
      last_updated: new Date().toISOString()
    };

    if (plan.checklist !== undefined) dbUpdates.checklist = plan.checklist;

    // Intentar actualizar primero
    const { error: updateError } = await supabase
      .from('trading_plans')
      .update(dbUpdates)
      .eq('user_id', user.id);

    // Si no existe, crear uno nuevo
    if (updateError && updateError.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from('trading_plans')
        .insert({
          user_id: user.id,
          checklist: plan.checklist || DEFAULT_TRADING_PLAN.checklist,
          last_updated: new Date().toISOString()
        });

      if (insertError) throw insertError;
    } else if (updateError) {
      throw updateError;
    }
  }

  // =============================================
  // MÉTODOS PARA PREFERENCIAS DE USUARIO
  // =============================================

  async getUserPreferences(): Promise<{ activeJournalId: string | null; initialBalances?: Record<string, number> }> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    try {
      console.log('🔄 Consultando user_preferences para usuario:', user.id);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('active_journal_id, initial_balances')
        .eq('user_id', user.id)
        .maybeSingle(); // Usar maybeSingle en lugar de single

      if (error && error.code === 'PGRST116') {
        // No existe el registro, crear uno nuevo
        console.log('📝 Creando registro inicial de preferencias...');
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            active_journal_id: null,
            theme: 'dark',
            language: 'es',
            initial_balances: {}
          });

        if (insertError) {
          console.error('❌ Error creando preferencias iniciales:', insertError);
          // En caso de error, retornar valores por defecto
          return { activeJournalId: null, initialBalances: {} };
        }
        
        console.log('✅ Preferencias iniciales creadas correctamente');
        return { activeJournalId: null, initialBalances: {} };
      }
      
      if (error) {
        console.error('❌ Error en user_preferences:', error);
        // En caso de error, retornar valores por defecto
        return { activeJournalId: null, initialBalances: {} };
      }
      
      if (!data) {
        console.log('📝 No hay preferencias, usando por defecto');
        return { activeJournalId: null, initialBalances: {} };
      }

      return { 
        activeJournalId: data.active_journal_id,
        initialBalances: data.initial_balances || {}
      };
    } catch (err) {
      console.error('❌ Error general en getUserPreferences:', err);
      return { activeJournalId: null, initialBalances: {} };
    }
  }

  async updateUserPreferences(preferences: { activeJournalId?: string; initialBalances?: Record<string, number> }): Promise<void> {
    console.log('🔄 updateUserPreferences llamado:', preferences);
    
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const dbUpdates: any = {};
    if (preferences.activeJournalId !== undefined) dbUpdates.active_journal_id = preferences.activeJournalId;
    if (preferences.initialBalances !== undefined) dbUpdates.initial_balances = preferences.initialBalances;
    
    console.log('📝 Updates a aplicar:', dbUpdates);

    // Intentar actualizar primero
    const { error: updateError } = await supabase
      .from('user_preferences')
      .update(dbUpdates)
      .eq('user_id', user.id);

    // Si no existe, crear uno nuevo
    if (updateError && updateError.code === 'PGRST116') {
      console.log('📝 Creando nuevo registro de preferencias...');
      const { error: insertError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          active_journal_id: preferences.activeJournalId || null,
          theme: 'dark',
          language: 'es',
          initial_balances: preferences.initialBalances || {}
        });

      if (insertError) {
        console.error('❌ Error creando preferencias:', insertError);
        throw insertError;
      }
      console.log('✅ Preferencias creadas correctamente');
    } else if (updateError) {
      console.error('❌ Error actualizando preferencias:', updateError);
      throw updateError;
    } else {
      console.log('✅ Preferencias actualizadas correctamente');
    }
  }

  // =============================================
  // MÉTODOS DE UTILIDAD
  // =============================================

  private mapDatabaseImageToTradeImage(dbImage: DatabaseTradeImage): TradeImage {
    return {
      id: dbImage.id,
      name: dbImage.name,
      url: dbImage.url,
      thumbnail: dbImage.thumbnail_url || dbImage.url
    };
  }

  private getDefaultMT5Config(): MT5Config {
    return {
      broker: 'Deriv (SVG) LLC',
      accountNumber: '',
      serverName: 'DerivSVG-Server-02',
      password: '',
      balance: 1000.00,
      equity: 1000.00,
      margin: 0.00,
      freeMargin: 1000.00,
      connected: false
    };
  }

  async updateInitialBalance(journalId: string, balance: number): Promise<void> {
    console.log('🔄 updateInitialBalance llamado:', { journalId, balance });
    
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Obtener balances actuales
    const preferences = await this.getUserPreferences();
    const currentBalances = preferences.initialBalances || {};
    
    console.log('📊 Balances actuales:', currentBalances);
    
    // Actualizar el balance específico
    const updatedBalances = {
      ...currentBalances,
      [journalId]: balance
    };

    console.log('📈 Balances actualizados:', updatedBalances);

    // Guardar en la base de datos
    await this.updateUserPreferences({ initialBalances: updatedBalances });
    console.log('✅ updateUserPreferences completado');
  }

  // =============================================
  // MÉTODOS DE MIGRACIÓN
  // =============================================

  async migrateFromLocalStorage(localData: AppState): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    try {
      // Verificar que localData.journals existe
      if (!localData.journals || !Array.isArray(localData.journals)) {
        console.log('⚠️ No hay journals en localStorage para migrar');
        return;
      }

      // Migrar journals
      for (const journal of localData.journals) {
        const journalId = await this.createJournal(journal.name);
        
        // Migrar columnas personalizadas
        for (const column of journal.customColumns) {
          if (!DEFAULT_COLUMNS.find(c => c.key === column.key)) {
            await this.addCustomColumn(journalId, {
              key: column.key,
              name: column.name,
              type: column.type,
              visible: column.visible
            });
          }
        }

        // Migrar entradas
        for (const entry of journal.entries) {
          const entryId = await this.createTradeEntry(journalId);
          await this.updateTradeEntry(entryId, entry);
        }

        // Migrar configuración MT5
        await this.updateMT5Config(journalId, journal.mt5Config);
      }

      // Migrar plan de trading
      await this.updateTradingPlan(localData.tradingPlan);

      // Establecer journal activo
      if (localData.activeJournalId) {
        await this.setActiveJournal(localData.activeJournalId);
      }

      console.log('Migración completada exitosamente');
    } catch (error) {
      console.error('Error durante la migración:', error);
      throw error;
    }
  }

  async exportAllData(): Promise<AppState> {
    const journals = await this.getJournals();
    const tradingPlan = await this.getTradingPlan();
    const preferences = await this.getUserPreferences();

    // Encontrar el journal activo
    const activeJournal = journals.find(j => j.id === preferences.activeJournalId) || journals[0];

    return {
      journals,
      activeJournalId: activeJournal?.id || '',
      tradingPlan
    };
  }
}

// Exportar instancia singleton
export const databaseService = DatabaseService.getInstance();
