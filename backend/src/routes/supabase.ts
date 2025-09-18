import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// Ruta de prueba para Supabase
router.get('/test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      success: true,
      message: 'Conexión a Supabase exitosa',
      data: data
    });
  } catch (err) {
    res.status(500).json({ error: 'Error de conexión' });
  }
});

// Ruta para obtener todos los usuarios
router.get('/users', async (req, res) => {
  try {
    // Consultar la tabla auth.users de Supabase (tabla real de usuarios)
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error al obtener usuarios de auth.users:', error);
      return res.status(500).json({ error: error.message });
    }
    
    // Transformar los datos para que sean consistentes
    const users = data.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      phone: user.phone,
      display_name: user.user_metadata?.full_name || user.user_metadata?.name || '-'
    }));
    
    res.json({
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      users: users || [],
      count: users ? users.length : 0
    });
  } catch (err) {
    console.error('Error inesperado al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Ruta para obtener estadísticas de usuarios
router.get('/users/stats', async (req, res) => {
  try {
    // Obtener todos los usuarios de auth.users
    const { data, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      throw usersError;
    }

    const users = data.users;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calcular estadísticas reales
    const totalUsers = users ? users.length : 0;
    const newUsersToday = users ? users.filter(user => {
      const userDate = new Date(user.created_at);
      return userDate >= today;
    }).length : 0;
    
    // Usuarios activos (que han iniciado sesión en los últimos 30 días)
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const activeUsers = users ? users.filter(user => {
      if (!user.last_sign_in_at) return false;
      const lastSignIn = new Date(user.last_sign_in_at);
      return lastSignIn >= thirtyDaysAgo;
    }).length : 0;
    
    // Simular usuarios premium (en un sistema real, esto vendría de una tabla de suscripciones)
    const premiumUsers = Math.floor(totalUsers * 0.1); // 10% de usuarios premium

    res.json({
      success: true,
      message: 'Estadísticas de usuarios obtenidas exitosamente',
      stats: {
        totalUsers,
        activeUsers,
        newUsersToday,
        premiumUsers
      }
    });
  } catch (err) {
    console.error('Error al obtener estadísticas de usuarios:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas de usuarios' });
  }
});

// Ruta para crear un nuevo usuario
router.post('/users', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // Validar datos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        full_name: full_name || '',
        created_by: 'admin'
      }
    });

    if (error) {
      console.error('Error al crear usuario:', error);
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    // Transformar la respuesta para consistencia
    const user = {
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at,
      last_sign_in_at: data.user.last_sign_in_at,
      email_confirmed_at: data.user.email_confirmed_at,
      phone: data.user.phone,
      display_name: data.user.user_metadata?.full_name || '-'
    };

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: user
    });
  } catch (err) {
    console.error('Error inesperado al crear usuario:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
});

// Ruta para actualizar un usuario
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, user_metadata } = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'ID de usuario es requerido' 
      });
    }

    // Preparar datos de actualización
    const updateData: any = {};
    
    if (email) {
      updateData.email = email;
    }
    
    if (password) {
      updateData.password = password;
    }
    
    if (user_metadata) {
      updateData.user_metadata = user_metadata;
    }

    // Actualizar usuario en Supabase Auth
    const { data, error } = await supabase.auth.admin.updateUserById(id, updateData);

    if (error) {
      console.error('Error al actualizar usuario:', error);
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    // Transformar la respuesta para consistencia
    const user = {
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at,
      last_sign_in_at: data.user.last_sign_in_at,
      email_confirmed_at: data.user.email_confirmed_at,
      phone: data.user.phone,
      display_name: data.user.user_metadata?.full_name || '-'
    };

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: user
    });
  } catch (err) {
    console.error('Error inesperado al actualizar usuario:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
});

// Ruta para eliminar un usuario
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'ID de usuario es requerido' 
      });
    }

    // Eliminar usuario de Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      console.error('Error al eliminar usuario:', error);
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (err) {
    console.error('Error inesperado al eliminar usuario:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
});

export default router;