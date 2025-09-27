-- Create agent_messages table for DEGA communication
CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  type TEXT NOT NULL,
  encrypted_payload TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_agent_messages_to_agent ON agent_messages(to_agent);
CREATE INDEX idx_agent_messages_timestamp ON agent_messages(timestamp);

-- Enable real-time
ALTER TABLE agent_messages REPLICA IDENTITY FULL;
