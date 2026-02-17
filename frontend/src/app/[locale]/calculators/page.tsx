"use client";
import { useState, FormEvent } from "react";

const materials = [
  { name: "Термопанели", coverage: 1.2, price: 800 },
  { name: "Сайдинг", coverage: 1.5, price: 600 },
  { name: "Черепица", coverage: 2.0, price: 1200 },
  { name: "Профнастил", coverage: 1.7, price: 900 },
  { name: "Утеплитель", coverage: 1.0, price: 500 },
];

export default function CalculatorsPage() {
  const [area, setArea] = useState(0);
  const [material, setMaterial] = useState(materials[0]);
  const [result, setResult] = useState<string | { qty: number; total: number } | null>(null);

  const handleCalc = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!area || area <= 0) {
      setResult("Введите корректную площадь!");
      return;
    }
    const qty = Math.ceil(area / material.coverage);
    const total = qty * material.price;
    setResult({ qty, total });
  };

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Калькулятор материалов</h1>
      <form onSubmit={handleCalc} className="max-w-md space-y-6 bg-white dark:bg-brand-dark-900 p-6 rounded shadow">
        <div>
          <label className="block mb-2 font-medium">Площадь покрытия (м²):</label>
          <input
            type="number"
            min="1"
            value={area}
            onChange={e => setArea(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            placeholder="Введите площадь"
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Тип материала:</label>
          <select
            value={material.name}
            onChange={e => {
              const found = materials.find(m => m.name === e.target.value);
              if (found) setMaterial(found);
            }}
            className="w-full border rounded px-3 py-2"
          >
            {materials.map(m => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="w-full bg-brand-gold-500 hover:bg-brand-gold-400 text-white font-bold py-2 rounded">Рассчитать</button>
      </form>
      {result && typeof result === "object" && (
        <div className="mt-8 p-4 bg-green-100 dark:bg-green-900 rounded">
          <div>Необходимое количество: <b>{result.qty}</b> шт.</div>
          <div>Примерная стоимость: <b>{result.total}</b> грн.</div>
        </div>
      )}
      {result && typeof result === "string" && (
        <div className="mt-8 p-4 bg-red-100 dark:bg-red-900 rounded">{result}</div>
      )}
    </main>
  );
}
