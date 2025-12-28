import * as orderModel from '../models/orderModel.js'
import * as menuModel from '../models/menuModel.js'
import logger from '../utils/logger.js'

/**
 * 주문 생성
 */
export const createOrder = async (req, res, next) => {
  try {
    const { items, total_price } = req.body
    
    // 입력 검증
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: '주문 항목이 필요합니다.' })
    }
    
    if (!total_price || typeof total_price !== 'number' || total_price < 0) {
      return res.status(400).json({ error: '유효한 총 금액이 필요합니다.' })
    }
    
    // 각 항목의 재고 확인
    for (const item of items) {
      if (!item.menu_id || !item.quantity || !item.item_price) {
        return res.status(400).json({ error: '주문 항목 정보가 올바르지 않습니다.' })
      }
      
      try {
        await menuModel.checkAndReduceStock(item.menu_id, item.quantity)
      } catch (error) {
        return res.status(400).json({ 
          error: error.message || '재고가 부족합니다.' 
        })
      }
    }
    
    // 주문 생성
    const order = await orderModel.createOrder(items, total_price)
    
    res.status(201).json(order)
  } catch (error) {
    logger.error('주문 생성 실패:', error)
    next(error)
  }
}

/**
 * 모든 주문 조회
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderModel.getAllOrders()
    res.json(orders)
  } catch (error) {
    logger.error('주문 목록 조회 실패:', error)
    next(error)
  }
}

/**
 * 특정 주문 조회
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params
    const order = await orderModel.getOrderById(parseInt(id))
    
    if (!order) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }
    
    res.json(order)
  } catch (error) {
    logger.error('주문 조회 실패:', error)
    next(error)
  }
}

/**
 * 주문 상태 변경
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    if (!status) {
      return res.status(400).json({ error: '주문 상태가 필요합니다.' })
    }
    
    const validStatuses = ['received', 'manufacturing', 'completed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `유효하지 않은 상태입니다. 가능한 값: ${validStatuses.join(', ')}` 
      })
    }
    
    const updatedOrder = await orderModel.updateOrderStatus(parseInt(id), status)
    
    if (!updatedOrder) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }
    
    res.json(updatedOrder)
  } catch (error) {
    if (error.message.includes('이전 상태로 되돌릴 수 없습니다')) {
      return res.status(400).json({ error: error.message })
    }
    logger.error('주문 상태 변경 실패:', error)
    next(error)
  }
}

