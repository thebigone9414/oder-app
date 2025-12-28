import { useState } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import ShoppingCart from './components/ShoppingCart'
import './App.css'

// 임시 메뉴 데이터
const menuData = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '시원하고 깔끔한 아이스 아메리카노',
    image: null,
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
    image: null,
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
    image: null,
    options: [
      { id: 'shot', name: '샷 추가', price: 500 },
      { id: 'syrup', name: '시럽 추가', price: 0 }
    ]
  }
]

function App() {
  const [currentPage, setCurrentPage] = useState('order')
  const [cartItems, setCartItems] = useState([])

  const handleAddToCart = (item) => {
    setCartItems(prev => {
      // 같은 메뉴와 옵션 조합이 있는지 확인
      const existingIndex = prev.findIndex(
        cartItem => 
          cartItem.menuId === item.menuId &&
          JSON.stringify(cartItem.options.map(o => o.id).sort()) === 
          JSON.stringify(item.options.map(o => o.id).sort())
      )

      if (existingIndex >= 0) {
        // 수량 증가
        const newItems = [...prev]
        newItems[existingIndex].quantity += 1
        return newItems
      } else {
        // 새 아이템 추가
        return [...prev, item]
      }
    })
  }

  const handleRemoveItem = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleOrder = () => {
    if (cartItems.length === 0) return

    // TODO: 백엔드 API 호출
    console.log('주문하기:', cartItems)
    alert('주문이 접수되었습니다!')
    setCartItems([])
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
    // 관리자 페이지는 나중에 구현
    if (page === 'admin') {
      alert('관리자 페이지는 준비 중입니다.')
    }
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

  return (
    <div className="App">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <div className="main-container">
        <p>관리자 페이지는 준비 중입니다.</p>
      </div>
    </div>
  )
}

export default App
