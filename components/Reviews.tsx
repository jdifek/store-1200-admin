import { useState, useEffect, FormEvent } from 'react';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import { api } from '@/lib/api';
import type { Review, ReviewFormData } from '@/types';
import { Modal } from './Modal';

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>({
    content: '',
    rating: '5',
    author: '',
    avatar: '',
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const { reviews }: { reviews: any } = await api.get('/admin/reviews');
      setReviews(Array.isArray(reviews) ? reviews : []);
    } catch (err) {
      console.error('Ошибка при загрузке отзывов:', err);
      setReviews([]);
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload = {
        content: formData.content,
        rating: parseInt(formData.rating),
        author: formData.author || null,
        avatar: formData.avatar,
      };

      if (editingReview) {
        await api.put(`/admin/reviews/${editingReview.id}`, payload);
      } else {
        await api.post('/admin/reviews', payload);
      }
      setShowModal(false);
      setFormData({ content: '', rating: '5', author: '', avatar: '' });
      setEditingReview(null);
      loadReviews();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить отзыв?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      loadReviews();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      content: review.content,
      rating: review.rating.toString(),
      author: review.author || '',
      avatar: review.avatar,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Отзывы</h1>
        <button
          onClick={() => {
            setEditingReview(null);
            setFormData({ content: '', rating: '5', author: '', avatar: '' });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> Добавить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews && reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <img src={review.avatar} alt={review.author || 'User'} className="w-12 h-12 rounded-full mr-3" />
              <div>
                <p className="font-semibold">{review.author || 'Аноним'}</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{review.content}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => handleEdit(review)} className="text-blue-600 hover:text-blue-800">
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDelete(review.id)} className="text-red-600 hover:text-red-800">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-2xl font-bold mb-4">{editingReview ? 'Редактировать' : 'Добавить'} отзыв</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Автор</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Avatar URL</label>
              <input
                type="text"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Рейтинг</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>{num} звезд</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Отзыв</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
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
