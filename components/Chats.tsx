import { useState, useEffect, FormEvent } from 'react';
import { Send } from 'lucide-react';
import { api } from '@/lib/api';
import type { Chat, Message } from '@/types';

export function Chats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const data: any = await api.get('/admin/chats');
      setChats(data.chats || []); // ✅ берём только массив чатов
    } catch (err) {
      console.error('Ошибка при загрузке чатов:', err);
      setChats([]);
    }
  };
  
  const loadMessages = async (chatId: string) => {
    try {
      const data = await api.get<Message[]>(`/admin/chats/${chatId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    loadMessages(chat.id);
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      await api.post(`/admin/chats/${selectedChat.id}/messages`, {
        content: newMessage,
        fromAdmin: true,
      });
      setNewMessage('');
      loadMessages(selectedChat.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Чаты</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Список чатов</h2>
          </div>
          <div className="overflow-y-auto max-h-96">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedChat?.id === chat.id ? 'bg-blue-50' : ''
                }`}
              >
                <p className="font-medium">Чат #{chat.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-500">{new Date(chat.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col">
          {selectedChat ? (
            <>
              <div className="p-4 border-b">
                <h2 className="font-semibold">Чат #{selectedChat.id.slice(0, 8)}</h2>
              </div>
              <div className="flex-1 p-4 overflow-y-auto max-h-96">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-4 flex ${msg.fromAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.fromAdmin ? 'bg-blue-600 text-white' : 'bg-gray-200'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Send size={18} /> Отправить
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Выберите чат
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
