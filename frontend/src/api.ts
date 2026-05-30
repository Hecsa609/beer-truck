const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const getToken = () => localStorage.getItem('beer_truck_token')

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
})

const handleResponse = async (res: Response) => {
  if (res.status === 401) {
    localStorage.removeItem('beer_truck_token')
    localStorage.removeItem('beer_truck_user')
    window.location.reload()
    throw new Error('Sesión expirada')
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Error del servidor')
  return data
}

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

export const productsAPI = {
  getAll: async () => handleResponse(await fetch(`${API_URL}/products`, { headers: authHeaders() })),
  getById: async (id: string) => handleResponse(await fetch(`${API_URL}/products/${id}`, { headers: authHeaders() })),
  create: async (product: any) => handleResponse(await fetch(`${API_URL}/products`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(product)
  })),
  update: async (id: string, product: any) => handleResponse(await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(product)
  })),
  updateStock: async (id: string, quantity: number, movement_type: string, notes?: string) =>
    handleResponse(await fetch(`${API_URL}/products/${id}/stock`, {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify({ quantity, movement_type, notes })
    }))
}

export const customersAPI = {
  getAll: async () => handleResponse(await fetch(`${API_URL}/customers`, { headers: authHeaders() })),
  getById: async (id: string) => handleResponse(await fetch(`${API_URL}/customers/${id}`, { headers: authHeaders() })),
  create: async (customer: any) => handleResponse(await fetch(`${API_URL}/customers`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(customer)
  })),
  update: async (id: string, customer: any) => handleResponse(await fetch(`${API_URL}/customers/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(customer)
  }))
}

export const eventsAPI = {
  getAll: async (filters?: any) => {
    const params = filters ? new URLSearchParams(filters).toString() : ''
    return handleResponse(await fetch(`${API_URL}/events${params ? '?' + params : ''}`, { headers: authHeaders() }))
  },
  getById: async (id: string) => handleResponse(await fetch(`${API_URL}/events/${id}`, { headers: authHeaders() })),
  create: async (event: any) => handleResponse(await fetch(`${API_URL}/events`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(event)
  })),
  updateStatus: async (id: string, status: string) => handleResponse(await fetch(`${API_URL}/events/${id}/status`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status })
  }))
}

export const salesAPI = {
  getAll: async (filters?: any) => {
    const params = filters ? new URLSearchParams(filters).toString() : ''
    return handleResponse(await fetch(`${API_URL}/sales${params ? '?' + params : ''}`, { headers: authHeaders() }))
  },
  getById: async (id: string) => handleResponse(await fetch(`${API_URL}/sales/${id}`, { headers: authHeaders() })),
  create: async (sale: any) => handleResponse(await fetch(`${API_URL}/sales`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(sale)
  })),
  getDailySummary: async () => handleResponse(await fetch(`${API_URL}/sales/summary/today`, { headers: authHeaders() }))
}