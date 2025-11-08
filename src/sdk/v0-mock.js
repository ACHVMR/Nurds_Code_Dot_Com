/**
 * Mock V0 Chat SDK for development
 * Replace with actual @v0/chat-sdk when installed
 */

class MockV0SDK {
  constructor(config) {
    this.config = config;
    this.connected = false;
  }

  async connect() {
    console.log('Mock V0 SDK: Connecting...');
    this.connected = true;
    return Promise.resolve();
  }

  async disconnect() {
    console.log('Mock V0 SDK: Disconnecting...');
    this.connected = false;
    return Promise.resolve();
  }

  async sendMessage(message) {
    console.log('Mock V0 SDK: Sending message:', message);
    return Promise.resolve({
      response: 'This is a mock response. Install @v0/chat-sdk for real functionality.',
      timestamp: Date.now(),
    });
  }

  isConnected() {
    return this.connected;
  }
}

export default MockV0SDK;
