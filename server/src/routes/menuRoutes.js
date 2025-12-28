import express from 'express'
import * as menuController from '../controllers/menuController.js'

const router = express.Router()

// GET /api/menus - 모든 메뉴 조회
router.get('/', menuController.getAllMenus)

// GET /api/menus/:id - 특정 메뉴 조회
router.get('/:id', menuController.getMenuById)

// PATCH /api/menus/:id/stock - 재고 수정
router.patch('/:id/stock', menuController.updateMenuStock)

export default router

