import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://qxofbcfindfglcbkckxs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4b2ZiY2ZpbmRmZ2xjYmtja3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NzI5NjUsImV4cCI6MjA3MjM0ODk2NX0.mc0Ifyk44qviQS6WJQDA2M7i0AYkWaCITPYMjSeaQ0A');

async function diagnosticarCompleto() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE LA BASE DE DATOS');
  console.log('==========================================');
  console.log('URL:', 'https://qxofbcfindfglcbkckxs.supabase.co');
  console.log('');
  
  try {
    // 1. Verificar trading_journals
    console.log('📊 1. VERIFICANDO TRADING_JOURNALS...');
    const { data: journals, error: journalsError } = await supabase
      .from('trading_journals')
      .select('*');
    
    if (journalsError) {
      console.error('❌ Error en trading_journals:', journalsError);
    } else {
      console.log('✅ Diarios encontrados:', journals.length);
      journals.forEach(j => {
        console.log('  - ID:', j.id);
        console.log('  - Usuario:', j.user_id);
        console.log('  - Nombre:', j.name);
        console.log('  - Activo:', j.is_active);
        console.log('  - Creado:', j.created_at);
        console.log('  ---');
      });
    }
    
    // 2. Verificar trade_entries
    console.log('\\n📝 2. VERIFICANDO TRADE_ENTRIES...');
    const { data: entries, error: entriesError } = await supabase
      .from('trade_entries')
      .select('*')
      .limit(10);
    
    if (entriesError) {
      console.error('❌ Error en trade_entries:', entriesError);
    } else {
      console.log('✅ Entradas encontradas:', entries.length);
      entries.forEach(e => {
        console.log('  - ID:', e.id);
        console.log('  - Journal:', e.journal_id);
        console.log('  - Usuario:', e.user_id);
        console.log('  - Fecha:', e.fecha);
        console.log('  - Beneficio:', e.beneficio);
        console.log('  ---');
      });
    }
    
    // 3. Verificar usuarios únicos
    console.log('\\n👥 3. ANÁLISIS DE USUARIOS ÚNICOS...');
    const uniqueUsers = new Set();
    journals.forEach(j => uniqueUsers.add(j.user_id));
    entries.forEach(e => uniqueUsers.add(e.user_id));
    
    console.log('✅ Usuarios únicos encontrados:', uniqueUsers.size);
    uniqueUsers.forEach(userId => {
      console.log('  - Usuario ID:', userId);
    });
    
    // 4. Verificar journals únicos
    console.log('\\n📚 4. ANÁLISIS DE DIARIOS ÚNICOS...');
    const uniqueJournals = new Set();
    journals.forEach(j => uniqueJournals.add(j.id));
    entries.forEach(e => uniqueJournals.add(e.journal_id));
    
    console.log('✅ Diarios únicos encontrados:', uniqueJournals.size);
    uniqueJournals.forEach(journalId => {
      console.log('  - Journal ID:', journalId);
    });
    
    // 5. Resumen del problema
    console.log('\\n🎯 5. RESUMEN DEL DIAGNÓSTICO...');
    if (uniqueUsers.size === 1) {
      console.log('🚨 PROBLEMA IDENTIFICADO: Solo hay 1 usuario en la base de datos');
      console.log('   - Todos los usuarios ven los mismos datos');
      console.log('   - No hay aislamiento de datos');
    } else {
      console.log('✅ Múltiples usuarios encontrados - aislamiento posible');
    }
    
    if (uniqueJournals.size === 1) {
      console.log('🚨 PROBLEMA IDENTIFICADO: Solo hay 1 diario en la base de datos');
      console.log('   - Todos los usuarios comparten el mismo diario');
    } else {
      console.log('✅ Múltiples diarios encontrados');
    }
    
  } catch (err) {
    console.error('❌ Error general:', err);
  }
}

diagnosticarCompleto();

