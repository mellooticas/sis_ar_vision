/**
 * Tipos de Lentes — Canonical Engine v3
 *
 * Alinhados com clearix_lens e clearix_vendas.
 * RPCs: rpc_premium_filter_options, rpc_premium_search,
 *       rpc_standard_filter_options, rpc_standard_search,
 *       rpc_canonical_for_prescription_v3, rpc_canonical_detail
 */

// ── Filter option types ─────────────────────────────────────────────────────

export interface FilterOptionV3 {
  value: string
  count: number
}

export interface MaterialFilterOptionV3 {
  id: string
  name: string
  index: number
  count: number
  class?: string
}

export interface TreatmentFilterOption {
  code: string
  count: number
}

export interface PriceRange {
  min: number
  max: number
  avg: number
}

// ── Filter options (RPC response) ───────────────────────────────────────────

export interface PremiumFilterOptions {
  brands: FilterOptionV3[] | null
  product_lines: FilterOptionV3[] | null
  lens_types: FilterOptionV3[] | null
  materials: MaterialFilterOptionV3[] | null
  coatings: FilterOptionV3[] | null
  photochromics: FilterOptionV3[] | null
  treatments: TreatmentFilterOption[] | null
  price_range: PriceRange | null
  total_count: number
}

export interface StandardFilterOptions {
  lens_types: FilterOptionV3[] | null
  materials: MaterialFilterOptionV3[] | null
  treatments: TreatmentFilterOption[] | null
  supplier_range: { min_suppliers: number; max_suppliers: number } | null
  prescription_ranges: {
    sph_min: number; sph_max: number
    cyl_min: number; cyl_max: number
    add_min: number | null; add_max: number | null
  } | null
  price_range: PriceRange | null
  total_count: number
}

// ── Filter params ───────────────────────────────────────────────────────────

export interface PremiumFilterParamsV3 {
  brand?: string
  product_line?: string
  lens_type?: string
  material_id?: string
  coating?: string
  photochromic?: string
  treatments?: string[]
}

export interface PremiumSearchParamsV3 extends PremiumFilterParamsV3 {
  spherical?: number
  cylindrical?: number
  addition?: number
  price_min?: number
  price_max?: number
  limit?: number
  offset?: number
}

export interface StandardFilterParamsV3 {
  lens_type?: string
  material_id?: string
  treatments?: string[]
  spherical?: number
  cylindrical?: number
  addition?: number
}

export interface StandardSearchParamsV3 extends StandardFilterParamsV3 {
  price_min?: number
  price_max?: number
  limit?: number
  offset?: number
}

// ── Canonical result types ──────────────────────────────────────────────────

export interface CanonicalPremiumV3 {
  id: string
  canonical_name: string
  sku: string | null
  brand: string
  product_line: string | null
  coating_name: string | null
  photochromic_type: string | null
  lens_type: string
  canonical_material_id: string
  material_name: string
  material_class: string
  refractive_index: number
  spherical_min: number | null
  spherical_max: number | null
  cylindrical_min: number | null
  cylindrical_max: number | null
  addition_min: number | null
  addition_max: number | null
  treatment_codes: string[]
  mapped_lens_count: number
  mapped_supplier_count: number
  mapped_brand_count: number
  price_min: number | null
  price_max: number | null
  price_avg: number | null
  fingerprint: string
  created_at: string
  updated_at: string
}

export interface CanonicalStandardV3 {
  id: string
  canonical_name: string
  sku: string | null
  lens_type: string
  canonical_material_id: string
  material_name: string
  material_class: string
  refractive_index: number
  spherical_min: number | null
  spherical_max: number | null
  cylindrical_min: number | null
  cylindrical_max: number | null
  addition_min: number | null
  addition_max: number | null
  treatment_codes: string[]
  mapped_lens_count: number
  mapped_supplier_count: number
  price_min: number | null
  price_max: number | null
  price_avg: number | null
  fingerprint: string
  created_at: string
  updated_at: string
}

export interface CanonicalSearchResultV3<T> {
  total: number
  items: T[]
}

export interface PrescriptionSearchV3Result {
  premium: CanonicalPremiumV3[]
  standard: CanonicalStandardV3[]
  premium_total: number
  standard_total: number
}

export interface CanonicalDetail {
  lens_id: string
  lens_sku: string | null
  lens_name: string
  brand_name: string | null
  supplier_name: string
  sell_price: number | null
  cost_price: number | null
  final_price: number | null
  effective_markup: number | null
  is_preferred: boolean
  match_method: string | null
}
