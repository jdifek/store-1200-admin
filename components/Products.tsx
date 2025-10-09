import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { Product, Category, ProductFormData } from '@/types';
import { Modal } from './Modal';

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    categoryId: '',
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.get('/admin/products');
      setProducts(data.products || []);
    } catch (err) {
      console.error('Ошибка при загрузке продуктов:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.get('/admin/categories');
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Ошибка при загрузке категорий:', err);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('price', formData.price);
    formDataToSend.append('categoryId', formData.categoryId);

    images.forEach((file) => {
      formDataToSend.append('images', file); // 👈 ключ должен совпадать с multer.array('images')
    });

    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, formDataToSend);
      } else {
        await api.post('/admin/products', formDataToSend);
      }
      

      setShowModal(false);
      setFormData({ name: '', description: '', price: '', categoryId: '' });
      setImages([]);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      loadProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      categoryId: product.categoryId,
    });
    setImages([]);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Товары</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '', categoryId: '' });
            setImages([]);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> Добавить
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Название</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Категория</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Цена</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4">{product.category?.name}</td>
                <td className="px-6 py-4">{product.price} ₴</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 mr-3">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800">
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
          <h2 className="text-2xl font-bold mb-4">
            {editingProduct ? 'Редактировать' : 'Добавить'} товар
          </h2>
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
              <label className="block text-sm font-medium mb-2">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Цена</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Категория</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
  <label className="block text-sm font-medium mb-2">Изображения</label>
  <input
    type="file"
    multiple
    accept="image/*"
    onChange={handleFileChange}
    className="w-full border p-2 rounded-lg"
  />

  {/* Предпросмотр новых выбранных файлов */}
  {images.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-2">
      {images.map((file, index) => (
        <div key={index} className="w-20 h-20 relative border rounded-lg overflow-hidden">
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() =>
              setImages((prev) => prev.filter((_, i) => i !== index))
            }
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}

  {/* Если редактируем продукт, показываем существующие изображения */}
  {editingProduct && editingProduct.images.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-2">
      {editingProduct.images.map((img, index) => (
        <div key={index} className="w-20 h-20 relative border rounded-lg overflow-hidden">
          <img
            src={img.url} // предполагается, что сервер возвращает {url: "..."}
            alt={`img-${index}`}
            className="w-full h-full object-cover"
          />
          {/* Можно добавить кнопку удаления, если хочешь */}
        </div>
      ))}
    </div>
  )}
</div>


            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Сохранить
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
