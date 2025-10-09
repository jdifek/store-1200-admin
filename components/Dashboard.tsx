import { useState, useEffect, ReactNode } from 'react';
import { Home, Package, FolderTree, MessageSquare, Star } from 'lucide-react';
import { api } from '@/lib/api';
import type { Stats } from '@/types';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`${color} text-white rounded-lg p-6 shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {icon}
      </div>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.get<{ success: boolean; stats: Stats }>('/admin/stats');
      setStats(data.stats); // <-- вот здесь берем stats, а не весь объект
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) return <div className="p-6">Загрузка...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Панель управления</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
  title="Категории"
  value={stats?.totals.categories || 0}
  icon={<FolderTree />}
  color="bg-blue-500"
/>
<StatCard
  title="Товары"
  value={stats?.totals.products || 0}
  icon={<Package />}
  color="bg-green-500"
/>
<StatCard
  title="Чаты"
  value={stats?.totals.chats || 0}
  icon={<MessageSquare />}
  color="bg-purple-500"
/>
<StatCard
  title="Отзывы"
  value={stats?.totals.reviews || 0}
  icon={<Star />}
  color="bg-yellow-500"
/>

      </div>
    </div>
  );
}
