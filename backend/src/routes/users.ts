import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// ===========================================
// RUTAS PARA GESTIÓN DE USUARIOS HÍBRIDA
// ===========================================

// Obtener usuarios por tipo
router.get('/by-type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_subscriptions(*),
        educators(*),
        students(*)
      `)
      .eq('user_type', type)
      .range(offset, offset + Number(limit) - 1)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Obtener total para paginación
    const { count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', type);
    
    res.json({
      success: true,
      users: data || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error al obtener usuarios por tipo:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Obtener resumen de usuarios
router.get('/overview', async (req, res) => {
  try {
    // Obtener estadísticas por tipo
    const { data: stats, error: statsError } = await supabase
      .from('user_profiles')
      .select('user_type, status')
      .in('status', ['active', 'inactive']);
    
    if (statsError) {
      throw statsError;
    }
    
    // Calcular estadísticas
    const overview: any = {
      totalUsers: stats?.length || 0,
      activeUsers: stats?.filter(u => u.status === 'active').length || 0,
      freeUsers: stats?.filter(u => u.user_type === 'free').length || 0,
      premiumUsers: stats?.filter(u => u.user_type === 'premium').length || 0,
      proUsers: stats?.filter(u => u.user_type === 'pro').length || 0,
      educators: stats?.filter(u => u.user_type === 'educator').length || 0,
      students: stats?.filter(u => u.user_type === 'student').length || 0,
    };
    
    // Obtener ingresos de suscripciones
    const { data: revenue, error: revenueError } = await supabase
      .from('user_subscriptions')
      .select('plan_type, price')
      .eq('status', 'active');
    
    if (!revenueError && revenue) {
      overview.revenue = {
        monthly: revenue
          .filter(r => r.plan_type !== 'free')
          .reduce((sum, r) => sum + (r.price || 0), 0),
        byPlan: {
          premium: revenue
            .filter(r => r.plan_type === 'premium')
            .reduce((sum, r) => sum + (r.price || 0), 0),
          pro: revenue
            .filter(r => r.plan_type === 'pro')
            .reduce((sum, r) => sum + (r.price || 0), 0)
        }
      };
    }
    
    res.json({
      success: true,
      overview
    });
  } catch (error: any) {
    console.error('Error al obtener resumen de usuarios:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Crear nuevo usuario con tipo específico
router.post('/create', async (req, res) => {
  try {
    const { email, password, full_name, user_type = 'free' } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email y contraseña son requeridos' 
      });
    }
    
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || '',
        created_by: 'admin'
      }
    });
    
    if (authError) {
      throw authError;
    }
    
    // Crear perfil de usuario
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        user_type: user_type,
        display_name: full_name || email.split('@')[0],
        status: 'active'
      })
      .select()
      .single();
    
    if (profileError) {
      throw profileError;
    }
    
    // Crear suscripción si no es gratuita
    if (user_type !== 'free') {
      const price = user_type === 'premium' ? 29.99 : 99.99;
      await supabase
        .from('user_subscriptions')
        .insert({
          user_id: authData.user.id,
          plan_type: user_type,
          status: 'active',
          price: price
        });
    }
    
    // Crear perfil específico si es educador o estudiante
    if (user_type === 'educator') {
      await supabase
        .from('educators')
        .insert({
          id: authData.user.id,
          commission_rate: 10.00
        });
    } else if (user_type === 'student') {
      await supabase
        .from('students')
        .insert({
          id: authData.user.id,
          level: 'beginner'
        });
    }
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        user_type: user_type,
        display_name: profileData.display_name,
        status: profileData.status
      }
    });
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Actualizar tipo de usuario
router.put('/:id/type', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_type } = req.body;
    
    if (!user_type) {
      return res.status(400).json({ 
        success: false,
        error: 'Tipo de usuario es requerido' 
      });
    }
    
    // Actualizar perfil
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .update({ user_type: user_type })
      .eq('id', id)
      .select()
      .single();
    
    if (profileError) {
      throw profileError;
    }
    
    // Actualizar suscripción
    const price = user_type === 'free' ? 0.00 : user_type === 'premium' ? 29.99 : 99.99;
    
    await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: id,
        plan_type: user_type,
        status: 'active',
        price: price
      });
    
    res.json({
      success: true,
      message: 'Tipo de usuario actualizado exitosamente',
      user: profileData
    });
  } catch (error: any) {
    console.error('Error al actualizar tipo de usuario:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Obtener características de un plan
router.get('/plan-features/:plan', async (req, res) => {
  try {
    const { plan } = req.params;
    
    const { data, error } = await supabase
      .from('plan_features')
      .select('*')
      .eq('plan_type', plan);
    
    if (error) {
      throw error;
    }
    
    res.json({
      success: true,
      features: data || []
    });
  } catch (error: any) {
    console.error('Error al obtener características del plan:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

export default router;

