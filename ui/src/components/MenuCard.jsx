import { useState } from 'react'
import './MenuCard.css'

function MenuCard({ menu, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([])

  const handleOptionChange = (optionId) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId)
      } else {
        return [...prev, optionId]
      }
    })
  }

  const calculatePrice = () => {
    const basePrice = menu.price
    const optionsPrice = menu.options
      .filter(opt => selectedOptions.includes(opt.id))
      .reduce((sum, opt) => sum + opt.price, 0)
    return basePrice + optionsPrice
  }

  const handleAddToCartClick = () => {
    const item = {
      menuId: menu.id,
      menuName: menu.name,
      price: calculatePrice(),
      options: menu.options.filter(opt => selectedOptions.includes(opt.id)),
      quantity: 1
    }
    onAddToCart(item)
    // 옵션 초기화
    setSelectedOptions([])
  }

  return (
    <div className="menu-card">
      <div className="menu-image">
        {menu.image ? (
          <img src={menu.image} alt={menu.name} />
        ) : (
          <div className="image-placeholder">이미지</div>
        )}
      </div>
      <div className="menu-info">
        <h3 className="menu-name">{menu.name}</h3>
        <p className="menu-price">{calculatePrice().toLocaleString()}원</p>
        <p className="menu-description">{menu.description}</p>
        <div className="menu-options">
          {menu.options.map(option => (
            <label key={option.id} className="option-checkbox">
              <input
                type="checkbox"
                checked={selectedOptions.includes(option.id)}
                onChange={() => handleOptionChange(option.id)}
                aria-label={option.name}
              />
              <span>{option.name} {option.price > 0 && `(+${option.price.toLocaleString()}원)`}</span>
            </label>
          ))}
        </div>
        <button 
          className="add-to-cart-button" 
          onClick={handleAddToCartClick}
          aria-label={`${menu.name} 담기`}
        >
          담기
        </button>
      </div>
    </div>
  )
}

export default MenuCard

