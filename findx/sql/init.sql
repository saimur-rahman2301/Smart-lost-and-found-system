-- FindX Database Schema (PostgreSQL)
-- Runs automatically via docker-entrypoint-initdb.d

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Enums ──────────────────────────────────────────────────────────────────
CREATE TYPE user_role      AS ENUM ('STUDENT', 'ADMIN');
CREATE TYPE item_type      AS ENUM ('LOST', 'FOUND');
CREATE TYPE item_status    AS ENUM ('REPORTED', 'UNDER_REVIEW', 'MATCHED', 'CLAIM_SUBMITTED', 'VERIFIED', 'RETURNED', 'CLOSED');
CREATE TYPE claim_status   AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- ─── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(100)  NOT NULL,
  email          VARCHAR(255)  NOT NULL UNIQUE,
  password_hash  VARCHAR(255)  NOT NULL,
  role           user_role     NOT NULL DEFAULT 'STUDENT',
  is_verified    BOOLEAN       NOT NULL DEFAULT FALSE,
  verify_token   VARCHAR(255),
  reset_token    VARCHAR(255),
  reset_token_exp TIMESTAMPTZ,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

-- ─── Buildings (Campus Graph Nodes) ─────────────────────────────────────────
CREATE TABLE buildings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(150)  NOT NULL UNIQUE,
  short_code  VARCHAR(10)   NOT NULL UNIQUE,
  latitude    DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude   DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── Edges (Campus Graph Edges) ─────────────────────────────────────────────
CREATE TABLE edges (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  to_building_id   UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  weight           DOUBLE PRECISION NOT NULL,  -- walking distance meters
  UNIQUE(from_building_id, to_building_id)
);
CREATE INDEX idx_edges_from ON edges(from_building_id);
CREATE INDEX idx_edges_to   ON edges(to_building_id);

-- ─── Items ──────────────────────────────────────────────────────────────────
CREATE TABLE items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type             item_type   NOT NULL,
  category         VARCHAR(80) NOT NULL,
  brand            VARCHAR(100),
  color            VARCHAR(50),
  location_node_id UUID REFERENCES buildings(id),
  date             DATE NOT NULL,
  description      TEXT NOT NULL,
  hidden_detail    TEXT,         -- Never returned in public API
  photo_url        VARCHAR(500),
  status           item_status NOT NULL DEFAULT 'REPORTED',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_items_type_status  ON items(type, status);
CREATE INDEX idx_items_location     ON items(location_node_id);
CREATE INDEX idx_items_date         ON items(date);
CREATE INDEX idx_items_category     ON items(category);
CREATE INDEX idx_items_reporter     ON items(reporter_id);
CREATE INDEX idx_items_description  ON items USING GIN (to_tsvector('english', description));

-- ─── Matches ────────────────────────────────────────────────────────────────
CREATE TABLE matches (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lost_item_id         UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  found_item_id        UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  score                DOUBLE PRECISION NOT NULL,
  score_breakdown_json JSONB NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lost_item_id, found_item_id)
);
CREATE INDEX idx_matches_lost  ON matches(lost_item_id);
CREATE INDEX idx_matches_found ON matches(found_item_id);

-- ─── Claims ─────────────────────────────────────────────────────────────────
CREATE TABLE claims (
  id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id                    UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  claimant_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_answers_json  JSONB,
  verification_score         DOUBLE PRECISION,
  verification_breakdown     JSONB,
  status                     claim_status NOT NULL DEFAULT 'PENDING',
  admin_note                 TEXT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_claims_item     ON claims(item_id);
CREATE INDEX idx_claims_claimant ON claims(claimant_id);
CREATE INDEX idx_claims_status   ON claims(status);

-- ─── Status History ──────────────────────────────────────────────────────────
CREATE TABLE status_history (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id      UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  status       item_status NOT NULL,
  note         TEXT,
  changed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by   UUID REFERENCES users(id)
);
CREATE INDEX idx_status_history_item ON status_history(item_id);

-- ─── Audit Log ───────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id     UUID REFERENCES users(id),
  action       VARCHAR(100) NOT NULL,
  target_type  VARCHAR(50)  NOT NULL,
  target_id    UUID,
  meta         JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_actor  ON audit_logs(actor_id);
CREATE INDEX idx_audit_target ON audit_logs(target_type, target_id);

-- ─── Notifications ───────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50)  NOT NULL,
  message    TEXT         NOT NULL,
  is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ─── Refresh Tokens ──────────────────────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ  NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_refresh_tokens_user  ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ─── Auto-update updated_at trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at   BEFORE UPDATE ON users   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_items_updated_at   BEFORE UPDATE ON items   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_claims_updated_at  BEFORE UPDATE ON claims  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
