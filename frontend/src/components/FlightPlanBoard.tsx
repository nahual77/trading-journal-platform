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
    const baseStyle = "px-4 py-3 rounded-lg border-2 min-w-[200px] max-w-[300px] transition-all duration-200 group";
    
    if (selected) {
      return `${baseStyle} shadow-lg shadow-blue-500/50 border-blue-400`;
    }

    switch (data.type) {
      case 'trigger':
        return `${baseStyle} bg-blue-900/50 border-blue-500 hover:border-blue-400`;
      case 'analysis':
        return `${baseStyle} bg-green-900/50 border-green-500 hover:border-green-400`;
      case 'decision':
        return `${baseStyle} bg-yellow-900/50 border-yellow-500 hover:border-yellow-400`;
      case 'action':
        return `${baseStyle} bg-red-900/50 border-red-500 hover:border-red-400`;
      case 'image':
        return `${baseStyle} bg-purple-900/50 border-purple-500 hover:border-purple-400`;
      case 'note':
        return `${baseStyle} bg-gray-800/50 border-gray-500 hover:border-gray-400`;
      default:
        return `${baseStyle} bg-gray-800/50 border-gray-500`;
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
                    className="w-full h-32 object-cover rounded border border-gray-600"
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
              <img
                src={data.imageUrl}
                alt={data.label}
                className="w-full h-24 object-cover rounded border border-gray-600"
                onError={() => {
                  // Si la imagen falla al cargar, la removemos
                  data.imageUrl = '';
                }}
              />
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
      localStorage.removeItem('flightPlanBoard');
      alert('Tablero limpiado');
    }
  }, [setNodes, setEdges]);

  // Cargar tablero al montar el componente
  React.useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Función para manejar teclas de eliminación
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelected();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [deleteSelected]);

  return (
    <div className="h-full w-full bg-gray-900 relative">
      {/* Panel flotante izquierdo compacto */}
      <div className="absolute left-3 top-3 z-10 w-64">
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

          {/* Consejos compactos */}
          <div className="bg-gray-900/30 rounded p-2">
            <h4 className="text-xs font-semibold text-gray-300 mb-1">💡</h4>
            <ul className="text-xs text-gray-400 space-y-0.5">
              <li>• Doble clic: editar</li>
              <li>• Arrastra: conectar</li>
              <li>• Delete: eliminar</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tablero React Flow */}
      <div className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
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
