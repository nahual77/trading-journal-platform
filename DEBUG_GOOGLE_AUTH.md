# 🔍 DEBUG GOOGLE AUTH

## Client ID actual:
`763136612444-t6dnd7b393t8sg1icjhd56pk215c86lm.apps.googleusercontent.com`

## Pasos para verificar:

### 1. Google Cloud Console:
- Ve a [console.cloud.google.com](https://console.cloud.google.com/)
- APIs & Services > Credentials
- Verifica que el Client ID sea exactamente: `763136612444-t6dnd7b393t8sg1icjhd56pk215c86lm.apps.googleusercontent.com`

### 2. Verificar URIs autorizadas:
- Debe incluir: `https://qxofbcfindfglcbkckxs.supabase.co/auth/v1/callback`

### 3. Supabase Dashboard:
- Authentication > Providers > Google
- Client ID debe ser exactamente: `763136612444-t6dnd7b393t8sg1icjhd56pk215c86lm.apps.googleusercontent.com`
- Client Secret debe empezar con: `GOCSPX-`

## Si el Client ID no existe:
1. Crear nuevo OAuth 2.0 Client ID
2. Configurar URIs autorizadas
3. Copiar nuevo Client ID y Secret
4. Actualizar en Supabase

## URLs importantes:
- Sitio: https://growjou.vercel.app
- Supabase: https://qxofbcfindfglcbkckxs.supabase.co
- Callback: https://qxofbcfindfglcbkckxs.supabase.co/auth/v1/callback
