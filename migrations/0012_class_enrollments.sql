DROP TABLE IF EXISTS class_enrollments;

CREATE TABLE class_enrollments (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  buyer_profile_id TEXT NOT NULL,
  enrolled_at TEXT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES class_library(id),
  FOREIGN KEY (buyer_profile_id) REFERENCES buyer_profiles(id)
);
