import { promises as fs, existsSync, mkdirSync } from 'fs';
import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys';
import path from 'path';
import { tmpdir } from 'os';

const SESSION_DIRECTORY_NAME = path.join(tmpdir(), 'baileys_sessions');

class BaileysClass {
  constructor() {
    this.initPromise = this.initBailey();
  }

  async initBailey() {
    const sessionsPath = SESSION_DIRECTORY_NAME;

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

  async on(event, handler) {
    await this.initPromise;
    this.socket.ev.on(event, handler);
  }

  async sendMessage(jid, message) {
    await this.initPromise;
    await this.socket.sendMessage(jid, { text: message });
  }

  async readMessages(keys) {
    await this.initPromise;
    await this.socket.readMessages(keys);
  }

  async sendPresenceUpdate(jid, type) {
    await this.initPromise;
    await this.socket.sendPresenceUpdate(type, jid);
  }
}

export default BaileysClass;
