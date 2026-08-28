-- ============================================================================
-- SECURE STALL RESERVATION SYSTEM: Database Creation & Seed Script
-- Compatible with PostgreSQL 15+ / 16+
-- ============================================================================

-- 1. Create Schema and Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS check_in_logs CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS physical_constraints CASCADE;
DROP TABLE IF EXISTS map_influences CASCADE;
DROP TABLE IF EXISTS map_zones CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS event_stalls CASCADE;
DROP TABLE IF EXISTS stall_templates CASCADE;
DROP TABLE IF EXISTS hall_allowed_categories CASCADE;
DROP TABLE IF EXISTS halls CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS user_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Create Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    business_name VARCHAR(255),
    business_description TEXT,
    logo_url VARCHAR(255),
    contact_number VARCHAR(100),
    address VARCHAR(255),
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_business ON users(business_name);

CREATE TABLE user_categories (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id, category)
);

-- 4. Create Venues, Buildings, and Halls
CREATE TABLE venues (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    deleted_at TIMESTAMP
);

CREATE TABLE buildings (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    gps_location VARCHAR(255),
    deleted_at TIMESTAMP
);

CREATE TABLE halls (
    id BIGSERIAL PRIMARY KEY,
    building_id BIGINT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    total_sq_ft DOUBLE PRECISION,
    capacity INTEGER,
    tier VARCHAR(50),
    floor_level INTEGER,
    status VARCHAR(50),
    ceiling_height DOUBLE PRECISION,
    is_indoor BOOLEAN,
    is_air_conditioned BOOLEAN,
    expected_footfall INTEGER,
    noise_level VARCHAR(50),
    nearby_facilities VARCHAR(255),
    distance_from_entrance DOUBLE PRECISION,
    distance_from_parking DOUBLE PRECISION,
    is_ground_floor BOOLEAN,
    main_category VARCHAR(100),
    deleted_at TIMESTAMP
);

CREATE TABLE hall_allowed_categories (
    hall_id BIGINT NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    PRIMARY KEY (hall_id, category)
);

CREATE TABLE physical_constraints (
    id BIGSERIAL PRIMARY KEY,
    hall_id BIGINT NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    pos_x DOUBLE PRECISION NOT NULL,
    pos_y DOUBLE PRECISION NOT NULL,
    width DOUBLE PRECISION NOT NULL,
    height DOUBLE PRECISION NOT NULL,
    label VARCHAR(255)
);

-- 5. Create Events, Stall Templates, and Event Stalls
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    venue_id BIGINT REFERENCES venues(id),
    map_url TEXT,
    map_width DOUBLE PRECISION,
    map_height DOUBLE PRECISION,
    status VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stall_templates (
    id BIGSERIAL PRIMARY KEY,
    hall_id BIGINT NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    sq_ft DOUBLE PRECISION,
    base_price_cents BIGINT,
    image_url VARCHAR(1000),
    is_available BOOLEAN DEFAULT TRUE,
    default_proximity_score INTEGER NOT NULL DEFAULT 50,
    pos_x DOUBLE PRECISION,
    pos_y DOUBLE PRECISION,
    width DOUBLE PRECISION,
    height DOUBLE PRECISION,
    deleted_at TIMESTAMP
);

CREATE TABLE event_stalls (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    template_id BIGINT NOT NULL REFERENCES stall_templates(id) ON DELETE CASCADE,
    base_rate_cents BIGINT NOT NULL,
    multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    proximity_bonus_cents BIGINT NOT NULL DEFAULT 0,
    final_price_cents BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    pricing_version VARCHAR(50),
    pos_x DOUBLE PRECISION,
    pos_y DOUBLE PRECISION,
    width DOUBLE PRECISION,
    height DOUBLE PRECISION,
    deleted_at TIMESTAMP,
    CONSTRAINT uq_event_template UNIQUE (event_id, template_id)
);

CREATE INDEX idx_event_stalls_event ON event_stalls(event_id);
CREATE INDEX idx_event_stalls_template ON event_stalls(template_id);

CREATE TABLE map_zones (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    hall_name VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    pos_x DOUBLE PRECISION NOT NULL,
    pos_y DOUBLE PRECISION NOT NULL,
    width DOUBLE PRECISION NOT NULL,
    height DOUBLE PRECISION NOT NULL,
    label VARCHAR(255)
);

CREATE TABLE map_influences (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    hall_name VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    pos_x DOUBLE PRECISION NOT NULL,
    pos_y DOUBLE PRECISION NOT NULL,
    radius DOUBLE PRECISION NOT NULL,
    intensity DOUBLE PRECISION NOT NULL,
    falloff VARCHAR(50)
);

-- 6. Create Reservations Table
CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_stall_id BIGINT NOT NULL REFERENCES event_stalls(id) ON DELETE CASCADE,
    payment_id VARCHAR(255),
    qr_code VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_PAYMENT',
    email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    business_category VARCHAR(100),
    special_requirements TEXT,
    reservation_date DATE,
    stall_type VARCHAR(50),
    preferred_size VARCHAR(50),
    reminder_sent_at TIMESTAMP,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_stall ON reservations(event_stall_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_qr ON reservations(qr_code);

-- 7. Audit Logs, Notifications, Password Reset
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expiry_date TIMESTAMP NOT NULL
);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Seed Users (Password: admin123 and vendor123 bcrypt-hashed)
INSERT INTO users (id, username, full_name, email, password, role, business_name, business_description, contact_number, address)
VALUES 
(1, 'organizer', 'Exhibition Organizer', 'organizer@bookfair.lk', '$2a$10$wN1r1l8b5w.kHn4PzG7H1eWqV9zGk.B/zE2P4G8H.W1eR7V3B5Z2a', 'ORGANIZER', 'BMICH Events Authority', 'Main Exhibition & Event Management Team', '+94 11 269 1111', 'Bauddhaloka Mawatha, Colombo 07'),
(2, 'admin', 'System Administrator', 'admin@bookfair.lk', '$2a$10$wN1r1l8b5w.kHn4PzG7H1eWqV9zGk.B/zE2P4G8H.W1eR7V3B5Z2a', 'ADMIN', 'Bookfair Platform Operations', 'Core Platform Admin', '+94 11 200 0000', 'Colombo 07'),
(3, 'vendor', 'Sarasavi Publishers', 'vendor@sarasavi.lk', '$2a$10$wN1r1l8b5w.kHn4PzG7H1eWqV9zGk.B/zE2P4G8H.W1eR7V3B5Z2a', 'VENDOR', 'Sarasavi Bookshop Ltd', 'Leading publisher of Fiction, Non-Fiction, and Educational Books', '+94 11 282 0830', 'Nugegoda, Colombo')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for users
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Seed Venue & Building
INSERT INTO venues (id, name, address)
VALUES (1, 'BMICH Colombo', 'Bauddhaloka Mawatha, Colombo 07, Sri Lanka')
ON CONFLICT (id) DO NOTHING;

INSERT INTO buildings (id, venue_id, name, gps_location)
VALUES (1, 1, 'Sirimavo Bandaranaike Exhibition Centre', '6.9011,79.8736')
ON CONFLICT (id) DO NOTHING;

-- Seed Hall
INSERT INTO halls (id, building_id, name, total_sq_ft, capacity, tier, floor_level, status, is_indoor, is_air_conditioned, main_category)
VALUES (1, 1, 'Main Exhibition Hall A', 25000, 5000, 'VIP', 1, 'PUBLISHED', true, true, 'FICTION')
ON CONFLICT (id) DO NOTHING;

-- Seed Event
INSERT INTO events (id, name, description, start_date, end_date, location, venue_id, map_width, map_height, status)
VALUES (1, 'Colombo International Book Fair 2026', 'Sri Lanka''s premier annual international book exhibition with over 100 stalls, author forums, and cultural events.', '2026-09-18 09:00:00', '2026-09-27 20:00:00', 'Sirimavo Bandaranaike Memorial Exhibition Centre, Colombo', 1, 1000, 600, 'OPEN')
ON CONFLICT (id) DO NOTHING;

-- Seed Stall Templates (10 representative stalls in Hall A)
INSERT INTO stall_templates (id, hall_id, name, size, type, category, sq_ft, base_price_cents, is_available, default_proximity_score, pos_x, pos_y, width, height) VALUES
(1, 1, 'A-01', 'LARGE', 'PREMIUM', 'RETAIL', 200, 2000000, true, 90, 50, 50, 80, 60),
(2, 1, 'A-02', 'LARGE', 'PREMIUM', 'RETAIL', 200, 2000000, true, 85, 150, 50, 80, 60),
(3, 1, 'A-03', 'MEDIUM', 'STANDARD', 'RETAIL', 120, 1000000, true, 70, 250, 50, 60, 50),
(4, 1, 'A-04', 'MEDIUM', 'STANDARD', 'RETAIL', 120, 1000000, true, 70, 330, 50, 60, 50),
(5, 1, 'A-05', 'SMALL', 'STANDARD', 'RETAIL', 80, 500000, true, 60, 410, 50, 50, 40),
(6, 1, 'A-06', 'SMALL', 'STANDARD', 'RETAIL', 80, 500000, true, 60, 480, 50, 50, 40),
(7, 1, 'A-07', 'MEDIUM', 'CORNER', 'RETAIL', 120, 1200000, true, 75, 50, 150, 60, 50),
(8, 1, 'A-08', 'MEDIUM', 'CORNER', 'RETAIL', 120, 1200000, true, 75, 130, 150, 60, 50),
(9, 1, 'A-09', 'LARGE', 'CORNER', 'RETAIL', 200, 2200000, true, 80, 210, 150, 80, 60),
(10, 1, 'A-10', 'SMALL', 'STANDARD', 'RETAIL', 80, 500000, true, 55, 310, 150, 50, 40)
ON CONFLICT (id) DO NOTHING;

-- Seed Event Stalls
INSERT INTO event_stalls (id, event_id, template_id, base_rate_cents, multiplier, proximity_bonus_cents, final_price_cents, status, pos_x, pos_y, width, height) VALUES
(1, 1, 1, 2000000, 1.2, 200000, 2600000, 'AVAILABLE', 50, 50, 80, 60),
(2, 1, 2, 2000000, 1.2, 150000, 2550000, 'AVAILABLE', 150, 50, 80, 60),
(3, 1, 3, 1000000, 1.0, 50000, 1050000, 'AVAILABLE', 250, 50, 60, 50),
(4, 1, 4, 1000000, 1.0, 50000, 1050000, 'AVAILABLE', 330, 50, 60, 50),
(5, 1, 5, 500000, 1.0, 0, 500000, 'AVAILABLE', 410, 50, 50, 40),
(6, 1, 6, 500000, 1.0, 0, 500000, 'AVAILABLE', 480, 50, 50, 40),
(7, 1, 7, 1200000, 1.1, 100000, 1420000, 'AVAILABLE', 50, 150, 60, 50),
(8, 1, 8, 1200000, 1.1, 100000, 1420000, 'AVAILABLE', 130, 150, 60, 50),
(9, 1, 9, 2200000, 1.2, 200000, 2840000, 'AVAILABLE', 210, 150, 80, 60),
(10, 1, 10, 500000, 1.0, 0, 500000, 'AVAILABLE', 310, 150, 50, 40)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Completed Vendor Reservation
INSERT INTO reservations (id, user_id, event_stall_id, payment_id, qr_code, status, email_sent, business_category, special_requirements, reservation_date, stall_type, preferred_size)
VALUES (1, 3, 1, 'pi_sample_12345', 'RES-CBF2026-A01', 'PAID', true, 'FICTION', 'Standard dual 13A socket required for POS terminal.', '2026-09-18', 'PREMIUM', 'LARGE')
ON CONFLICT (id) DO NOTHING;

UPDATE event_stalls SET status = 'RESERVED' WHERE id = 1;

-- Sync sequences
SELECT setval('venues_id_seq', (SELECT MAX(id) FROM venues));
SELECT setval('buildings_id_seq', (SELECT MAX(id) FROM buildings));
SELECT setval('halls_id_seq', (SELECT MAX(id) FROM halls));
SELECT setval('events_id_seq', (SELECT MAX(id) FROM events));
SELECT setval('stall_templates_id_seq', (SELECT MAX(id) FROM stall_templates));
SELECT setval('event_stalls_id_seq', (SELECT MAX(id) FROM event_stalls));
SELECT setval('reservations_id_seq', (SELECT MAX(id) FROM reservations));
