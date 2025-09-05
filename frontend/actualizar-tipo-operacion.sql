-- Agregar el tipo 'select' a los tipos de columna permitidos
ALTER TABLE journal_columns DROP CONSTRAINT journal_columns_column_type_check;
ALTER TABLE journal_columns ADD CONSTRAINT journal_columns_column_type_check 
  CHECK (column_type IN ('text', 'number', 'boolean', 'date', 'time', 'image', 'select'));

-- Agregar campo tipo_operacion a trade_entries
ALTER TABLE trade_entries ADD COLUMN tipo_operacion TEXT CHECK (tipo_operacion IN ('compra', 'venta'));

-- Actualizar la función que crea columnas por defecto
CREATE OR REPLACE FUNCTION create_default_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar columnas por defecto
    INSERT INTO journal_columns (journal_id, user_id, key, name, column_type, visible, column_order) VALUES
    (NEW.id, NEW.user_id, 'fecha', 'Fecha', 'date', true, 1),
    (NEW.id, NEW.user_id, 'hora', 'Hora', 'time', true, 2),
    (NEW.id, NEW.user_id, 'activo', 'Activo', 'text', true, 3),
    (NEW.id, NEW.user_id, 'razonEntrada', 'Razón de entrada', 'text', true, 4),
    (NEW.id, NEW.user_id, 'antes', 'Antes', 'image', true, 5),
    (NEW.id, NEW.user_id, 'durante', 'Durante', 'image', true, 6),
    (NEW.id, NEW.user_id, 'ratio', 'Ratio', 'text', true, 7),
    (NEW.id, NEW.user_id, 'beneficio', 'Beneficio', 'text', true, 8),
    (NEW.id, NEW.user_id, 'seCumplioElPlan', 'Se cumplió el plan?', 'boolean', true, 9),
    (NEW.id, NEW.user_id, 'leccion', 'Lección', 'text', true, 10),
    (NEW.id, NEW.user_id, 'emocionesAntes', 'Emociones (antes)', 'text', true, 11),
    (NEW.id, NEW.user_id, 'emocionesDurante', 'Emociones (durante)', 'text', true, 12),
    (NEW.id, NEW.user_id, 'emocionesDespues', 'Emociones (después)', 'text', true, 13),
    (NEW.id, NEW.user_id, 'entradasNoTomadas', 'Entradas no tomadas', 'image', true, 14),
    (NEW.id, NEW.user_id, 'queSucedioConEntradasNoTomadas', 'Que sucedió con estas entradas', 'image', true, 15),
    (NEW.id, NEW.user_id, 'tipoOperacion', 'Tipo de Operación', 'select', true, 16);
    
    -- Crear configuración MT5 por defecto
    INSERT INTO mt5_configs (journal_id, user_id, broker, account_number, server_name, balance, equity, free_margin)
    VALUES (NEW.id, NEW.user_id, 'Deriv (SVG) LLC', substring(NEW.id::text, 1, 8), 'DerivSVG-Server-02', 1000.00, 1000.00, 1000.00);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

