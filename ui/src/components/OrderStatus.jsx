import './OrderStatus.css'

function OrderStatus({ orders, onUpdateOrderStatus }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}월 ${day}일 ${hours}:${minutes}`
  }

  const formatOrderItems = (items) => {
    if (!items || items.length === 0) return '주문 항목 없음'
    return items.map(item => {
      const options = item.options || []
      const optionsText = options.length > 0
        ? ` (${options.map(opt => opt.name || opt.name || '옵션').join(', ')})`
        : ''
      return `${item.menuName || '메뉴'}${optionsText} x ${item.quantity || 1}`
    }).join(', ')
  }

  const getStatusButton = (order) => {
    switch (order.status) {
      case 'received':
        return (
          <button
            className="status-button manufacturing"
            onClick={() => onUpdateOrderStatus(order.id, 'manufacturing')}
            aria-label="제조 시작"
          >
            제조 시작
          </button>
        )
      case 'manufacturing':
        return (
          <button
            className="status-button completed"
            onClick={() => onUpdateOrderStatus(order.id, 'completed')}
            aria-label="제조 완료"
          >
            제조 완료
          </button>
        )
      case 'completed':
        return (
          <span className="status-completed-text">제조 완료</span>
        )
      default:
        return null
    }
  }

  const sortedOrders = [...orders].sort((a, b) => {
    // 주문 접수 > 제조 중 > 제조 완료 순서로 정렬
    const statusOrder = { received: 1, manufacturing: 2, completed: 3 }
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    // 같은 상태면 최신순
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return (
    <div className="order-status">
      <h2 className="order-title">주문 현황</h2>
      <div className="order-list">
        {sortedOrders.length === 0 ? (
          <p className="order-empty">주문이 없습니다.</p>
        ) : (
          sortedOrders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-time">{formatDate(order.createdAt)}</div>
              <div className="order-details">
                <div className="order-menu">{formatOrderItems(order.items)}</div>
                <div className="order-price">{order.totalPrice.toLocaleString()}원</div>
              </div>
              <div className="order-action">
                {getStatusButton(order)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default OrderStatus

