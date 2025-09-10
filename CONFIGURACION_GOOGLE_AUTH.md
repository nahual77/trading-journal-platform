# 🔧 Configuración de Autenticación Google - GrowJou

## 🚨 Problema Actual
- Error 404 de Google al intentar autenticación
- URLs de redirección mal configuradas en Supabase

## ✅ Solución Paso a Paso

### 1. Configurar Google OAuth Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **APIs & Services** > **Credentials**
4. Crea una **OAuth 2.0 Client ID** si no existe
5. Configura las **Authorized redirect URIs**:
   ```
   https://qxofbcfindfglcbkckxs.supabase.co/auth/v1/callback
   ```

### 2. Configurar Supabase Dashboard
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: `qxofbcfindfglcbkckxs`
3. Ve a **Authentication** > **Providers**
4. Habilita **Google** provider
5. Configura:
   - **Client ID**: (del paso 1)
   - **Client Secret**: (del paso 1)
   - **Redirect URL**: `https://qxofbcfindfglcbkckxs.supabase.co/auth/v1/callback`

### 3. Configurar Site URL y Redirect URLs
En **Authentication** > **URL Configuration**:

**Site URL:**
```
https://growjou.vercel.app
```

**Redirect URLs (agregar todas):**
```
https://growjou.vercel.app
https://growjou.vercel.app/**
https://growjou.vercel.app/auth/callback
https://growjou.vercel.app/dashboard
http://localhost:3000
http://localhost:3000/**
http://localhost:3000/auth/callback
http://localhost:3000/dashboard
```

### 4. Verificar Configuración en Código
El código actual está correcto:
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin
  }
});
```

## 🔍 URLs Importantes
- **Sitio en producción**: https://growjou.vercel.app
- **Supabase URL**: https://qxofbcfindfglcbkckxs.supabase.co
- **Callback URL**: https://qxofbcfindfglcbkckxs.supabase.co/auth/v1/callback

## ⚠️ Notas Importantes
1. **Google OAuth** debe tener la URL de callback de Supabase
2. **Supabase** debe tener las URLs de tu sitio en Redirect URLs
3. **Site URL** debe ser la URL principal de tu sitio
4. Los cambios pueden tardar 5-10 minutos en aplicarse

## 🧪 Prueba
1. Guarda todos los cambios en Supabase
2. Espera 5-10 minutos
3. Prueba el login con Google en https://growjou.vercel.app
4. Debería redirigir correctamente sin error 404

## 📞 Si sigue fallando
- Verifica que el Client ID y Secret sean correctos
- Asegúrate de que las URLs estén exactamente como se muestran
- Revisa la consola del navegador para errores específicos
