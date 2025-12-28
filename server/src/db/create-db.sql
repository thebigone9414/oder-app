-- 데이터베이스 생성 스크립트
-- PostgreSQL에 접속하여 실행하세요: psql -U postgres -f create-db.sql

-- 데이터베이스가 존재하지 않으면 생성
SELECT 'CREATE DATABASE order_app'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'order_app')\gexec

-- 데이터베이스에 연결
\c order_app

