// Tipos para el diario de trading

export interface TradeEntry {
  id: string;
  operationNumber?: number;
  fecha: string;
  hora: string;
  activo: string;
  razonEntrada: string;
  antes: TradeImage[]; // Campo de imagen
  durante: TradeImage[]; // Campo de imagen
  ratio: string;
  beneficio: string;
  seCumplioElPlan: boolean;
  leccion: string;
  emocionesAntes: string;
  emocionesDurante: string;
  emocionesDespues: string;
  entradasNoTomadas: TradeImage[]; // Campo de imagen
  queSucedioConEntradasNoTomadas: TradeImage[]; // Campo de imagen
  tipoOperacion: 'compra' | 'venta' | '';
  customFields?: { [key: string]: string };
}

export interface TradeImage {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
}

export interface TradingJournal {
  id: string;
  name: string;
  entries: TradeEntry[];
  customColumns: ColumnDefinition[];
  mt5Config: MT5Config;
}

export interface ColumnDefinition {
  id: string;
  key: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'time' | 'image' | 'select';
  options?: string[];
  visible: boolean;
  order: number;
}

export interface MT5Config {
  broker: string;        // Broker para Deriv
  accountNumber: string; // ID de acceso para Deriv
  serverName: string;
  password: string;
  apiToken?: string;     // Token de MetaAPI (REQUERIDO para conexión real MT5)
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  connected: boolean;
}

export interface MT5ConnectionData {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  connected: boolean;
  isReal: boolean;
  lastUpdate: string;
  accountNumber?: string;
  server?: string;
  currency?: string;
  method?: string;
}

export interface TradingPlanChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category: string;
}

export interface TradingPlan {
  checklist: TradingPlanChecklistItem[];
  lastUpdated: string;
}

export interface AppState {
  journals: TradingJournal[];
  activeJournalId: string;
  tradingPlan: TradingPlan;
}

// Configuración por defecto
export const DEFAULT_COLUMNS: ColumnDefinition[] = [
  { id: '1', key: 'fecha', name: 'table.date', type: 'date', visible: true, order: 1 },
  { id: '2', key: 'hora', name: 'table.time', type: 'time', visible: true, order: 2 },
  { id: '3', key: 'activo', name: 'table.asset', type: 'text', visible: true, order: 3 },
  { id: '4', key: 'razonEntrada', name: 'table.entryReason', type: 'text', visible: true, order: 4 },
  { id: '5', key: 'antes', name: 'table.before', type: 'image', visible: true, order: 5 },
  { id: '6', key: 'durante', name: 'table.during', type: 'image', visible: true, order: 6 },
  { id: '7', key: 'ratio', name: 'table.ratio', type: 'text', visible: true, order: 7 },
  { id: '8', key: 'beneficio', name: 'table.profit', type: 'text', visible: true, order: 8 },
  { id: '9', key: 'seCumplioElPlan', name: 'table.planFollowed', type: 'boolean', visible: true, order: 9 },
  { id: '10', key: 'leccion', name: 'table.lesson', type: 'text', visible: true, order: 10 },
  { id: '11', key: 'emocionesAntes', name: 'table.emotionsBefore', type: 'text', visible: true, order: 11 },
  { id: '12', key: 'emocionesDurante', name: 'table.emotionsDuring', type: 'text', visible: true, order: 12 },
  { id: '13', key: 'emocionesDespues', name: 'table.emotionsAfter', type: 'text', visible: true, order: 13 },
  { id: '14', key: 'entradasNoTomadas', name: 'table.entriesNotTaken', type: 'image', visible: true, order: 14 },
  { id: '15', key: 'queSucedioConEntradasNoTomadas', name: 'table.whatHappenedWithEntries', type: 'image', visible: true, order: 15 },
  { id: '16', key: 'tipoOperacion', name: 'table.operationType', type: 'select', options: ['compra', 'venta'], visible: true, order: 16 },
];

export const DEFAULT_TRADING_PLAN: TradingPlan = {
  checklist: [
    // Paso 1: Preparación Física
    { id: '1', text: 'Ejercicio 15 minutos', completed: false, category: 'Preparación Física' },
    { id: '2', text: 'Baño y desayuno', completed: false, category: 'Preparación Física' },
    
    // Paso 2: Preparación Mental
    { id: '3', text: 'Meditación 10 minutos antes de prender computadora', completed: false, category: 'Preparación Mental' },
    { id: '4', text: 'Verificar que frases y mantra estén visibles y leerlos', completed: false, category: 'Preparación Mental' },
    { id: '5', text: 'Revisar estado emocional (NO OPERAR si mal genio/distraído)', completed: false, category: 'Preparación Mental' },
    { id: '6', text: 'No redes sociales, ni distractores hasta hacer la entrada', completed: false, category: 'Preparación Mental' },
    { id: '7', text: 'Música relajante', completed: false, category: 'Preparación Mental' },
    
    // Paso 3: Análisis
    { id: '8', text: 'Revisar entradas del día anterior con reflexión', completed: false, category: 'Análisis' },
    { id: '9', text: 'Identificar último ciclo del mercado (D y 4H)', completed: false, category: 'Análisis General' },
    { id: '10', text: 'Identificar tendencia o rango del último ciclo', completed: false, category: 'Análisis General' },
    { id: '11', text: 'Identificar order blocks con liquidez e imbalance', completed: false, category: 'Análisis General' },
    { id: '12', text: 'Identificar FVGs', completed: false, category: 'Análisis General' },
    { id: '13', text: 'Identificar líneas de tendencia', completed: false, category: 'Análisis General' },
    { id: '14', text: 'Buscar zonas de continuación (61.8% + confluencias)', completed: false, category: 'Análisis General' },
    { id: '15', text: 'Definir operaciones con proyección TradingView', completed: false, category: 'Análisis General' },
    { id: '16', text: 'Definir estructura micro (15m, 5m, 1m)', completed: false, category: 'Análisis Micro' },
    { id: '17', text: 'Definir zonas y OBs confluentes', completed: false, category: 'Análisis Micro' },
    { id: '18', text: 'Definir zonas de retrocesos', completed: false, category: 'Análisis Micro' },
    { id: '19', text: 'Marcar todo en gráfico', completed: false, category: 'Análisis Micro' },
    { id: '20', text: 'Poner alertas en las zonas', completed: false, category: 'Análisis Micro' },
    
    // Paso 4: Ejecución
    { id: '21', text: 'Laptop con gráfico 1m ampliado', completed: false, category: 'Ejecución' },
    { id: '22', text: 'TV con gráficos 5m y 15m', completed: false, category: 'Ejecución' },
    { id: '23', text: 'Total concentración cuando suene alerta', completed: false, category: 'Ejecución' },
    { id: '24', text: 'Repetir: "Asumo el riesgo, me desapego del resultado"', completed: false, category: 'Ejecución' },
    
    // Checklist de Parámetros
    { id: '25', text: '¿Alerta en zona predefinida?', completed: false, category: 'Parámetros de Entrada' },
    { id: '26', text: '¿Divergencia X confirmada?', completed: false, category: 'Parámetros de Entrada' },
    { id: '27', text: '¿Patrón de vela Y presente?', completed: false, category: 'Parámetros de Entrada' },
    { id: '28', text: '¿Condición Z del histograma MACD cumplida?', completed: false, category: 'Parámetros de Entrada' },
    
    // Paso 5: Registro
    { id: '29', text: 'Hacer registro de operaciones', completed: false, category: 'Registro' },
  ],
  lastUpdated: new Date().toISOString(),
};

export const MOTIVATIONAL_PHRASES = [
  '"¿PATRÓN? -> ¿Demasiado fácil? / ¿Miedo a fallar?"',
  '"¡ALTO! REVISA EL PLAN: ¿Cumple A, B, C?"',
  '"OBJETIVO: SUFICIENTE CERTEZA, NO PERFECCIÓN"',
  '"CONFÍO en mi análisis. EJECUTO mi plan"',
];
