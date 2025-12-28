import pool from '../db/connection.js'
import logger from '../utils/logger.js'

/**
 * 주문 생성
 */
export const createOrder = async (items, totalPrice) => {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // 주문 생성
    const orderQuery = `
      INSERT INTO orders (total_price, status)
      VALUES ($1, 'received')
      RETURNING id, created_at, status, total_price
    `
    
    const orderResult = await client.query(orderQuery, [totalPrice])
    const order = orderResult.rows[0]
    
    // 주문 항목 생성
    const orderItems = []
    for (const item of items) {
      const itemQuery = `
        INSERT INTO order_items (order_id, menu_id, quantity, item_price, options)
        VALUES ($1, $2, $3, $4, $5::jsonb)
        RETURNING id, menu_id, quantity, item_price, options
      `
      
      const itemResult = await client.query(itemQuery, [
        order.id,
        item.menu_id,
        item.quantity,
        item.item_price,
        JSON.stringify(item.options || [])
      ])
      
      orderItems.push(itemResult.rows[0])
    }
    
    await client.query('COMMIT')
    
    // 메뉴 이름 조회
    const menuIds = items.map(item => item.menu_id)
    const menuQuery = `
      SELECT id, name FROM menus WHERE id = ANY($1::int[])
    `
    const menuResult = await client.query(menuQuery, [menuIds])
    const menuMap = new Map(menuResult.rows.map(m => [m.id, m.name]))
    
    // 주문 항목에 메뉴 이름 추가
    const itemsWithMenuName = orderItems.map(item => ({
      ...item,
      menu_name: menuMap.get(item.menu_id),
      options: item.options || []
    }))
    
    return {
      ...order,
      items: itemsWithMenuName
    }
  } catch (error) {
    await client.query('ROLLBACK')
    logger.error('주문 생성 오류:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * 모든 주문 조회
 */
export const getAllOrders = async () => {
  try {
    const orderQuery = `
      SELECT 
        id, created_at, status, total_price
      FROM orders
      ORDER BY created_at DESC
    `
    
    const orderResult = await pool.query(orderQuery)
    const orders = orderResult.rows
    
    // 각 주문의 항목 조회
    const orderItemsQuery = `
      SELECT 
        oi.id,
        oi.order_id,
        oi.menu_id,
        oi.quantity,
        oi.item_price,
        oi.options,
        m.name as menu_name
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      WHERE oi.order_id = ANY($1::int[])
      ORDER BY oi.order_id, oi.id
    `
    
    const orderIds = orders.map(o => o.id)
    let itemsResult = { rows: [] }
    
    if (orderIds.length > 0) {
      itemsResult = await pool.query(orderItemsQuery, [orderIds])
    }
    
    // 주문에 항목 추가
    const ordersWithItems = orders.map(order => {
      const items = itemsResult.rows
        .filter(item => item.order_id === order.id)
        .map(item => ({
          id: item.id,
          menu_id: item.menu_id,
          menu_name: item.menu_name,
          quantity: item.quantity,
          item_price: item.item_price,
          options: item.options || []
        }))
      
      return {
        ...order,
        items
      }
    })
    
    return ordersWithItems
  } catch (error) {
    logger.error('주문 조회 오류:', error)
    throw error
  }
}

/**
 * 특정 주문 조회
 */
export const getOrderById = async (id) => {
  try {
    const orderQuery = `
      SELECT 
        id, created_at, status, total_price
      FROM orders
      WHERE id = $1
    `
    
    const orderResult = await pool.query(orderQuery, [id])
    
    if (orderResult.rows.length === 0) {
      return null
    }
    
    const order = orderResult.rows[0]
    
    // 주문 항목 조회
    const itemsQuery = `
      SELECT 
        oi.id,
        oi.menu_id,
        oi.quantity,
        oi.item_price,
        oi.options,
        m.name as menu_name
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      WHERE oi.order_id = $1
      ORDER BY oi.id
    `
    
    const itemsResult = await pool.query(itemsQuery, [id])
    
    return {
      ...order,
      items: itemsResult.rows.map(item => ({
        id: item.id,
        menu_id: item.menu_id,
        menu_name: item.menu_name,
        quantity: item.quantity,
        item_price: item.item_price,
        options: item.options || []
      }))
    }
  } catch (error) {
    logger.error('주문 조회 오류:', error)
    throw error
  }
}

/**
 * 주문 상태 변경
 */
export const updateOrderStatus = async (id, status) => {
  try {
    // 유효한 상태인지 확인
    const validStatuses = ['received', 'manufacturing', 'completed']
    if (!validStatuses.includes(status)) {
      throw new Error(`유효하지 않은 상태입니다: ${status}`)
    }
    
    // 현재 주문 상태 확인
    const currentOrder = await getOrderById(id)
    if (!currentOrder) {
      return null
    }
    
    // 상태 변경 규칙 검증
    const statusOrder = { received: 1, manufacturing: 2, completed: 3 }
    const currentStatusOrder = statusOrder[currentOrder.status]
    const newStatusOrder = statusOrder[status]
    
    if (newStatusOrder < currentStatusOrder) {
      throw new Error('주문 상태를 이전 상태로 되돌릴 수 없습니다.')
    }
    
    // 상태 업데이트
    const query = `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING id, created_at, status, total_price
    `
    
    const result = await pool.query(query, [status, id])
    const updatedOrder = result.rows[0]
    
    // 주문 항목 조회
    const itemsQuery = `
      SELECT 
        oi.id,
        oi.menu_id,
        oi.quantity,
        oi.item_price,
        oi.options,
        m.name as menu_name
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      WHERE oi.order_id = $1
      ORDER BY oi.id
    `
    
    const itemsResult = await pool.query(itemsQuery, [id])
    
    return {
      ...updatedOrder,
      items: itemsResult.rows.map(item => ({
        id: item.id,
        menu_id: item.menu_id,
        menu_name: item.menu_name,
        quantity: item.quantity,
        item_price: item.item_price,
        options: item.options || []
      }))
    }
  } catch (error) {
    logger.error('주문 상태 변경 오류:', error)
    throw error
  }
}

