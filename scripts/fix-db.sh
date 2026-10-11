docker exec reservation_system_postgres_1 psql postgresql://bookfair:your_secure_postgres_password_here@localhost:5432/bookfair -c "ALTER USER bookfair WITH PASSWORD '18499';"
docker restart reservation_system_backend_1
