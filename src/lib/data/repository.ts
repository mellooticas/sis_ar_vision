/**
 * repository.ts — Data Access Layer (standard pattern)
 *
 * All Supabase .from() and .rpc() calls live here.
 * Hooks and pages NEVER import supabase directly.
 *
 * Leitura: fetchView<T>(viewName, options)
 * Escrita: callRpc<T>(rpcName, params)
 *
 * Clearix AR Vision consome views/RPCs existentes:
 *   - Produtos: v_inventory_products, rpc_inventory_search_products, rpc_frame_models_list
 *   - Lentes: rpc_canonical_for_prescription, rpc_canonical_detail, rpc_lens_search
 *   - Pacientes: v_clinical_patients, v_clinical_prescriptions
 *   - Lojas: v_iam_stores
 */

import { supabase } from '@/lib/supabase/client'
import type { Product, FrameModel, FrameModel3D } from '@/types/product'
import type {
  PremiumFilterOptions, StandardFilterOptions,
  PremiumFilterParamsV3, PremiumSearchParamsV3,
  StandardFilterParamsV3, StandardSearchParamsV3,
  CanonicalPremiumV3, CanonicalStandardV3,
  CanonicalSearchResultV3, PrescriptionSearchV3Result, CanonicalDetail,
} from '@/types/lens'
import type { Patient, Prescription } from '@/types/patient'

// ---------------------------------------------------------------------------
// Generic helpers — ZERO .from()/.rpc() fora daqui
// ---------------------------------------------------------------------------

interface FetchViewOptions {
  columns?: string
  filters?: Record<string, unknown>
  order?: { column: string; ascending?: boolean }
  limit?: number
  offset?: number
  single?: boolean
  maybeSingle?: boolean
  head?: boolean
  count?: 'exact' | 'planned' | 'estimated'
  search?: { column: string; term: string }
  ilike?: Record<string, string>
}

export async function fetchView<T>(
  viewName: string,
  options: FetchViewOptions = {},
): Promise<T> {
  const {
    columns = '*',
    filters,
    order,
    limit,
    offset,
    single = false,
    maybeSingle = false,
    head = false,
    count,
    search,
    ilike,
  } = options

  let query = supabase.from(viewName).select(columns, {
    count: count ?? undefined,
    head,
  })

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value)
      }
    }
  }

  if (ilike) {
    for (const [col, val] of Object.entries(ilike)) {
      query = query.ilike(col, `%${val}%`)
    }
  }

  if (search && search.term.trim()) {
    query = query.ilike(search.column, `%${search.term.trim()}%`)
  }

  if (order) {
    query = query.order(order.column, { ascending: order.ascending ?? true })
  }

  if (offset) {
    query = query.range(offset, offset + (limit ?? 50) - 1)
  } else if (limit) {
    query = query.limit(limit)
  }

  if (single) {
    const { data, error } = await query.single()
    if (error) throw error
    return data as T
  }

  if (maybeSingle) {
    const { data, error } = await query.maybeSingle()
    if (error) throw error
    return data as T
  }

  if (head && count) {
    const { count: total, error } = await query
    if (error) throw error
    return (total ?? 0) as T
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as T
}

export async function callRpc<T>(rpcName: string, params?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(rpcName, params)
  if (error) throw error
  return data as T
}

// ---------------------------------------------------------------------------
// PRODUTOS / ARMACOES
// ---------------------------------------------------------------------------

const VIEW_PRODUCTS = 'v_inventory_products'

export async function listProducts(options?: {
  search?: string
  category?: string
  brand?: string
  storeId?: string
  limit?: number
  offset?: number
}): Promise<Product[]> {
  const filters: Record<string, unknown> = {}
  if (options?.category) filters.category = options.category
  if (options?.brand) filters.brand = options.brand
  if (options?.storeId) filters.store_id = options.storeId

  return fetchView<Product[]>(VIEW_PRODUCTS, {
    filters,
    search: options?.search ? { column: 'name', term: options.search } : undefined,
    order: { column: 'name', ascending: true },
    limit: options?.limit,
    offset: options?.offset,
  })
}

export async function getProduct(id: string): Promise<Product | null> {
  return fetchView<Product | null>(VIEW_PRODUCTS, {
    filters: { id },
    maybeSingle: true,
  })
}

export async function searchProducts(term: string): Promise<Product[]> {
  return callRpc<Product[]>('rpc_inventory_search_products', {
    p_search_term: term,
  })
}

export async function listFrameModels(): Promise<FrameModel[]> {
  return callRpc<FrameModel[]>('rpc_frame_models_list', {})
}

// ---------------------------------------------------------------------------
// FRAME MODELS 3D (inventory.frame_models)
// ---------------------------------------------------------------------------

const VIEW_FRAME_MODELS = 'v_inventory_frame_models'

export async function getFrameModelByProduct(productId: string): Promise<FrameModel3D | null> {
  return fetchView<FrameModel3D | null>(VIEW_FRAME_MODELS, {
    filters: { product_id: productId },
    maybeSingle: true,
  })
}

export async function listFrameModels3D(): Promise<FrameModel3D[]> {
  return fetchView<FrameModel3D[]>(VIEW_FRAME_MODELS, {
    order: { column: 'created_at', ascending: false },
  })
}

export async function upsertFrameModel(params: {
  productId: string
  modelUrl: string
  modelFormat?: string
  modelMetadata?: Record<string, unknown>
  previewImageUrl?: string | null
}): Promise<string> {
  return callRpc<string>('rpc_inventory_upsert_frame_model', {
    p_product_id: params.productId,
    p_model_url: params.modelUrl,
    p_model_format: params.modelFormat ?? 'glb',
    p_model_metadata: params.modelMetadata ?? {},
    p_preview_image_url: params.previewImageUrl ?? null,
  })
}

// ---------------------------------------------------------------------------
// LENTES — Canonical Engine v3 (alinhado com clearix_lens e clearix_vendas)
// ---------------------------------------------------------------------------

export async function getPremiumFilterOptions(
  params: PremiumFilterParamsV3 = {}
): Promise<PremiumFilterOptions> {
  return callRpc<PremiumFilterOptions>('rpc_premium_filter_options', {
    p_brand:        params.brand        ?? null,
    p_product_line: params.product_line ?? null,
    p_lens_type:    params.lens_type    ?? null,
    p_material_id:  params.material_id  ?? null,
    p_coating:      params.coating      ?? null,
    p_photochromic: params.photochromic ?? null,
    p_treatments:   params.treatments   ?? null,
  })
}

export async function searchPremium(
  params: PremiumSearchParamsV3 = {}
): Promise<CanonicalSearchResultV3<CanonicalPremiumV3>> {
  return callRpc<CanonicalSearchResultV3<CanonicalPremiumV3>>('rpc_premium_search', {
    p_brand:        params.brand        ?? null,
    p_product_line: params.product_line ?? null,
    p_lens_type:    params.lens_type    ?? null,
    p_material_id:  params.material_id  ?? null,
    p_coating:      params.coating      ?? null,
    p_photochromic: params.photochromic ?? null,
    p_spherical:    params.spherical    ?? null,
    p_cylindrical:  params.cylindrical  ?? null,
    p_addition:     params.addition     ?? null,
    p_limit:        params.limit        ?? 50,
    p_offset:       params.offset       ?? 0,
    p_treatments:   params.treatments   ?? null,
    p_price_min:    params.price_min    ?? null,
    p_price_max:    params.price_max    ?? null,
  })
}

export async function getStandardFilterOptions(
  params: StandardFilterParamsV3 = {}
): Promise<StandardFilterOptions> {
  return callRpc<StandardFilterOptions>('rpc_standard_filter_options', {
    p_lens_type:   params.lens_type   ?? null,
    p_material_id: params.material_id ?? null,
    p_treatments:  params.treatments  ?? null,
    p_spherical:   params.spherical   ?? null,
    p_cylindrical: params.cylindrical ?? null,
    p_addition:    params.addition    ?? null,
  })
}

export async function searchStandard(
  params: StandardSearchParamsV3 = {}
): Promise<CanonicalSearchResultV3<CanonicalStandardV3>> {
  return callRpc<CanonicalSearchResultV3<CanonicalStandardV3>>('rpc_standard_search', {
    p_lens_type:   params.lens_type   ?? null,
    p_material_id: params.material_id ?? null,
    p_treatments:  params.treatments  ?? null,
    p_spherical:   params.spherical   ?? null,
    p_cylindrical: params.cylindrical ?? null,
    p_addition:    params.addition    ?? null,
    p_limit:       params.limit       ?? 50,
    p_offset:      params.offset      ?? 0,
    p_price_min:   params.price_min   ?? null,
    p_price_max:   params.price_max   ?? null,
  })
}

export async function searchCanonicalForPrescription(params: {
  spherical?: number
  cylindrical?: number
  addition?: number
  lens_type?: string
  limit?: number
}): Promise<PrescriptionSearchV3Result> {
  return callRpc<PrescriptionSearchV3Result>('rpc_canonical_for_prescription_v3', {
    p_spherical:   params.spherical   ?? null,
    p_cylindrical: params.cylindrical ?? null,
    p_addition:    params.addition    ?? null,
    p_lens_type:   params.lens_type   ?? null,
    p_limit:       params.limit       ?? 20,
  })
}

export async function getCanonicalDetail(
  canonicalId: string,
  isPremium = false
): Promise<CanonicalDetail[]> {
  return callRpc<CanonicalDetail[]>('rpc_canonical_detail', {
    p_canonical_id: canonicalId,
    p_is_premium:   isPremium,
  })
}

// ---------------------------------------------------------------------------
// PACIENTES / PRESCRICOES
// ---------------------------------------------------------------------------

const VIEW_PATIENTS = 'v_clinical_patients'
const VIEW_PRESCRIPTIONS = 'v_clinical_prescriptions'

export async function listPatients(options?: {
  search?: string
  limit?: number
  offset?: number
}): Promise<Patient[]> {
  return fetchView<Patient[]>(VIEW_PATIENTS, {
    search: options?.search ? { column: 'full_name', term: options.search } : undefined,
    order: { column: 'full_name', ascending: true },
    limit: options?.limit,
    offset: options?.offset,
  })
}

export async function getPatient(id: string): Promise<Patient | null> {
  return fetchView<Patient | null>(VIEW_PATIENTS, {
    filters: { id },
    maybeSingle: true,
  })
}

export async function getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
  return fetchView<Prescription[]>(VIEW_PRESCRIPTIONS, {
    filters: { patient_id: patientId },
    order: { column: 'prescription_date', ascending: false },
  })
}

// ---------------------------------------------------------------------------
// SALVAR MEDICOES (PD + Fitting Height)
// ---------------------------------------------------------------------------

export async function saveMeasurements(params: {
  patientId: string
  pdBinocular?: number
  pdRight?: number
  pdLeft?: number
  odHeight?: number
  oeHeight?: number
}): Promise<string> {
  return callRpc<string>('rpc_clinical_upsert_prescription', {
    p_patient_id: params.patientId,
    p_prescription_date: new Date().toISOString().split('T')[0],
    p_interpupillary_distance: params.pdBinocular ?? null,
    p_od_pd: params.pdRight ?? null,
    p_oe_pd: params.pdLeft ?? null,
    p_od_height: params.odHeight ?? null,
    p_oe_height: params.oeHeight ?? null,
  })
}

// ---------------------------------------------------------------------------
// LOJAS
// ---------------------------------------------------------------------------

const VIEW_STORES = 'v_iam_stores'

export async function listStores(): Promise<{ id: string; name: string; address: string | null }[]> {
  return fetchView(VIEW_STORES, {
    order: { column: 'name', ascending: true },
  })
}

// ---------------------------------------------------------------------------
// DASHBOARD METRICS (contagens para cards do dashboard)
// ---------------------------------------------------------------------------

export async function countProducts(): Promise<number> {
  return fetchView<number>(VIEW_PRODUCTS, {
    head: true,
    count: 'estimated',
  })
}

export async function countPatients(): Promise<number> {
  return fetchView<number>(VIEW_PATIENTS, {
    head: true,
    count: 'estimated',
  })
}
