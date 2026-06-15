-- Migración: Renombrar valores del enum Categoria y agregar Programa Anual de Adquisiciones
-- Ejecutar antes de reiniciar la app con el nuevo código

-- 1. Renombrar 'licitacion' -> 'licitaciones'
ALTER TYPE "licitaciones_categoria_enum" RENAME VALUE 'licitacion' TO 'licitaciones';

-- 2. Renombrar 'directiva' -> 'adjudicaciones_directas'
ALTER TYPE "licitaciones_categoria_enum" RENAME VALUE 'directiva' TO 'adjudicaciones_directas';

-- 3. Agregar nuevo valor 'programa_anual_adquisiciones'
ALTER TYPE "licitaciones_categoria_enum" ADD VALUE 'programa_anual_adquisiciones';
