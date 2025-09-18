import express from 'express';
import { adminController } from '../controllers/adminController';

const router = express.Router();

// Middleware de autenticación (lo implementaremos después)
// router.use(authenticateAdmin);

// Ruta GET para /api/admin
router.get('/', (req, res) => {
  res.json({
    message: '🔧 Panel de Administración del Trading Journal',
    version: '1.0.0',
    endpoints: [
      'GET /api/admin - Información del panel',
      'GET /api/admin/dashboard - Dashboard principal',
      'GET /api/admin/users - Lista de usuarios',
      'GET /api/admin/stats/overview - Estadísticas generales',
      'GET /api/admin/subscriptions - Gestión de suscripciones',
      'GET /api/admin/analytics/usage - Analytics de uso'
    ],
    timestamp: new Date().toISOString()
  });
});

// Dashboard principal
router.get('/dashboard', adminController.getDashboard);

// Gestión de usuarios
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/subscription', adminController.updateUserSubscription);
router.put('/users/:id/limits', adminController.updateUserLimits);

// Estadísticas de uso
router.get('/stats/overview', adminController.getOverviewStats);
router.get('/stats/users', adminController.getUserStats);
router.get('/stats/trading', adminController.getTradingStats);
router.get('/stats/subscriptions', adminController.getSubscriptionStats);

// Gestión de suscripciones
router.get('/subscriptions', adminController.getSubscriptions);
router.post('/subscriptions/:id/upgrade', adminController.upgradeSubscription);
router.post('/subscriptions/:id/downgrade', adminController.downgradeSubscription);

// Analytics avanzados
router.get('/analytics/usage', adminController.getUsageAnalytics);
router.get('/analytics/conversion', adminController.getConversionAnalytics);
router.get('/analytics/retention', adminController.getRetentionAnalytics);

export default router;

