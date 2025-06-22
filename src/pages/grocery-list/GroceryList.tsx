import React, { useState, useEffect } from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import jsPDF from 'jspdf';

interface GroceryItem {
  ingredient: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

const GroceryList: React.FC = () => {
  const { generateGroceryList } = useMealPlan();
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroceryList = async () => {
      try {
        const items = await generateGroceryList();
        setGroceryItems(items.map(item => ({ ...item, checked: false })));
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred while generating the grocery list.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGroceryList();
  }, [generateGroceryList]);

  const toggleItem = (index: number) => {
    setGroceryItems(items => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], checked: !newItems[index].checked };
      return newItems;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Grocery List', 20, 10);
    groceryItems.forEach((item, index) => {
      const y = 20 + (index * 10);
      doc.text(`${item.checked ? '[X]' : '[ ]'} ${item.quantity} ${item.unit} ${item.ingredient}`, 20, y);
    });
    doc.save('grocery-list.pdf');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Grocery List</h1>
        <div className="flex space-x-4">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {groceryItems.map((item, index) => (
            <li
              key={`${item.ingredient}-${index}`}
              className="flex items-center px-6 py-4 hover:bg-gray-50"
            >
              <button
                onClick={() => toggleItem(index)}
                className={`flex-shrink-0 ${item.checked ? 'text-green-500' : 'text-gray-400'}`}
              >
                <CheckIcon className="h-6 w-6" />
              </button>
              <div className={`ml-4 flex-1 ${item.checked ? 'line-through text-gray-400' : ''}`}>
                <span className="text-lg">{item.ingredient}</span>
                <span className="ml-2 text-gray-500">
                  {item.quantity} {item.unit}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroceryList;