import { useState, useEffect, FormEvent, useRef } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import type { Chat, Message } from '@/types';

export function Chats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const SOCKET_URL = process.env.SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

  // Загрузка Socket.IO и подключение
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.5.4/socket.io.min.js';
    script.async = true;
    script.onload = () => {
      socketRef.current = (window as any).io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });

      socketRef.current.on('connect', () => {
        console.log('✅ Адмін підключено до Socket.IO');
        setIsConnected(true);
        
        // Подключаемся как админ
        socketRef.current.emit('admin-connect');
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ Адмін відключено від Socket.IO');
        setIsConnected(false);
      });

      socketRef.current.on('admin-connected', (data: any) => {
        console.log('🛠️ Підтверджено як адмін:', data);
      });

      socketRef.current.on('admin-notification', (data: any) => {
        console.log('🔔 Нове повідомлення в чаті:', data);
        // Обновляем список чатов
        loadChats();
        
        // Если это текущий чат, обновляем сообщения
        if (selectedChat && data.chatId === selectedChat.id) {
          setMessages(prev => [...prev, data.message]);
        }
      });

      socketRef.current.on('new-message', (message: Message) => {
        // Обновляем сообщения если это текущий чат
        if (selectedChat && message.chatId === selectedChat.id) {
          setMessages(prev => {
            // Проверяем, нет ли уже такого сообщения
            if (prev.some(m => m.id === message.id)) {
              return prev;
            }
            return [...prev, message];
          });
        }
      });

      socketRef.current.on('error', (error: any) => {
        console.error('Socket помилка:', error);
      });
    };
    document.body.appendChild(script);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [selectedChat]);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Загрузка чатов
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const data: any = await api.get('/admin/chats');
      setChats(Array.isArray(data.chats) ? data.chats : []);
    } catch (err) {
      console.error('Помилка при завантаженні чатів:', err);
      setChats([]);
    }
  };
  
  const loadMessages = async (chatId: string) => {
    try {
      const data: any = await api.get(`/admin/chats/${chatId}/messages`);
      // Убедимся что messages это массив
      const messagesList = data?.messages || data || [];
      setMessages(Array.isArray(messagesList) ? messagesList : []);
    } catch (err) {
      console.error('Помилка при завантаженні повідомлень:', err);
      setMessages([]);
    }
  };

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    loadMessages(chat.id);
    
    // Присоединяемся к чату через Socket.IO
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-chat', chat.id);
    }
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
  
    const messageContent = newMessage.trim();
    setNewMessage('');
  
    // Создаем временное сообщение для локального отображения
    const tempMessage: Message = {
      id: `temp-${Date.now()}`, // временный ID
      content: messageContent,
      createdAt: new Date().toISOString(),
      fromAdmin: true,
      chatId: selectedChat.id,
    };
  
    setMessages(prev => [...prev, tempMessage]); // ⬅️ сразу добавляем в локальные сообщения
  
    try {
      // Отправляем через WebSocket
      if (socketRef.current && isConnected) {
        socketRef.current.emit('admin-message', {
          chatId: selectedChat.id,
          content: messageContent,
        });
      } else {
        // Fallback на HTTP API
        await api.post(`/admin/chats/${selectedChat.id}/messages`, {
          content: messageContent,
          fromAdmin: true,
        });
        // Обновляем сообщения
        loadMessages(selectedChat.id);
      }
    } catch (err) {
      console.error('Помилка відправки:', err);
      alert(err instanceof Error ? err.message : 'Помилка відправки повідомлення');
    }
  };
  

  const handleRefresh = () => {
    loadChats();
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Чати</h1>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isConnected ? '● Онлайн' : '○ Офлайн'}
          </span>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={18} /> Оновити
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Список чатов */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Список чатів ({chats.length})</h2>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Чатів поки немає
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <p className="font-medium">Чат #{chat.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(chat.createdAt).toLocaleString('uk-UA')}
                  </p>
                  {chat._count?.messages && (
                    <p className="text-xs text-blue-600 mt-1">
                      {chat._count.messages} повідомлень
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Окно чата */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col h-[600px]">
          {selectedChat ? (
            <>
              <div className="p-4 border-b">
                <h2 className="font-semibold">Чат #{selectedChat.id.slice(0, 8)}</h2>
                <p className="text-sm text-gray-500">
                  Session: {selectedChat.sessionId}
                </p>
              </div>
              
              {/* Сообщения */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    Повідомлень поки немає
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-4 flex ${msg.fromAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.fromAdmin 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-800 shadow'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.fromAdmin ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString('uk-UA')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Форма отправки */}
              <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введіть повідомлення..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition"
                >
                  <Send size={18} /> Відправити
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Оберіть чат зі списку
            </div>
          )}
        </div>
      </div>
    </div>
  );
}