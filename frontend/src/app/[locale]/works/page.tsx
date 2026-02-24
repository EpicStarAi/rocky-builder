import Image from "next/image";
import { worksImages } from "../../../data/works-images";

export default function WorksPage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Наши работы</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {worksImages.map((src, i) => (
          <div key={src} className="relative w-full aspect-[4/3] bg-gray-100 rounded overflow-hidden shadow">
            <Image
              src={src}
              alt={`Работа #${i + 1}`}
              fill
              style={{objectFit: 'cover'}}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={i < 8}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
