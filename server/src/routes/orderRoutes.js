import express from 'express'
import * as orderController from '../controllers/orderController.js'

const router = express.Router()

// POST /api/orders - 주문 생성
router.post('/', orderController.createOrder)

// GET /api/orders - 모든 주문 조회
router.get('/', orderController.getAllOrders)

// GET /api/orders/:id - 특정 주문 조회
router.get('/:id', orderController.getOrderById)

// PATCH /api/orders/:id - 주문 상태 변경
router.patch('/:id', orderController.updateOrderStatus)

export default router

