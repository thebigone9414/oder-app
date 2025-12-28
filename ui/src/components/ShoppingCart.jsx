import './ShoppingCart.css'

function ShoppingCart({ cartItems, onOrder, onRemoveItem }) {
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const formatItemName = (item) => {
    const options = item.options || []
    const optionsText = options.length > 0 
      ? ` (${options.map(opt => opt.name).join(', ')})` 
      : ''
    return `${item.menuName}${optionsText}`
  }

  return (
    <div className="shopping-cart">
      <h2 className="cart-title">장바구니</h2>
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p className="cart-empty">장바구니가 비어있습니다.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.cartId || item.menuId} className="cart-item">
              <div className="cart-item-info">
                <span className="cart-item-name">
                  {formatItemName(item)} X {item.quantity}
                </span>
                <span className="cart-item-price">
                  {(item.price * item.quantity).toLocaleString()}원
                </span>
              </div>
              {onRemoveItem && (
                <button 
                  className="remove-item-button"
                  onClick={() => onRemoveItem(item.cartId || item.menuId)}
                  aria-label={`${item.menuName} 삭제`}
                >
                  삭제
                </button>
              )}
            </div>
          ))
        )}
      </div>
      {cartItems.length > 0 && (
        <>
          <div className="cart-total">
            총 금액 <strong>{calculateTotal().toLocaleString()}원</strong>
          </div>
          <button 
            className="order-button"
            onClick={onOrder}
          >
            주문하기
          </button>
        </>
      )}
    </div>
  )
}

export default ShoppingCart

