/**
 * storage.ts — Supabase Storage helpers
 *
 * All Storage .from() calls live here (same pattern as repository.ts for DB).
 */

import { supabase } from '@/lib/supabase/client'

const BUCKET_FRAME_MODELS = 'frame-models'
const BUCKET_AR_TRYONS = 'ar-tryons'

/** Upload a .glb frame model file */
export async function uploadFrameModel(
  file: File,
  productId: string,
): Promise<string> {
  const ext = file.name.split('.').pop() || 'glb'
  const path = `${productId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET_FRAME_MODELS)
    .upload(path, file, { contentType: 'model/gltf-binary', upsert: true })
  if (error) throw error

  const { data } = supabase.storage
    .from(BUCKET_FRAME_MODELS)
    .getPublicUrl(path)

  return data.publicUrl
}

/** Upload a try-on capture photo */
export async function uploadTryOnCapture(
  blob: Blob,
  sessionId: string,
  index: number,
): Promise<string> {
  const ext = blob.type === 'image/png' ? 'png' : 'jpg'
  const path = `${sessionId}/${Date.now()}_${index}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET_AR_TRYONS)
    .upload(path, blob, { contentType: blob.type })
  if (error) throw error

  const { data } = supabase.storage
    .from(BUCKET_AR_TRYONS)
    .getPublicUrl(path)

  return data.publicUrl
}
