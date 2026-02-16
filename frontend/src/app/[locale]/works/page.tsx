import Image from "next/image";
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