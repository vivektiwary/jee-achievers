CREATE TABLE tests (
 id TEXT PRIMARY KEY, slug TEXT NOT NULL, title TEXT NOT NULL,
 duration_minutes INTEGER NOT NULL, questions_json TEXT NOT NULL,
 published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)),
 created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX one_published_slug ON tests(slug) WHERE published = 1;
CREATE TABLE attempts (
 id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, test_id TEXT NOT NULL REFERENCES tests(id),
 parent_name TEXT NOT NULL, parent_phone TEXT NOT NULL, consent_version TEXT NOT NULL,
 consent_at INTEGER NOT NULL, source TEXT NOT NULL, campaign TEXT NOT NULL,
 started_at INTEGER NOT NULL, deadline INTEGER NOT NULL,
 answers_json TEXT NOT NULL DEFAULT '{}', revision INTEGER NOT NULL DEFAULT 0,
 submitted_at INTEGER, report_json TEXT
);
CREATE INDEX attempts_created ON attempts(started_at DESC);
CREATE TABLE inquiries (
 id TEXT PRIMARY KEY, kind TEXT NOT NULL, payload_json TEXT NOT NULL,
 source TEXT NOT NULL, consent_at INTEGER NOT NULL, created_at INTEGER NOT NULL
);
CREATE TABLE rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
