import { promises as fs, existsSync, mkdirSync } from 'fs';
import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys';
import path from 'path';
import { tmpdir } from 'os';

const SESSION_DIRECTORY_NAME = 'baileys_sessions';

class BaileysClass {
  constructor(authState) {
    this.initBailey(authState);
  }

  async initBailey(authState) {
    const sessionsPath = path.resolve(SESSION_DIRECTORY_NAME);

    try {
      if (!existsSync(sessionsPath)) {
        mkdirSync(sessionsPath, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating sessions directory:', error);
      throw error;
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionsPath);
    this.socket = makeWASocket({ auth: state });
    this.socket.ev.on('creds.update', saveCreds);
  }

  on(event, handler) {
    this.socket.ev.on(event, handler);
  }

  async sendMessage(jid, message) {
    await this.socket.sendMessage(jid, { text: message });
  }

  async readMessages(keys) {
    await this.socket.readMessages(keys);
  }

  async sendPresenceUpdate(jid, type) {
    await this.socket.sendPresenceUpdate(type, jid);
  }
}

export default BaileysClass;
