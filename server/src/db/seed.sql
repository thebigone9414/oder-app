-- 초기 데이터 삽입

-- Menus 데이터 삽입
INSERT INTO menus (name, description, price, image, stock) VALUES
('아메리카노(ICE)', '시원하고 깔끔한 아이스 아메리카노', 4000, '/americano-ice.jpg', 10),
('아메리카노(HOT)', '따뜻하고 진한 핫 아메리카노', 4000, '/americano-hot.jpg', 10),
('카페라떼', '부드러운 우유와 에스프레소의 조화', 5000, '/caffe-latte.jpg', 10)
ON CONFLICT (name) DO NOTHING;

-- Options 데이터 삽입 (각 메뉴에 공통 옵션 추가)
INSERT INTO options (name, price, menu_id) 
SELECT '샷 추가', 500, id FROM menus WHERE name IN ('아메리카노(ICE)', '아메리카노(HOT)', '카페라떼')
ON CONFLICT DO NOTHING;

INSERT INTO options (name, price, menu_id) 
SELECT '시럽 추가', 0, id FROM menus WHERE name IN ('아메리카노(ICE)', '아메리카노(HOT)', '카페라떼')
ON CONFLICT DO NOTHING;

