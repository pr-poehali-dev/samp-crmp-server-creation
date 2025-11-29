const API_BASE = {
  auth: 'https://functions.poehali.dev/3ca0ce34-2361-4cb0-9e6d-750c4be28d2c',
  servers: 'https://functions.poehali.dev/ca99af5d-744a-4ded-8075-dfcc9aff7a18',
  payments: 'https://functions.poehali.dev/e443eac0-9ec6-41ce-ab15-2d4d4fdb0f1a'
};

export const api = {
  auth: {
    register: async (email: string, password: string) => {
      const response = await fetch(API_BASE.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, password })
      });
      return response.json();
    },
    
    login: async (email: string, password: string) => {
      const response = await fetch(API_BASE.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });
      return response.json();
    }
  },
  
  servers: {
    list: async (userId: string) => {
      const response = await fetch(API_BASE.servers, {
        method: 'GET',
        headers: { 'X-User-Id': userId }
      });
      return response.json();
    },
    
    create: async (userId: string, name: string, template: string, isFree: boolean = false) => {
      const response = await fetch(API_BASE.servers, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ name, template, is_free: isFree })
      });
      return response.json();
    },
    
    updateConfig: async (userId: string, serverId: number, config: any) => {
      const response = await fetch(API_BASE.servers, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({
          server_id: serverId,
          action: 'update_config',
          ...config
        })
      });
      return response.json();
    },
    
    start: async (userId: string, serverId: number) => {
      const response = await fetch(API_BASE.servers, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ server_id: serverId, action: 'start' })
      });
      return response.json();
    },
    
    stop: async (userId: string, serverId: number) => {
      const response = await fetch(API_BASE.servers, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ server_id: serverId, action: 'stop' })
      });
      return response.json();
    }
  },
  
  payments: {
    getBalance: async (userId: string) => {
      const response = await fetch(API_BASE.payments, {
        method: 'GET',
        headers: { 'X-User-Id': userId }
      });
      return response.json();
    },
    
    addBalance: async (userId: string, amount: number) => {
      const response = await fetch(API_BASE.payments, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ action: 'add_balance', amount })
      });
      return response.json();
    }
  }
};
