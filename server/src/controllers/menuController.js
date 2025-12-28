import * as menuModel from '../models/menuModel.js'
import logger from '../utils/logger.js'

/**
 * 모든 메뉴 조회
 */
export const getAllMenus = async (req, res, next) => {
  try {
    const menus = await menuModel.getAllMenus()
    res.json(menus)
  } catch (error) {
    logger.error('메뉴 목록 조회 실패:', error)
    next(error)
  }
}

/**
 * 특정 메뉴 조회
 */
export const getMenuById = async (req, res, next) => {
  try {
    const { id } = req.params
    const menu = await menuModel.getMenuById(parseInt(id))
    
    if (!menu) {
      return res.status(404).json({ error: '메뉴를 찾을 수 없습니다.' })
    }
    
    res.json(menu)
  } catch (error) {
    logger.error('메뉴 조회 실패:', error)
    next(error)
  }
}

/**
 * 메뉴 재고 수정
 */
export const updateMenuStock = async (req, res, next) => {
  try {
    const { id } = req.params
    const { stock } = req.body
    
    if (stock === undefined || stock === null) {
      return res.status(400).json({ error: '재고 수량이 필요합니다.' })
    }
    
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: '재고는 0 이상의 숫자여야 합니다.' })
    }
    
    const updatedMenu = await menuModel.updateMenuStock(parseInt(id), stock)
    
    if (!updatedMenu) {
      return res.status(404).json({ error: '메뉴를 찾을 수 없습니다.' })
    }
    
    res.json(updatedMenu)
  } catch (error) {
    logger.error('재고 수정 실패:', error)
    next(error)
  }
}

