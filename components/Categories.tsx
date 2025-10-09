import { useState, useEffect, FormEvent } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { Category, CategoryFormData } from '@/types';
import { Modal } from './Modal';

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', parentId: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data: any = await api.get('/admin/categories');
      setCategories(data.categories || []); // ✅ только массив
    } catch (err) {
      console.error('Ошибка при загрузке категорий:', err);
      setCategories([]);
    }
  };
  

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        parentId: formData.parentId || null,
      };

      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, payload);
      } else {
        await api.post('/admin/categories', payload);
      }
      setShowModal(false);
      setFormData({ name: '', parentId: '' });
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить категорию?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, parentId: category.parentId || '' });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Категории</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', parentId: '' });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> Добавить
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Название</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Родитель</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{cat.name}</td>
                <td className="px-6 py-4">{cat.parent?.name || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800 mr-3">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-2xl font-bold mb-4">{editingCategory ? 'Редактировать' : 'Добавить'} категорию</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Название</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Родительская категория</label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Нет</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">
                Отмена
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Сохранить
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
