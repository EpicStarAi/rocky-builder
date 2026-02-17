import Image from "next/image";
<<<<<<< HEAD
import React from "react";

const NUM_WORKS = 97;

export default function WorksPage() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold mb-6">Наши работы</h1>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{Array.from({ length: NUM_WORKS }, (_, i) => (
					<div key={i} className="relative h-48">
						<Image
							src={`/images/works/work${i + 1}.jpg`}
							alt={`Работа ${i + 1}`}
							fill
							className="object-cover rounded-lg border"
						/>
					</div>
				))}
			</div>
		</div>
	);
}
Создана страница категории "Наши работы" с отображением 50 фото (заглушки). Фото должны быть размещены в папке public/images/works с именами work1.jpg, work2.jpg и т.д.
=======
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
>>>>>>> 0ec4d91 (fix: автокоммит перед pull)
