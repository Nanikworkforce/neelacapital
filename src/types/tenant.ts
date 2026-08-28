export type TenantProperty = {
  id: number
  name: string
  address: string
  city: string
  state: string
  price: string
  bedrooms: number
  bathrooms: string
  square_footage: number
  display_image: string
  image: string
  image_url: string
  furnishing_type: string
  status: 'vacant' | 'occupied' | 'coming_soon' | string
  area: string
}
