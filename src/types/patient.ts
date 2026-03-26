export interface Patient {
  id: string
  tenant_id: string
  full_name: string
  cpf: string | null
  phone: string | null
  email: string | null
  birth_date: string | null
  gender: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Prescription {
  id: string
  tenant_id: string
  patient_id: string
  patient_name: string | null
  prescribed_by: string | null
  prescription_date: string | null
  expiry_date: string | null
  od_sph: number | null
  od_cyl: number | null
  od_axis: number | null
  od_add: number | null
  oe_sph: number | null
  oe_cyl: number | null
  oe_axis: number | null
  oe_add: number | null
  pd_right: number | null
  pd_left: number | null
  pd_binocular: number | null
  od_height: number | null
  oe_height: number | null
  vision_type: string | null
  frame_size: number | null
  notes: string | null
  created_at: string
  updated_at: string
}
