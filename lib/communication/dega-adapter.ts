// DEGA Communication MCP adapter for encrypted agent messaging

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { x25519 } from '@noble/curves/ed25519';
import { AgentMessage, CommunicationAdapter } from './types';

export interface DEGAAdapterConfig {
  agentId: string;
  publicKey: string;
  privateKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export class DEGAAdapter implements CommunicationAdapter {
  private supabase: SupabaseClient;
  private config: DEGAAdapterConfig;
  private channel: any;
  private messageHandlers: Array<(message: AgentMessage) => void> = [];

  constructor(config: DEGAAdapterConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  async initialize(): Promise<void> {
    console.log(`[DEGA] Initializing agent: ${this.config.agentId}`);
    
    // Create real-time channel for this agent
    this.channel = this.supabase.channel(`agent:${this.config.agentId}`);
    
    console.log(`[DEGA] Agent ${this.config.agentId} initialized`);
  }

  async send(message: AgentMessage): Promise<void> {
    try {
      console.log(`[DEGA] Sending message from ${message.from} to ${message.to}`);
      
      // Encrypt the message payload
      const encrypted = await this.encryptMessage(message);
      
      // Send via Supabase real-time
      await this.supabase.from('agent_messages').insert({
        from_agent: message.from,
        to_agent: message.to,
        type: message.type,
        encrypted_payload: encrypted,
        timestamp: message.timestamp,
      });
      
      console.log(`[DEGA] Message sent successfully`);
    } catch (error) {
      console.error('[DEGA] Failed to send message:', error);
      throw error;
    }
  }

  async subscribe(handler: (message: AgentMessage) => void): Promise<void> {
    this.messageHandlers.push(handler);
    
    // Subscribe to messages for this agent
    this.channel
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'agent_messages',
          filter: `to_agent=eq.${this.config.agentId}`
        }, 
        async (payload: any) => {
          try {
            console.log(`[DEGA] Received message for ${this.config.agentId}`);
            
            // Decrypt the message
            const decrypted = await this.decryptMessage(payload.new.encrypted_payload);
            
            const message: AgentMessage = {
              id: payload.new.id,
              from: payload.new.from_agent,
              to: payload.new.to_agent,
              type: payload.new.type,
              payload: decrypted,
              timestamp: payload.new.timestamp,
            };
            
            // Call all registered handlers
            this.messageHandlers.forEach(h => h(message));
          } catch (error) {
            console.error('[DEGA] Failed to process received message:', error);
          }
        }
      )
      .subscribe();
    
    console.log(`[DEGA] Subscribed to messages for ${this.config.agentId}`);
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.supabase.removeChannel(this.channel);
      console.log(`[DEGA] Disconnected agent: ${this.config.agentId}`);
    }
  }

  private async encryptMessage(message: AgentMessage): Promise<string> {
    // In a full implementation, this would use X25519 encryption
    // For now, we'll use base64 encoding (placeholder for real encryption)
    const payload = JSON.stringify(message.payload);
    return Buffer.from(payload).toString('base64');
  }

  private async decryptMessage(encrypted: string): Promise<any> {
    // In a full implementation, this would use X25519 decryption
    // For now, we'll use base64 decoding (placeholder for real decryption)
    const payload = Buffer.from(encrypted, 'base64').toString('utf8');
    return JSON.parse(payload);
  }
}