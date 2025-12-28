import pool from '../db/connection.js'
import logger from '../utils/logger.js'

/**
 * 모든 메뉴 조회 (옵션 포함)
 */
export const getAllMenus = async () => {
  try {
    const menuQuery = `
      SELECT 
        id, name, description, price, image, stock
      FROM menus
      ORDER BY id
    `
    
    const optionQuery = `
      SELECT 
        id, name, price, menu_id
      FROM options
      ORDER BY menu_id, id
    `
    
    const [menuResult, optionResult] = await Promise.all([
      pool.query(menuQuery),
      pool.query(optionQuery)
    ])
    
    const menus = menuResult.rows
    const options = optionResult.rows
    
    // 메뉴에 옵션 추가
    const menusWithOptions = menus.map(menu => ({
      ...menu,
      options: options.filter(opt => opt.menu_id === menu.id).map(opt => ({
        id: opt.id,
        name: opt.name,
        price: opt.price
      }))
    }))
    
    return menusWithOptions
  } catch (error) {
    logger.error('메뉴 조회 오류:', error)
    throw error
  }
}

/**
 * 특정 메뉴 조회 (옵션 포함)
 */
export const getMenuById = async (id) => {
  try {
    const menuQuery = `
      SELECT 
        id, name, description, price, image, stock
      FROM menus
      WHERE id = $1
    `
    
    const menuResult = await pool.query(menuQuery, [id])
    
    if (menuResult.rows.length === 0) {
      return null
    }
    
    const menu = menuResult.rows[0]
    
    // 옵션 조회
    const optionQuery = `
      SELECT 
        id, name, price
      FROM options
      WHERE menu_id = $1
      ORDER BY id
    `
    
    const optionResult = await pool.query(optionQuery, [id])
    
    return {
      ...menu,
      options: optionResult.rows
    }
  } catch (error) {
    logger.error('메뉴 조회 오류:', error)
    throw error
  }
}

/**
 * 메뉴 재고 수정
 */
export const updateMenuStock = async (id, stock) => {
  try {
    if (stock < 0) {
      throw new Error('재고는 0 이상이어야 합니다.')
    }
    
    const query = `
      UPDATE menus
      SET stock = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, stock
    `
    
    const result = await pool.query(query, [stock, id])
    
    if (result.rows.length === 0) {
      return null
    }
    
    return result.rows[0]
  } catch (error) {
    logger.error('재고 수정 오류:', error)
    throw error
  }
}

/**
 * 메뉴 재고 확인 및 차감
 */
export const checkAndReduceStock = async (menuId, quantity) => {
  try {
    // 트랜잭션 시작
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      // 현재 재고 확인
      const checkQuery = 'SELECT stock FROM menus WHERE id = $1 FOR UPDATE'
      const checkResult = await client.query(checkQuery, [menuId])
      
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK')
        throw new Error(`메뉴 ID ${menuId}를 찾을 수 없습니다.`)
      }
      
      const currentStock = checkResult.rows[0].stock
      
      if (currentStock < quantity) {
        await client.query('ROLLBACK')
        throw new Error(`재고가 부족합니다. (현재: ${currentStock}, 요청: ${quantity})`)
      }
      
      // 재고 차감
      const updateQuery = `
        UPDATE menus
        SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, name, stock
      `
      
      const updateResult = await client.query(updateQuery, [quantity, menuId])
      
      await client.query('COMMIT')
      
      return updateResult.rows[0]
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    logger.error('재고 확인 및 차감 오류:', error)
    throw error
  }
}

