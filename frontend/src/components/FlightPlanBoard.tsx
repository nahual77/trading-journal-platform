import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
  ReactFlowInstance,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeDragHandler,
  NodeMouseHandler,
  Handle,
  Position,
  MarkerType,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Play, 
  BarChart3, 
  HelpCircle, 
  Zap, 
  Image, 
  StickyNote,
  Plus,
  Save,
  Download,
  Upload,
  Trash2,
  Edit3,
  Check,
  X
} from 'lucide-react';

// Tipos de nodos personalizados
interface CustomNodeData {
  label: string;
  type: 'trigger' | 'analysis' | 'decision' | 'action' | 'image' | 'note';
  content?: string;
  imageUrl?: string;
  conditions?: string[];
}

// Componente de nodo personalizado
const CustomNode = ({ data, selected }: { data: CustomNodeData; selected: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(data.content || '');
  const [editLabel, setEditLabel] = useState(data.label);
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');
  const [showImageOptions, setShowImageOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getNodeStyle = () => {
    const baseStyle = "px-4 py-3 rounded-lg border-2 transition-all duration-200 group";
    
    // Ajustar tamaño según el tipo de nodo
    let sizeStyle = "min-w-[200px] max-w-[300px]";
    if (data.type === 'image' && data.imageUrl) {
      sizeStyle = "min-w-[200px] max-w-[400px]"; // Más ancho para imágenes
    }
    
    if (selected) {
      return `${baseStyle} ${sizeStyle} shadow-lg shadow-blue-500/50 border-blue-400`;
    }

    switch (data.type) {
      case 'trigger':
        return `${baseStyle} ${sizeStyle} bg-blue-900/50 border-blue-500 hover:border-blue-400`;
      case 'analysis':
        return `${baseStyle} ${sizeStyle} bg-green-900/50 border-green-500 hover:border-green-400`;
      case 'decision':
        return `${baseStyle} ${sizeStyle} bg-yellow-900/50 border-yellow-500 hover:border-yellow-400`;
      case 'action':
        return `${baseStyle} ${sizeStyle} bg-red-900/50 border-red-500 hover:border-red-400`;
      case 'image':
        return `${baseStyle} ${sizeStyle} bg-purple-900/50 border-purple-500 hover:border-purple-400`;
      case 'note':
        return `${baseStyle} ${sizeStyle} bg-gray-800/50 border-gray-500 hover:border-gray-400`;
      default:
        return `${baseStyle} ${sizeStyle} bg-gray-800/50 border-gray-500`;
    }
  };

  const getNodeIcon = () => {
    switch (data.type) {
      case 'trigger':
        return <Play className="h-4 w-4 text-blue-400" />;
      case 'analysis':
        return <BarChart3 className="h-4 w-4 text-green-400" />;
      case 'decision':
        return <HelpCircle className="h-4 w-4 text-yellow-400" />;
      case 'action':
        return <Zap className="h-4 w-4 text-red-400" />;
      case 'image':
        return <Image className="h-4 w-4 text-purple-400" />;
      case 'note':
        return <StickyNote className="h-4 w-4 text-gray-400" />;
      default:
        return <StickyNote className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleSave = () => {
    data.label = editLabel;
    data.content = editContent;
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditLabel(data.label);
    setEditContent(data.content || '');
    setImageUrl(data.imageUrl || '');
    setIsEditing(false);
  };

  // Funciones para manejo de imágenes
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
      data.imageUrl = result;
    };
    reader.readAsDataURL(file);
  };

  const handlePasteImage = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleImageUpload(file);
          setShowImageOptions(false); // Ocultar opciones después de pegar
        }
        break;
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    data.imageUrl = url;
  };

  return (
    <div 
      className={getNodeStyle()}
      onDoubleClick={() => setIsEditing(true)}
    >
      {/* Handle de entrada (arriba) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      />
      
      {/* Handle de salida (abajo) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      />

      {isEditing ? (
        <div 
          className="space-y-3"
          onPaste={data.type === 'image' ? handlePasteImage : undefined}
        >
          <input
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            className="w-full bg-gray-700 border border-blue-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            placeholder="Título del nodo"
            autoFocus
          />
          
          {data.type === 'image' ? (
            <div className="space-y-3">
              {/* Opciones de imagen */}
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                  >
                    📁 Cargar archivo
                  </button>
                  <button
                    onClick={() => setShowImageOptions(!showImageOptions)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs transition-colors"
                  >
                    🔗 URL
                  </button>
                </div>
                
                {showImageOptions && (
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="w-full bg-gray-700 border border-blue-500 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="Pega URL de imagen o Ctrl+V para pegar imagen"
                    onPaste={handlePasteImage}
                  />
                )}
                
                {/* Indicador de Ctrl+V */}
                {data.type === 'image' && !showImageOptions && (
                  <div className="text-xs text-gray-400 text-center py-1">
                    💡 También puedes usar <kbd className="bg-gray-600 px-1 rounded">Ctrl+V</kbd> para pegar imagen
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              {/* Vista previa de imagen */}
              {imageUrl && (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full max-h-32 object-contain rounded border border-gray-600"
                    onError={() => setImageUrl('')}
                  />
                  <button
                    onClick={() => handleImageUrlChange('')}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-gray-700 border border-blue-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                placeholder="Descripción de la imagen (opcional)"
                rows={2}
              />
            </div>
          ) : (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-gray-700 border border-blue-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
              placeholder="Contenido del nodo"
              rows={3}
            />
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="p-1 text-green-400 hover:text-green-300"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-400 hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            {getNodeIcon()}
            <span className="font-semibold text-white text-sm">{data.label}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              title="Editar nodo"
            >
              <Edit3 className="h-3 w-3" />
            </button>
          </div>
          {data.type === 'image' && data.imageUrl ? (
            <div className="space-y-2">
              <div className="relative">
                <img
                  src={data.imageUrl}
                  alt={data.label}
                  className="w-full max-h-48 object-contain rounded border border-gray-600"
                  onError={() => {
                    // Si la imagen falla al cargar, la removemos
                    data.imageUrl = '';
                  }}
                />
              </div>
              {data.content && (
                <p className="text-gray-300 text-xs">{data.content}</p>
              )}
            </div>
          ) : (
            data.content && (
              <p className="text-gray-300 text-xs">{data.content}</p>
            )
          )}
        </div>
      )}
    </div>
  );
};

// Tipos de nodos para React Flow
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// Estilos personalizados para las conexiones
const connectionLineStyle = {
  strokeWidth: 2,
  stroke: '#3b82f6',
  strokeDasharray: '5 5',
};

const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: '#3b82f6' },
  type: 'smoothstep' as const,
  pathOptions: {
    borderRadius: 20,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#3b82f6',
  },
};

// Componente principal del tablero
const FlightPlanBoard = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<CustomNodeData['type']>('trigger');
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  
  // Estados para herramientas de dibujo
  const [drawingMode, setDrawingMode] = useState<'none' | 'line' | 'rectangle' | 'circle' | 'text'>('none');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingElements, setDrawingElements] = useState<Array<{
    id: string;
    type: 'line' | 'rectangle' | 'circle' | 'text';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    text?: string;
    color: string;
    selected?: boolean;
  }>>([]);
  const [currentElement, setCurrentElement] = useState<{
    id: string;
    type: 'line' | 'rectangle' | 'circle' | 'text';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    text?: string;
    color: string;
  } | null>(null);
  const [drawingColor, setDrawingColor] = useState('#3b82f6');
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);

  // Función para agregar un nuevo nodo
  const addNode = useCallback((type: CustomNodeData['type']) => {
    const newNode: Node<CustomNodeData> = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        type,
        label: `Nuevo ${type}`,
        content: '',
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Función para conectar nodos
  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Función para eliminar nodos seleccionados
  const deleteSelectedNodes = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
  }, [setNodes]);

  // Función para eliminar conexiones seleccionadas
  const deleteSelectedEdges = useCallback(() => {
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setEdges]);

  // Función para eliminar todo lo seleccionado (nodos y conexiones)
  const deleteSelected = useCallback(() => {
    deleteSelectedNodes();
    deleteSelectedEdges();
  }, [deleteSelectedNodes, deleteSelectedEdges]);

  // Función para guardar el tablero
  const saveBoard = useCallback(() => {
    const boardData = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem('flightPlanBoard', JSON.stringify(boardData));
    alert('Tablero guardado exitosamente');
  }, [nodes, edges]);

  // Función para cargar el tablero
  const loadBoard = useCallback(() => {
    const savedData = localStorage.getItem('flightPlanBoard');
    if (savedData) {
      const boardData = JSON.parse(savedData);
      setNodes(boardData.nodes || []);
      setEdges(boardData.edges || []);
      alert('Tablero cargado exitosamente');
    } else {
      alert('No hay tablero guardado');
    }
  }, [setNodes, setEdges]);

  // Función para limpiar el tablero
  const clearBoard = useCallback(() => {
    if (confirm('¿Estás seguro de que quieres limpiar todo el tablero?')) {
      setNodes([]);
      setEdges([]);
      setDrawingElements([]);
      localStorage.removeItem('flightPlanBoard');
      alert('Tablero limpiado');
    }
  }, [setNodes, setEdges]);

  // Función para cambiar modo de dibujo
  const changeDrawingMode = (newMode: 'none' | 'line' | 'rectangle' | 'circle' | 'text') => {
    console.log('Changing drawing mode from', drawingMode, 'to', newMode); // Debug
    // Cancelar dibujo actual si está en progreso
    if (isDrawing) {
      setCurrentElement(null);
      setIsDrawing(false);
    }
    setDrawingMode(newMode);
  };

  // Funciones para herramientas de dibujo
  const handleMouseDown = (event: React.MouseEvent) => {
    if (drawingMode === 'none' || !reactFlowInstance) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Convertir coordenadas del mouse a coordenadas del viewport de React Flow
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    
    console.log('Mouse down:', { drawingMode, position }); // Debug
    
    const newElement = {
      id: `draw-${Date.now()}`,
      type: drawingMode,
      x1: position.x,
      y1: position.y,
      x2: position.x,
      y2: position.y,
      text: drawingMode === 'text' ? 'Texto' : undefined,
      color: drawingColor
    };
    
    setCurrentElement(newElement);
    setIsDrawing(true);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDrawing || !currentElement || !reactFlowInstance) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Convertir coordenadas del mouse a coordenadas del viewport de React Flow
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    
    setCurrentElement({
      ...currentElement,
      x2: position.x,
      y2: position.y
    });
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (!isDrawing || !currentElement) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Mouse up:', currentElement); // Debug
    
    setDrawingElements(prev => [...prev, currentElement]);
    setCurrentElement(null);
    setIsDrawing(false);
    
    if (drawingMode === 'text') {
      const text = prompt('Ingresa el texto:');
      if (text) {
        setDrawingElements(prev => 
          prev.map(el => 
            el.id === currentElement.id 
              ? { ...el, text }
              : el
          )
        );
      }
    }
  };

  const clearDrawing = () => {
    setDrawingElements([]);
    setSelectedDrawingId(null);
  };

  // Función para seleccionar un dibujo
  const selectDrawing = (id: string) => {
    setSelectedDrawingId(id);
    setDrawingElements(prev => 
      prev.map(el => ({ ...el, selected: el.id === id }))
    );
  };

  // Función para deseleccionar todos los dibujos
  const deselectAllDrawings = () => {
    setSelectedDrawingId(null);
    setDrawingElements(prev => 
      prev.map(el => ({ ...el, selected: false }))
    );
  };

  // Función para eliminar dibujo seleccionado
  const deleteSelectedDrawing = () => {
    if (selectedDrawingId) {
      setDrawingElements(prev => prev.filter(el => el.id !== selectedDrawingId));
      setSelectedDrawingId(null);
    }
  };

  // Función para cambiar color del dibujo seleccionado
  const changeSelectedDrawingColor = (color: string) => {
    if (selectedDrawingId) {
      setDrawingElements(prev => 
        prev.map(el => 
          el.id === selectedDrawingId ? { ...el, color } : el
        )
      );
    }
  };

  // Cargar tablero al montar el componente
  React.useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Función para manejar teclas de eliminación y escape
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelected();
      } else if (event.key === 'Escape') {
        // Cancelar modo de dibujo
        if (drawingMode !== 'none') {
          changeDrawingMode('none');
        }
        // Cancelar dibujo en progreso
        if (isDrawing) {
          setCurrentElement(null);
          setIsDrawing(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [deleteSelected, drawingMode, isDrawing, changeDrawingMode]);

  return (
    <div className="h-full w-full bg-gray-900 relative">
      {/* Panel flotante izquierdo compacto */}
      <div className="absolute left-3 top-3 z-50 w-64">
        <div className="bg-black/40 backdrop-blur-md border border-gray-700/30 rounded-lg shadow-2xl p-4">
          {/* Título compacto */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-gold-400 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🛩️</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Plan de Vuelo</h2>
            </div>
          </div>

          {/* Sección de nodos compacta */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 mb-2 flex items-center">
              <Plus className="h-3 w-3 mr-1" />
              Nodos
            </h3>
            
            {/* Selector de tipo de nodo */}
            <select
              value={selectedNodeType}
              onChange={(e) => setSelectedNodeType(e.target.value as CustomNodeData['type'])}
              className="w-full bg-gray-900/60 border border-gray-600/40 rounded px-2 py-1.5 text-white text-xs mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="trigger">🔴 Entrada</option>
              <option value="analysis">📊 Análisis</option>
              <option value="decision">❓ Decisión</option>
              <option value="action">⚡ Acción</option>
              <option value="image">🖼️ Imagen</option>
              <option value="note">📝 Nota</option>
            </select>

            {/* Botón para agregar nodo */}
            <button
              onClick={() => addNode(selectedNodeType)}
              className="w-full flex items-center justify-center space-x-1 bg-blue-600/80 hover:bg-blue-600 text-white px-3 py-2 rounded text-xs transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <Plus className="h-3 w-3" />
              <span>Agregar</span>
            </button>
          </div>

          {/* Botones de acción compactos */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={saveBoard}
              className="flex items-center justify-center space-x-1 bg-green-600/80 hover:bg-green-600 text-white px-2 py-1.5 rounded text-xs transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25"
            >
              <Save className="h-3 w-3" />
              <span>Guardar</span>
            </button>
            
            <button
              onClick={loadBoard}
              className="flex items-center justify-center space-x-1 bg-blue-600/80 hover:bg-blue-600 text-white px-2 py-1.5 rounded text-xs transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <Upload className="h-3 w-3" />
              <span>Cargar</span>
            </button>
          </div>

          {/* Botones de eliminación compactos */}
          <div className="space-y-1 mb-4">
            <button
              onClick={deleteSelected}
              className="w-full flex items-center space-x-1 bg-red-600/80 hover:bg-red-600 text-white px-2 py-1.5 rounded text-xs transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25"
            >
              <Trash2 className="h-3 w-3" />
              <span>Eliminar</span>
            </button>

            <button
              onClick={deleteSelectedEdges}
              className="w-full flex items-center space-x-1 bg-purple-600/80 hover:bg-purple-600 text-white px-2 py-1.5 rounded text-xs transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <X className="h-3 w-3" />
              <span>Conexiones</span>
            </button>

            <button
              onClick={clearBoard}
              className="w-full flex items-center space-x-1 bg-orange-600/80 hover:bg-orange-600 text-white px-2 py-1.5 rounded text-xs transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25"
            >
              <X className="h-3 w-3" />
              <span>Limpiar</span>
            </button>
          </div>

          {/* Herramientas de dibujo */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-300 flex items-center space-x-1">
              <span>✏️</span>
              <span>Dibujo</span>
              {drawingMode !== 'none' && (
                <span className="text-green-400 text-xs">●</span>
              )}
            </h3>
            
            {/* Selector de color */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Color:</label>
              <div className="flex space-x-1">
                {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setDrawingColor(color)}
                    className={`w-6 h-6 rounded border-2 ${
                      drawingColor === color ? 'border-white' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => changeDrawingMode(drawingMode === 'line' ? 'none' : 'line')}
                className={`px-2 py-1.5 rounded text-xs transition-all duration-200 ${
                  drawingMode === 'line' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                📏 Línea
              </button>
              
              <button
                onClick={() => changeDrawingMode(drawingMode === 'rectangle' ? 'none' : 'rectangle')}
                className={`px-2 py-1.5 rounded text-xs transition-all duration-200 ${
                  drawingMode === 'rectangle' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                ⬜ Rectángulo
              </button>
              
              <button
                onClick={() => changeDrawingMode(drawingMode === 'circle' ? 'none' : 'circle')}
                className={`px-2 py-1.5 rounded text-xs transition-all duration-200 ${
                  drawingMode === 'circle' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                ⭕ Círculo
              </button>
              
              <button
                onClick={() => changeDrawingMode(drawingMode === 'text' ? 'none' : 'text')}
                className={`px-2 py-1.5 rounded text-xs transition-all duration-200 ${
                  drawingMode === 'text' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                📝 Texto
              </button>
            </div>
            
            {/* Botón para desactivar modo de dibujo */}
            {drawingMode !== 'none' && (
              <button
                onClick={() => changeDrawingMode('none')}
                className="w-full flex items-center justify-center space-x-1 bg-red-600/80 hover:bg-red-600 text-white px-2 py-1.5 rounded text-xs transition-all duration-200"
              >
                <X className="h-3 w-3" />
                <span>Desactivar dibujo</span>
              </button>
            )}
            
            {/* Controles para dibujo seleccionado */}
            {selectedDrawingId && (
              <div className="space-y-2 p-2 bg-gray-800/50 rounded">
                <div className="text-xs text-gray-300">Dibujo seleccionado:</div>
                <div className="flex space-x-1">
                  <button
                    onClick={deleteSelectedDrawing}
                    className="flex-1 bg-red-600/80 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={deselectAllDrawings}
                    className="flex-1 bg-gray-600/80 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Deseleccionar
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Cambiar color:</label>
                  <div className="flex space-x-1">
                    {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'].map((color) => (
                      <button
                        key={color}
                        onClick={() => changeSelectedDrawingColor(color)}
                        className={`w-4 h-4 rounded border ${
                          drawingElements.find(el => el.id === selectedDrawingId)?.color === color 
                            ? 'border-white' : 'border-gray-600'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Debug info */}
            <div className="text-xs text-gray-500 mt-2">
              Modo actual: {drawingMode}
            </div>
            
            <button
              onClick={clearDrawing}
              className="w-full flex items-center space-x-1 bg-red-600/80 hover:bg-red-600 text-white px-2 py-1.5 rounded text-xs transition-all duration-200"
            >
              <X className="h-3 w-3" />
              <span>Limpiar dibujo</span>
            </button>
          </div>

          {/* Consejos compactos */}
          <div className="bg-gray-900/30 rounded p-2">
            <h4 className="text-xs font-semibold text-gray-300 mb-1">💡</h4>
            <ul className="text-xs text-gray-400 space-y-0.5">
              <li>• Doble clic: editar</li>
              <li>• Arrastra: conectar</li>
              <li>• Delete: eliminar</li>
              <li>• Escape: cancelar dibujo</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tablero React Flow */}
      <div className="h-full w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onMove={(event, viewport) => setViewport(viewport)}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineStyle={connectionLineStyle}
          fitView
          attributionPosition="bottom-left"
          connectionMode={ConnectionMode.Loose}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.data?.type) {
                case 'trigger': return '#3b82f6';
                case 'analysis': return '#10b981';
                case 'decision': return '#f59e0b';
                case 'action': return '#ef4444';
                case 'image': return '#8b5cf6';
                case 'note': return '#6b7280';
                default: return '#6b7280';
              }
            }}
            className="bg-black/40 backdrop-blur-md border border-gray-700/30 rounded-lg shadow-xl"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        </ReactFlow>
        
        {/* Overlay para dibujo */}
        {drawingMode !== 'none' && (
          <div
            className="absolute inset-0 z-20 cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ pointerEvents: 'auto' }}
          >
            {/* Indicador visual del modo de dibujo */}
            <div className="absolute top-4 right-4 bg-blue-600/90 text-white px-3 py-1 rounded-lg text-sm font-medium">
              Modo: {drawingMode === 'line' ? 'Línea' : 
                     drawingMode === 'rectangle' ? 'Rectángulo' :
                     drawingMode === 'circle' ? 'Círculo' : 'Texto'}
            </div>
          </div>
        )}
        
        {/* Capa de dibujo */}
        <svg
          className="absolute inset-0 pointer-events-auto"
          style={{ zIndex: 15 }}
          width="100%"
          height="100%"
        >
          <g
            transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}
          >
            {/* Elementos dibujados */}
            {drawingElements.map((element) => {
              const isSelected = element.selected || selectedDrawingId === element.id;
              const strokeWidth = (2 / viewport.zoom) + (isSelected ? 2 : 0);
              const strokeColor = isSelected ? '#f59e0b' : element.color;
              
              if (element.type === 'line') {
                return (
                  <g key={element.id}>
                    <line
                      x1={element.x1}
                      y1={element.y1}
                      x2={element.x2}
                      y2={element.y2}
                      stroke={element.color}
                      strokeWidth={2 / viewport.zoom}
                    />
                    {isSelected && (
                      <line
                        x1={element.x1}
                        y1={element.y1}
                        x2={element.x2}
                        y2={element.y2}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray="5,5"
                        onClick={() => selectDrawing(element.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    )}
                    <line
                      x1={element.x1}
                      y1={element.y1}
                      x2={element.x2}
                      y2={element.y2}
                      stroke="transparent"
                      strokeWidth={Math.max(8, strokeWidth)}
                      onClick={() => selectDrawing(element.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </g>
                );
              } else if (element.type === 'rectangle') {
                const width = Math.abs(element.x2 - element.x1);
                const height = Math.abs(element.y2 - element.y1);
                const x = Math.min(element.x1, element.x2);
                const y = Math.min(element.y1, element.y2);
                return (
                  <g key={element.id}>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      stroke={element.color}
                      strokeWidth={2 / viewport.zoom}
                      fill="none"
                    />
                    {isSelected && (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray="5,5"
                        onClick={() => selectDrawing(element.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    )}
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      stroke="transparent"
                      strokeWidth={Math.max(8, strokeWidth)}
                      fill="none"
                      onClick={() => selectDrawing(element.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </g>
                );
              } else if (element.type === 'circle') {
                const radius = Math.sqrt(
                  Math.pow(element.x2 - element.x1, 2) + Math.pow(element.y2 - element.y1, 2)
                );
                return (
                  <g key={element.id}>
                    <circle
                      cx={element.x1}
                      cy={element.y1}
                      r={radius}
                      stroke={element.color}
                      strokeWidth={2 / viewport.zoom}
                      fill="none"
                    />
                    {isSelected && (
                      <circle
                        cx={element.x1}
                        cy={element.y1}
                        r={radius}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray="5,5"
                        onClick={() => selectDrawing(element.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    )}
                    <circle
                      cx={element.x1}
                      cy={element.y1}
                      r={radius}
                      stroke="transparent"
                      strokeWidth={Math.max(8, strokeWidth)}
                      fill="none"
                      onClick={() => selectDrawing(element.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </g>
                );
              } else if (element.type === 'text') {
                return (
                  <g key={element.id}>
                    <text
                      x={element.x1}
                      y={element.y1}
                      fill={element.color}
                      fontSize={14 / viewport.zoom}
                      fontFamily="Arial, sans-serif"
                    >
                      {element.text}
                    </text>
                    {isSelected && (
                      <text
                        x={element.x1}
                        y={element.y1}
                        fill={strokeColor}
                        fontSize={14 / viewport.zoom}
                        fontFamily="Arial, sans-serif"
                        stroke={strokeColor}
                        strokeWidth={1}
                        onClick={() => selectDrawing(element.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {element.text}
                      </text>
                    )}
                    <text
                      x={element.x1}
                      y={element.y1}
                      fill="transparent"
                      fontSize={Math.max(20, 14 / viewport.zoom)}
                      fontFamily="Arial, sans-serif"
                      onClick={() => selectDrawing(element.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {element.text}
                    </text>
                  </g>
                );
              }
              return null;
            })}
            
            {/* Elemento actual siendo dibujado */}
            {currentElement && (
              <>
                {currentElement.type === 'line' && (
                  <line
                    x1={currentElement.x1}
                    y1={currentElement.y1}
                    x2={currentElement.x2}
                    y2={currentElement.y2}
                    stroke={currentElement.color}
                    strokeWidth={2 / viewport.zoom}
                    strokeDasharray="5,5"
                  />
                )}
                {currentElement.type === 'rectangle' && (
                  <rect
                    x={Math.min(currentElement.x1, currentElement.x2)}
                    y={Math.min(currentElement.y1, currentElement.y2)}
                    width={Math.abs(currentElement.x2 - currentElement.x1)}
                    height={Math.abs(currentElement.y2 - currentElement.y1)}
                    stroke={currentElement.color}
                    strokeWidth={2 / viewport.zoom}
                    fill="none"
                    strokeDasharray="5,5"
                  />
                )}
                {currentElement.type === 'circle' && (
                  <circle
                    cx={currentElement.x1}
                    cy={currentElement.y1}
                    r={Math.sqrt(
                      Math.pow(currentElement.x2 - currentElement.x1, 2) + 
                      Math.pow(currentElement.y2 - currentElement.y1, 2)
                    )}
                    stroke={currentElement.color}
                    strokeWidth={2 / viewport.zoom}
                    fill="none"
                    strokeDasharray="5,5"
                  />
                )}
              </>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};

// Componente wrapper con ReactFlowProvider
const FlightPlanBoardWrapper = () => {
  return (
    <ReactFlowProvider>
      <FlightPlanBoard />
    </ReactFlowProvider>
  );
};

export default FlightPlanBoardWrapper;
