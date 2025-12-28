import './InventoryStatus.css'

function InventoryStatus({ inventory, onUpdateInventory }) {
  const getStatus = (stock) => {
    if (stock === 0) return { text: '품절', className: 'status-out' }
    if (stock < 5) return { text: '주의', className: 'status-warning' }
    return { text: '정상', className: 'status-normal' }
  }

  const handleIncrease = (menuId) => {
    const menu = inventory.find(item => item.menuId === menuId)
    if (menu) {
      onUpdateInventory(menuId, menu.stock + 1)
    }
  }

  const handleDecrease = (menuId) => {
    const menu = inventory.find(item => item.menuId === menuId)
    if (menu && menu.stock > 0) {
      onUpdateInventory(menuId, menu.stock - 1)
    }
  }

  return (
    <div className="inventory-status">
      <h2 className="inventory-title">재고 현황</h2>
      <div className="inventory-grid">
        {inventory.map(item => {
          const status = getStatus(item.stock)
          return (
            <div key={item.menuId} className="inventory-card">
              <h3 className="inventory-menu-name">{item.menuName}</h3>
              <div className="inventory-info">
                <span className="inventory-stock">{item.stock}개</span>
                <span className={`inventory-status-badge ${status.className}`}>
                  {status.text}
                </span>
              </div>
              <div className="inventory-controls">
                <button
                  className="inventory-button decrease"
                  onClick={() => handleDecrease(item.menuId)}
                  disabled={item.stock === 0}
                >
                  -
                </button>
                <button
                  className="inventory-button increase"
                  onClick={() => handleIncrease(item.menuId)}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default InventoryStatus

