const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Obtener token guardado
const getToken = () => localStorage.getItem('beer_truck_token')

// Headers con autenticación
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
})

// =============================================
// AUTH
// =============================================
export const authAPI = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    localStorage.setItem('beer_truck_token', data.token)
    localStorage.setItem('beer_truck_user', JSON.stringify(data.user))
    return data
  },

  logout: () => {
    localStorage.removeItem('beer_truck_token')
    localStorage.removeItem('beer_truck_user')
  },

  getUser: () => {
    const user = localStorage.getItem('beer_truck_user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: () => !!getToken()
}

// =============================================
// PRODUCTS
// =============================================
export const productsAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/products`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/products/${id}`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  },

  create: async (product: any) => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(product)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  },

  update: async (id: string, product: any) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(product)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  },

  updateStock: async (id: string, quantity: number, movement_type: string, notes?: string) => {
    const res = await fetch(`${API_URL}/products/${id}/stock`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ quantity, movement_type, notes })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }
}

// =============================================
// CUSTOMERS
// =============================================
export const customersAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/customers`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/customers/${id}`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  },

  create: async (customer: any) => {
    const res = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(customer)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  },

  update: async (id: string, customer: any) => {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(customer)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }
}

// =============================================
// EVENTS
// =============================================
export const eventsAPI = {
  getAll: async (filters?: { status?: string, from?: string, to?: string }) => {
    const params = new URLSearchParams(filters as any).toString()
    const res = await fetch(`${API_URL}/events${params ? '?' + params : ''}`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/events/${id}`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  },

  create: async (event: any) => {
    const res = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(event)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  },

  updateStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/events/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }
}

// =============================================
// SALES
// =============================================
export const salesAPI = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams(filters).toString()
    const res = await fetch(`${API_URL}/sales${params ? '?' + params : ''}`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/sales/${id}`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  },

  create: async (sale: any) => {
    const res = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(sale)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  },

  getDailySummary: async () => {
    const res = await fetch(`${API_URL}/sales/summary/today`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    return data
  }
}