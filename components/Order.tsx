"use client";
import { useState, useEffect } from "react";
import { Trash2, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { Modal } from "./Modal";

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data: any = await api.get("/orders");
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Ошибка при загрузке заказов:", err);
      setOrders([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить заказ?")) return;
    try {
      await api.delete(`/orders/${id}`);
      loadOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  };

  const handleView = (order: any) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Замовлення</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Ім’я
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Телефон
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Товари
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Дата
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                Дії
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Немає замовлень
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{order.name}</td>
                <td className="px-6 py-4">{order.phoneNumber}</td>
                <td className="px-6 py-4">{order.products?.length || 0}</td>
                <td className="px-6 py-4">
                  {new Date(order.createdAt).toLocaleString("uk-UA")}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleView(order)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedOrder && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-2xl font-bold mb-4">Деталі замовлення</h2>

          <div className="space-y-3">
            <p>
              <span className="font-semibold">Ім’я:</span> {selectedOrder.name}
            </p>
            <p>
              <span className="font-semibold">Телефон:</span>{" "}
              {selectedOrder.phoneNumber}
            </p>
            <p>
              <span className="font-semibold">Дата:</span>{" "}
              {new Date(selectedOrder.createdAt).toLocaleString("uk-UA")}
            </p>

            <div>
              <span className="font-semibold text-black">Товари:</span>
              <ul className="list-disc  text-black list-inside mt-2 space-y-1">
                {selectedOrder.products?.map((op: any) => (
                  <li key={op.id}>
                    {op.product?.name} — {op.quantity} шт.
                  </li>
                )) || <p>Немає товарів</p>}
              </ul>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border rounded-lg  text-black cursor-pointer"
            >
              Закрити
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
