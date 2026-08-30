import { API_BASE_URL } from "./env"

export interface Product {
  id: string
  name: string
  description: string | null
  price: string
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  productId: string
}

export interface ProductWithReviews extends Product {
  reviews: Review[]
}

export interface Paginated<T> {
  count: number
  data: T[]
}

export interface ProductInput {
  name: string
  description?: string
  price: number
  image?: string
}

export interface ReviewInput {
  rating: number
  comment?: string
}

export class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string[]>

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  })

  if (res.status === 204) {
    return undefined as T
  }

  const payload = await res.json().catch(() => undefined)

  if (!res.ok) {
    throw new ApiError(
      payload?.message ?? "Something went wrong",
      res.status,
      payload?.errors,
    )
  }

  return payload as T
}

function toQueryString(params: Record<string, number | string | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ""
}

export function getProducts(params: { limit?: number; offset?: number } = {}) {
  return request<Paginated<Product>>(`/products${toQueryString(params)}`)
}

export function getProduct(id: string, params: { reviewsLimit?: number } = {}) {
  return request<ProductWithReviews>(`/products/${id}${toQueryString(params)}`)
}

export function createProduct(input: ProductInput) {
  return request<Product>("/products", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateProduct(id: string, input: Partial<ProductInput>) {
  return request<Product>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function deleteProduct(id: string) {
  return request<void>(`/products/${id}`, { method: "DELETE" })
}

export function getReviews(
  productId: string,
  params: { limit?: number; offset?: number } = {},
) {
  return request<Paginated<Review>>(
    `/products/${productId}/reviews${toQueryString(params)}`,
  )
}

export function createReview(productId: string, input: ReviewInput) {
  return request<Review>(`/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateReview(id: string, input: Partial<ReviewInput>) {
  return request<Review>(`/reviews/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function deleteReview(id: string) {
  return request<void>(`/reviews/${id}`, { method: "DELETE" })
}

export async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append("image", file)
  return request<{ path: string }>("/uploads", {
    method: "POST",
    body: formData,
  })
}
