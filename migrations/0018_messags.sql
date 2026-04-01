DROP TABLE IF EXISTS messages;

CREATE TABLE messages (
  id TEXT PRIMARY KEY,                 -- message_id (UUID)

  sender_user_id TEXT NOT NULL,        -- users.id
  receiver_user_id TEXT NOT NULL,      -- users.id

  content TEXT NOT NULL,               -- message body
  media_url TEXT,                      -- optional image/video/file
  media_type TEXT,                     -- image | video | file | audio

  is_request INTEGER DEFAULT 0,        -- 1 = negotiation/sponsorship request
  request_type TEXT,                   -- sponsorship | contract | collab | ad | giveaway
  request_status TEXT DEFAULT 'pending', -- pending | accepted | rejected | modified

  created_at TEXT NOT NULL,            -- timestamp
  read_at TEXT,                        -- when the receiver opened it

  FOREIGN KEY (sender_user_id) REFERENCES users(id),
  FOREIGN KEY (receiver_user_id) REFERENCES users(id)
);
