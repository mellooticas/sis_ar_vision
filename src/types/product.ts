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

/** Frame model linked to a 3D .glb file via inventory.frame_models */
export interface FrameModel3D {
  id: string
  tenant_id: string
  product_id: string
  model_url: string
  model_format: 'glb' | 'gltf'
  model_metadata: FrameModelMetadata
  preview_image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/** Physical dimensions of the frame (for fit score + fitting height) */
export interface FrameModelMetadata {
  frame_width_mm?: number
  bridge_width_mm?: number
  temple_length_mm?: number
  lens_width_mm?: number
  lens_height_mm?: number
}
