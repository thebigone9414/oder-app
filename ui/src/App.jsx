import { useState, useEffect } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import ShoppingCart from './components/ShoppingCart'
import AdminDashboard from './components/AdminDashboard'
import InventoryStatus from './components/InventoryStatus'
import OrderStatus from './components/OrderStatus'
import { menuAPI, orderAPI } from './utils/api'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('order')
  const [cartItems, setCartItems] = useState([])
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [menuData, setMenuData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 메뉴 데이터 로드
  useEffect(() => {
    const loadMenus = async () => {
      try {
        setLoading(true)
        const menus = await menuAPI.getAll()
        setMenuData(menus)
        
        // 재고 정보 추출
        const inventoryData = menus.map(menu => ({
          menuId: menu.id,
          menuName: menu.name,
          stock: menu.stock
        }))
        setInventory(inventoryData)
        setError(null)
      } catch (err) {
        console.error('메뉴 로드 실패:', err)
        setError('메뉴를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }
    
    loadMenus()
  }, [])

  // 주문 데이터 로드 (관리자 화면)
  useEffect(() => {
    if (currentPage === 'admin') {
      const loadData = async () => {
        try {
          // 주문 데이터 로드
          const ordersData = await orderAPI.getAll()
          // API 응답을 프런트엔드 형식으로 변환
          const convertedOrders = ordersData.map(order => ({
            ...order,
            createdAt: order.created_at || order.createdAt,
            totalPrice: order.total_price || order.totalPrice
          }))
          setOrders(convertedOrders)
          
          // 재고 정보도 새로고침
          const menus = await menuAPI.getAll()
          const inventoryData = menus.map(menu => ({
            menuId: menu.id,
            menuName: menu.name,
            stock: menu.stock
          }))
          setInventory(inventoryData)
        } catch (err) {
          console.error('데이터 로드 실패:', err)
        }
      }
      
      loadData()
    }
  }, [currentPage])

  const handleAddToCart = (item) => {
    // 재고 확인
    const inventoryItem = inventory.find(inv => inv.menuId === item.menuId)
    if (!inventoryItem || inventoryItem.stock <= 0) {
      alert('재고가 부족합니다.')
      return
    }

    setCartItems(prev => {
      // 같은 메뉴와 옵션 조합이 있는지 확인 (더 효율적인 비교)
      const optionIds1 = item.options.map(o => o.id).sort().join(',')
      const existingIndex = prev.findIndex(
        cartItem => {
          const optionIds2 = cartItem.options.map(o => o.id).sort().join(',')
          return cartItem.menuId === item.menuId && optionIds1 === optionIds2
        }
      )

      if (existingIndex >= 0) {
        // 수량 증가 (재고 확인)
        const currentQuantity = prev[existingIndex].quantity
        if (currentQuantity >= inventoryItem.stock) {
          alert('재고가 부족합니다.')
          return prev
        }
        const newItems = [...prev]
        newItems[existingIndex].quantity += 1
        return newItems
      } else {
        // 새 아이템 추가
        return [...prev, { ...item, cartId: Date.now() + Math.random() }]
      }
    })
  }

  const handleRemoveItem = (cartId) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId))
  }

  const handleOrder = async () => {
    if (cartItems.length === 0) return

    try {
      // 주문 데이터 준비
      const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const orderData = {
        items: cartItems.map(item => ({
          menu_id: item.menuId,
          quantity: item.quantity,
          options: item.options || [],
          item_price: item.price
        })),
        total_price: totalPrice
      }

      // API 호출
      const newOrder = await orderAPI.create(orderData)

      // 재고 정보 새로고침
      const menus = await menuAPI.getAll()
      const inventoryData = menus.map(menu => ({
        menuId: menu.id,
        menuName: menu.name,
        stock: menu.stock
      }))
      setInventory(inventoryData)

      // 장바구니 초기화
      setCartItems([])
      alert('주문이 접수되었습니다!')
      
      // 관리자 화면이면 주문 목록 새로고침
      if (currentPage === 'admin') {
        const ordersData = await orderAPI.getAll()
        const convertedOrders = ordersData.map(order => ({
          ...order,
          createdAt: order.created_at || order.createdAt,
          totalPrice: order.total_price || order.totalPrice
        }))
        setOrders(convertedOrders)
      }
    } catch (err) {
      console.error('주문 실패:', err)
      alert(err.message || '주문 처리 중 오류가 발생했습니다.')
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const updatedOrder = await orderAPI.updateStatus(orderId, newStatus)
      // API 응답을 프런트엔드 형식으로 변환
      const convertedOrder = {
        ...updatedOrder,
        createdAt: updatedOrder.created_at || updatedOrder.createdAt,
        totalPrice: updatedOrder.total_price || updatedOrder.totalPrice
      }
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? convertedOrder
            : order
        )
      )
    } catch (err) {
      console.error('주문 상태 변경 실패:', err)
      alert(err.message || '주문 상태 변경 중 오류가 발생했습니다.')
    }
  }

  const handleUpdateInventory = async (menuId, newStock) => {
    try {
      await menuAPI.updateStock(menuId, newStock)
      setInventory(prev =>
        prev.map(item =>
          item.menuId === menuId
            ? { ...item, stock: newStock }
            : item
        )
      )
    } catch (err) {
      console.error('재고 수정 실패:', err)
      alert(err.message || '재고 수정 중 오류가 발생했습니다.')
    }
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  if (currentPage === 'order') {
    if (loading) {
      return (
        <div className="App">
          <Header currentPage={currentPage} onNavigate={handleNavigate} />
          <div className="main-container">
            <p>메뉴를 불러오는 중...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="App">
          <Header currentPage={currentPage} onNavigate={handleNavigate} />
          <div className="main-container">
            <p style={{ color: 'red' }}>{error}</p>
            <button onClick={() => window.location.reload()}>다시 시도</button>
          </div>
        </div>
      )
    }

    return (
      <div className="App">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="main-container">
          <div className="menu-section">
            <h2 className="section-title">메뉴</h2>
            <div className="menu-grid">
              {menuData.map(menu => (
                <MenuCard 
                  key={menu.id} 
                  menu={menu} 
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
          <div className="cart-section">
            <ShoppingCart 
              cartItems={cartItems}
              onOrder={handleOrder}
              onRemoveItem={handleRemoveItem}
            />
          </div>
        </div>
      </div>
    )
  }

  // 관리자 화면
  return (
    <div className="App">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <div className="admin-container">
        <AdminDashboard orders={orders} />
        <InventoryStatus 
          inventory={inventory}
          onUpdateInventory={handleUpdateInventory}
        />
        <OrderStatus 
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      </div>
    </div>
  )
}

export default App
