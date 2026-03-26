export interface Product {
  id: string
  tenant_id: string
  store_id: string | null
  sku: string | null
  name: string
  brand: string | null
  category: string | null
  subcategory: string | null
  description: string | null
  price: number | null
  cost_price: number | null
  stock_qty: number | null
  min_stock: number | null
  is_active: boolean
  image_url: string | null
  barcode: string | null
  created_at: string
  updated_at: string
}

export interface FrameModel {
  id: string
  name: string
  brand: string | null
  category: string | null
  material: string | null
  color: string | null
  size: string | null
  bridge_width: number | null
  lens_width: number | null
  temple_length: number | null
  model_3d_url: string | null
  image_url: string | null
  is_active: boolean
}
