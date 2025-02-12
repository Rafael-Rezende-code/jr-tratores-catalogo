/*
  # Adicionar suporte a galeria de imagens

  1. Nova Tabela
    - `tractor_gallery`
      - `id` (uuid, primary key)
      - `tractor_id` (uuid, foreign key)
      - `image_url` (text)
      - `order` (integer)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `tractor_gallery`
    - Adicionar políticas para leitura pública
    - Adicionar políticas para escrita autenticada
*/

-- Criar tabela de galeria
CREATE TABLE IF NOT EXISTS tractor_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tractor_id uuid NOT NULL REFERENCES tractors(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT tractor_gallery_order_check CHECK ("order" >= 0)
);

-- Habilitar RLS
ALTER TABLE tractor_gallery ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Qualquer pessoa pode ver imagens da galeria"
  ON tractor_gallery
  FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar imagens"
  ON tractor_gallery
  TO authenticated
  USING (true)
  WITH CHECK (true);