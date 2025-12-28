/**
 * API 호출 유틸리티
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * API 요청 헬퍼 함수
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('API 요청 오류:', error)
    throw error
  }
}

/**
 * 메뉴 API
 */
export const menuAPI = {
  // 모든 메뉴 조회
  getAll: () => request('/menus'),
  
  // 특정 메뉴 조회
  getById: (id) => request(`/menus/${id}`),
  
  // 재고 수정
  updateStock: (id, stock) => request(`/menus/${id}/stock`, {
    method: 'PATCH',
    body: { stock }
  })
}

/**
 * 주문 API
 */
export const orderAPI = {
  // 주문 생성
  create: (orderData) => request('/orders', {
    method: 'POST',
    body: orderData
  }),
  
  // 모든 주문 조회
  getAll: () => request('/orders'),
  
  // 특정 주문 조회
  getById: (id) => request(`/orders/${id}`),
  
  // 주문 상태 변경
  updateStatus: (id, status) => request(`/orders/${id}`, {
    method: 'PATCH',
    body: { status }
  })
}

export default { menuAPI, orderAPI }

