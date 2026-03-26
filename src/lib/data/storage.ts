/**
 * storage.ts — Supabase Storage helpers
 *
 * All Storage .from() calls live here (same pattern as repository.ts for DB).
 *
 * Buckets sao PRIVADOS. Acesso via:
 *   - RLS policies com tenant_id no path
 *   - RPCs para gerar paths e signed URLs
 *   - Path convention: {tenant_id}/{entity_id}/{filename}
 */

import { supabase } from '@/lib/supabase/client'
import { callRpc } from './repository'

const BUCKET_FRAME_MODELS = 'frame-models'
const BUCKET_AR_TRYONS = 'ar-tryons'

/** Upload a .glb frame model file (path prefixado com tenant_id via RPC) */
export async function uploadFrameModel(
  file: File,
  productId: string,
): Promise<string> {
  const ext = file.name.split('.').pop() || 'glb'
  const filename = `${Date.now()}.${ext}`

  // RPC gera path com tenant_id
  const path = await callRpc<string>('rpc_storage_frame_model_path', {
    p_product_id: productId,
    p_filename: filename,
  })

  const { error } = await supabase.storage
    .from(BUCKET_FRAME_MODELS)
    .upload(path, file, { contentType: 'model/gltf-binary', upsert: true })
  if (error) throw error

  // Retorna signed URL (1h)
  const { data, error: signError } = await supabase.storage
    .from(BUCKET_FRAME_MODELS)
    .createSignedUrl(path, 3600)
  if (signError) throw signError

  return data.signedUrl
}

/** Upload a try-on capture photo (path prefixado com tenant_id via RPC) */
export async function uploadTryOnCapture(
  blob: Blob,
  sessionId: string,
  index: number,
): Promise<string> {
  const ext = blob.type === 'image/png' ? 'png' : 'jpg'
  const filename = `${Date.now()}_${index}.${ext}`

  const path = await callRpc<string>('rpc_storage_tryon_capture_path', {
    p_session_id: sessionId,
    p_filename: filename,
  })

  const { error } = await supabase.storage
    .from(BUCKET_AR_TRYONS)
    .upload(path, blob, { contentType: blob.type })
  if (error) throw error

  const { data, error: signError } = await supabase.storage
    .from(BUCKET_AR_TRYONS)
    .createSignedUrl(path, 3600)
  if (signError) throw signError

  return data.signedUrl
}

/** Gera signed URL para um arquivo existente */
export async function getSignedUrl(
  bucket: 'frame-models' | 'ar-tryons',
  path: string,
  expiresIn: number = 3600,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}
