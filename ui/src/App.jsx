import { useState } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import ShoppingCart from './components/ShoppingCart'
import AdminDashboard from './components/AdminDashboard'
import InventoryStatus from './components/InventoryStatus'
import OrderStatus from './components/OrderStatus'
import './App.css'

// 임시 메뉴 데이터
const menuData = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '시원하고 깔끔한 아이스 아메리카노',
    image: '/americano-ice.jpg',
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'syrup', name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '따뜻하고 진한 핫 아메리카노',
    image: '/americano-hot.jpg',
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'syrup', name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드러운 우유와 에스프레소의 조화',
    image: '/caffe-latte.jpg',
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'syrup', name: '시럽 추가', price: 0 }
    ]
  }
]

// 초기 재고 데이터
const initialInventory = [
  { menuId: 1, menuName: '아메리카노(ICE)', stock: 10 },
  { menuId: 2, menuName: '아메리카노(HOT)', stock: 10 },
  { menuId: 3, menuName: '카페라떼', stock: 10 }
]

function App() {
  const [currentPage, setCurrentPage] = useState('order')
  const [cartItems, setCartItems] = useState([])
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState(initialInventory)

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

  const handleOrder = () => {
    if (cartItems.length === 0) return

    // 재고 확인
    const stockCheck = cartItems.every(item => {
      const inventoryItem = inventory.find(inv => inv.menuId === item.menuId)
      return inventoryItem && inventoryItem.stock >= item.quantity
    })

    if (!stockCheck) {
      alert('재고가 부족한 메뉴가 있습니다. 장바구니를 확인해주세요.')
      return
    }

    // 주문 생성
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const newOrder = {
      id: Date.now() + Math.random(), // 고유 ID
      createdAt: new Date().toISOString(),
      status: 'received', // 주문 접수 상태
      items: cartItems.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName,
        quantity: item.quantity,
        options: item.options || []
      })),
      totalPrice: totalPrice
    }

    // 재고 차감
    setInventory(prev =>
      prev.map(invItem => {
        const cartItem = cartItems.find(ci => ci.menuId === invItem.menuId)
        if (cartItem) {
          return { ...invItem, stock: invItem.stock - cartItem.quantity }
        }
        return invItem
      })
    )

    // 주문 목록에 추가
    setOrders(prev => [newOrder, ...prev])

    // 장바구니 초기화
    setCartItems([])
    alert('주문이 접수되었습니다!')
  }

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      )
    )
  }

  const handleUpdateInventory = (menuId, newStock) => {
    setInventory(prev =>
      prev.map(item =>
        item.menuId === menuId
          ? { ...item, stock: newStock }
          : item
      )
    )
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  if (currentPage === 'order') {
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
