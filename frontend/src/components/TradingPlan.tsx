import React, { useState } from 'react';
import { TradingPlan as TradingPlanType, MOTIVATIONAL_PHRASES } from '../types/trading';
import { 
  CheckCircle2, 
  Circle, 
  RotateCcw, 
  ChevronDown, 
  ChevronRight,
  Target,
  Brain,
  TrendingUp,
  Play,
  BookOpen,
  AlertTriangle,
  Quote,
  Plus,
  X,
  Edit3
} from 'lucide-react';

interface TradingPlanProps {
  tradingPlan: TradingPlanType;
  onToggleItem: (itemId: string) => void;
  onResetChecklist: () => void;
  planPoints: string[];
  onAddPlanPoint: () => void;
  onUpdatePlanPoint: (index: number, value: string) => void;
  onDeletePlanPoint: (index: number) => void;
}

export function TradingPlan({ 
  tradingPlan, 
  onToggleItem, 
  onResetChecklist,
  planPoints,
  onAddPlanPoint,
  onUpdatePlanPoint,
  onDeletePlanPoint
}: TradingPlanProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Preparación Física', 'Preparación Mental'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Agrupar items por categoría
  const groupedItems = tradingPlan.checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof tradingPlan.checklist>);

  // Iconos por categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Preparación Física': return <Target className="h-5 w-5" />;
      case 'Preparación Mental': return <Brain className="h-5 w-5" />;
      case 'Análisis': 
      case 'Análisis General':
      case 'Análisis Micro': return <TrendingUp className="h-5 w-5" />;
      case 'Ejecución': return <Play className="h-5 w-5" />;
      case 'Parámetros de Entrada': return <AlertTriangle className="h-5 w-5" />;
      case 'Registro': return <BookOpen className="h-5 w-5" />;
      default: return <CheckCircle2 className="h-5 w-5" />;
    }
  };

  // Calcular progreso por categoría
  const getCategoryProgress = (category: string) => {
    const items = groupedItems[category] || [];
    const completed = items.filter(item => item.completed).length;
    return items.length > 0 ? (completed / items.length) * 100 : 0;
  };

  // Progreso total
  const totalProgress = tradingPlan.checklist.length > 0 
    ? (tradingPlan.checklist.filter(item => item.completed).length / tradingPlan.checklist.length) * 100 
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gold-300">PLAN DE TRADING VOL 75</h1>
          <button
            onClick={onResetChecklist}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reiniciar Día</span>
          </button>
        </div>
        
        {/* Progreso global */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Progreso del día</span>
            <span className="text-sm font-medium text-gold-300">{totalProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-gold-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            ></div>
          </div>
        </div>

        <p className="text-sm text-gray-400">
          Última actualización: {new Date(tradingPlan.lastUpdated).toLocaleString()}
        </p>
      </div>

      {/* Plan de Trading Editable */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center">
          <Edit3 className="h-6 w-6 mr-2" />
          📋 Plan de Trading Personalizado
        </h2>
        
        <div className="space-y-4">
          {planPoints.map((point, index) => (
            <div key={index} className="flex items-start gap-3 group">
              {/* Número del punto */}
              <span className="text-yellow-400 font-semibold mt-2 min-w-[24px]">
                {index + 1}.
              </span>
              
              {/* Campo editable */}
              <textarea
                value={point}
                onChange={(e) => onUpdatePlanPoint(index, e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white resize-none focus:border-yellow-400 focus:outline-none transition-colors"
                rows={point.length > 80 ? 3 : 2}
                placeholder="Escribe tu punto del plan..."
              />
              
              {/* Botón eliminar */}
              <button
                onClick={() => onDeletePlanPoint(index)}
                className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2"
                title="Eliminar punto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          
          {/* Botón agregar punto */}
          <div className="pt-4">
            <button
              onClick={onAddPlanPoint}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              Agregar Punto
            </button>
          </div>
        </div>
      </div>

      {/* Frases Motivacionales */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gold-300 mb-3 flex items-center">
          <Quote className="h-5 w-5 mr-2" />
          Frases Motivacionales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOTIVATIONAL_PHRASES.map((phrase, index) => (
            <div key={index} className="bg-gray-800/50 p-3 rounded-lg border-l-4 border-gold-400">
              <p className="text-sm text-gray-200 italic">{phrase}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist por secciones */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([category, items]) => {
          const isExpanded = expandedSections.has(category);
          const progress = getCategoryProgress(category);
          
          return (
            <div key={category} className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
              {/* Header de la sección */}
              <button
                onClick={() => toggleSection(category)}
                className="w-full px-4 py-3 bg-gray-800/50 flex items-center justify-between hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-blue-400">
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="text-lg font-medium text-white">{category}</h3>
                  <span className="text-sm text-gray-400">
                    ({items.filter(item => item.completed).length}/{items.length})
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-gold-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Contenido de la sección */}
              {isExpanded && (
                <div className="p-4 space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800/30 transition-colors cursor-pointer"
                      onClick={() => onToggleItem(item.id)}
                    >
                      <button className="flex-shrink-0">
                        {item.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 hover:text-blue-400 transition-colors" />
                        )}
                      </button>
                      <span 
                        className={`text-sm ${
                          item.completed 
                            ? 'text-gray-400 line-through' 
                            : 'text-gray-200'
                        } transition-colors`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tipos de Entrada */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gold-300 mb-4">TIPOS DE ENTRADA VOL75</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entrada Anticipada de Reversión */}
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-400 mb-3">ENTRADA ANTICIPADA DE REVERSIÓN</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• No requiere cambio estructura</li>
              <li>• Requiere triple divergencia en 1m o simple en 5M</li>
              <li>• Esperar cruce de signal con MACD en 5m</li>
              <li>• Giro de 3 velas, envolvente, martillo o gatillo perfecto</li>
              <li>• <span className="text-yellow-400">Riesgo medio</span></li>
              <li>• TP1 debe dar mínimo 1:2</li>
            </ul>
          </div>

          {/* Entrada Anticipada de Continuación */}
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-medium text-green-400 mb-3">ENTRADA ANTICIPADA DE CONTINUACIÓN</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• No requiere cambio estructura</li>
              <li>• Requiere divergencia simple de 1m o más</li>
              <li>• Esperar cruce de signal con MACD en 5m</li>
              <li>• Giro de 3 velas, envolvente, martillo o gatillo perfecto</li>
              <li>• <span className="text-yellow-400">Riesgo medio</span></li>
              <li>• TP1 debe dar mínimo 1:2</li>
            </ul>
          </div>
        </div>

        {/* Cambio de Estructura */}
        <div className="mt-4 bg-gray-800/50 p-4 rounded-lg">
          <h4 className="font-medium text-red-400 mb-3">CAMBIO DE ESTRUCTURA</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Requiere cambio estructura en 5M</li>
            <li>• Requiere divergencia simple de 1m o congruencia</li>
            <li>• Esperar cruce de signal con MACD y reducción volumen bajista</li>
            <li>• Giro de 3 velas, envolvente, martillo o gatillo perfecto</li>
            <li>• <span className="text-red-400">Riesgo completo</span></li>
          </ul>
        </div>
      </div>

      {/* Gestión de Riesgo */}
      <div className="bg-gradient-to-r from-red-900/20 to-yellow-900/20 border border-red-700/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          GESTIÓN DE RIESGO
        </h3>
        <div className="text-sm text-gray-300 space-y-2">
          <p>• <strong className="text-red-400">Si drawdown alcanza -10 USD detener operativa</strong></p>
          <p>• Reevaluar gestión según balance restante</p>
          <p>• Riesgo variable según tipo de entrada</p>
          <p>• TP1 debe dar mínimo 1:2 para validar entrada</p>
        </div>
      </div>
    </div>
  );
}
