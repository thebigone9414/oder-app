import './Header.css'

function Header({ currentPage, onNavigate }) {
  return (
    <header className="header">
      <div className="header-logo">COZY</div>
      <div className="header-nav">
        <button 
          className={`nav-button ${currentPage === 'order' ? 'active' : ''}`}
          onClick={() => onNavigate('order')}
          aria-label="주문하기 페이지"
          aria-current={currentPage === 'order' ? 'page' : undefined}
        >
          주문하기
        </button>
        <button 
          className={`nav-button ${currentPage === 'admin' ? 'active' : ''}`}
          onClick={() => onNavigate('admin')}
          aria-label="관리자 페이지"
          aria-current={currentPage === 'admin' ? 'page' : undefined}
        >
          관리자
        </button>
      </div>
    </header>
  )
}

export default Header

