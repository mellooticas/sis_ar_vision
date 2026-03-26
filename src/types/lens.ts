export interface CanonicalLens {
  id: string
  tenant_id: string
  name: string
  brand: string | null
  type: string | null
  material: string | null
  coating: string | null
  design: string | null
  index_refraction: number | null
  is_premium: boolean
  price: number | null
  description: string | null
  sph_min: number | null
  sph_max: number | null
  cyl_min: number | null
  cyl_max: number | null
  add_min: number | null
  add_max: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LensOption {
  id: string
  name: string
  brand: string | null
  type: string | null
  material: string | null
  price: number | null
  is_premium: boolean
}

export interface LensPricing {
  lens_id: string
  name: string
  brand: string | null
  price: number | null
  is_premium: boolean
}
