import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet());

// Middleware de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos del admin panel
app.use('/assets', express.static('src/views/assets'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Backend del Trading Journal funcionando correctamente!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Rutas de administración
import adminRoutes from './routes/admin';
app.use('/api/admin', adminRoutes);

// Rutas de Supabase
import supabaseRoutes from './routes/supabase';
app.use('/api/supabase', supabaseRoutes);

// Rutas de usuarios híbridas
import userRoutes from './routes/users';
app.use('/api/users', userRoutes);

// Servir dashboard de administración
app.get('/admin', (req, res) => {
  res.sendFile('admin-dashboard.html', { root: './src/views' });
});

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;
