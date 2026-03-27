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
const BUCKET_PRODUCT_PHOTOS = 'product-photos'

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

/**
 * Upload a standardized product photo (frame capture).
 * Uses RPC rpc_storage_product_photo_path for secure path generation.
 * Falls back to direct path if RPC not yet available.
 */
export async function uploadProductPhoto(
  blob: Blob,
  productId: string,
  angle: string,
): Promise<{ signedUrl: string; storagePath: string }> {
  const ext = blob.type === 'image/png' ? 'png' : 'jpg'

  // Try RPC path generation first, fallback to direct
  let path: string
  try {
    path = await callRpc<string>('rpc_storage_product_photo_path', {
      p_product_id: productId,
      p_angle: angle,
      p_extension: ext,
    })
  } catch {
    // Fallback: direct path construction
    const filename = `${angle}_${Date.now()}.${ext}`
    path = `${productId}/${filename}`
  }

  const { error } = await supabase.storage
    .from(BUCKET_PRODUCT_PHOTOS)
    .upload(path, blob, { contentType: blob.type, upsert: true })
  if (error) throw error

  const { data, error: signError } = await supabase.storage
    .from(BUCKET_PRODUCT_PHOTOS)
    .createSignedUrl(path, 3600)
  if (signError) throw signError

  return { signedUrl: data.signedUrl, storagePath: path }
}

/**
 * Register a product image in the database after upload.
 * Calls rpc_inventory_upsert_product_image.
 */
export async function registerProductImage(params: {
  productId: string
  angle: string
  imageType?: string
  frameShape?: string | null
  storagePath: string
  widthPx?: number
  heightPx?: number
  fileSizeBytes?: number
  metadata?: Record<string, unknown>
}): Promise<string> {
  return callRpc<string>('rpc_inventory_upsert_product_image', {
    p_product_id: params.productId,
    p_angle: params.angle,
    p_image_type: params.imageType ?? 'photo',
    p_frame_shape: params.frameShape ?? null,
    p_storage_path: params.storagePath,
    p_width_px: params.widthPx ?? null,
    p_height_px: params.heightPx ?? null,
    p_file_size_bytes: params.fileSizeBytes ?? null,
    p_metadata: params.metadata ?? {},
  })
}

/** Gera signed URL para um arquivo existente */
export async function getSignedUrl(
  bucket: 'frame-models' | 'ar-tryons' | 'product-photos',
  path: string,
  expiresIn: number = 3600,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}
