export interface Product {
  id: string;
  slug: string;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  price: number;
  oldPrice?: number;
  unit: string;
  image: string;
  category: string;
  inStock: boolean;
  specs?: Record<string, string>;
}

export interface Category {
  slug: string;
  nameUa: string;
  nameRu: string;
  descriptionUa: string;
  descriptionRu: string;
  image: string;
}

export const categories: Category[] = [
  {
    slug: 'termopaneli',
    nameUa: 'Термопанелі ROCKY',
    nameRu: 'Термопанели ROCKY',
    descriptionUa: 'Фасадні термопанелі власного виробництва. Утеплення та облицювання в одному матеріалі.',
    descriptionRu: 'Фасадные термопанели собственного производства. Утепление и облицовка в одном материале.',
    image: 'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-price/51.png',
  },
  {
    slug: 'kolory',
    nameUa: 'Кольори та фактури',
    nameRu: 'Цвета и фактуры',
    descriptionUa: 'Більше 20 кольорів і фактур. Можливе виготовлення будь-якого кольору за зразком замовника.',
    descriptionRu: 'Более 20 цветов и фактур. Возможно изготовление любого цвета по образцу заказчика.',
    image: 'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-colors/1.jpg',
  },
  {
    slug: 'montazh',
    nameUa: 'Монтаж під ключ',
    nameRu: 'Монтаж под ключ',
    descriptionUa: 'Професійний монтаж термопанелей по всій Україні з гарантією на роботи.',
    descriptionRu: 'Профессиональный монтаж термопанелей по всей Украине с гарантией на работы.',
    image: 'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/055-chernomorsk-kolotui-935-tsokol-660/21.jpg',
  },
];

export const products: Product[] = [
  // Термопанелі - фактура "Колотий камінь"
  {
    id: 'tp-01',
    slug: 'termopanel-kolotyi-kamin-beige',
    name: 'Термопанель "Колотий камінь" бежева',
    nameRu: 'Термопанель "Колотый камень" бежевая',
    description: 'Фасадна термопанель з фактурою колотого каменю. Утеплювач пінополістирол до 100мм. Монолітна армована плита 15мм.',
    descriptionRu: 'Фасадная термопанель с фактурой колотого камня. Утеплитель пенополистирол до 100мм. Монолитная армированная плита 15мм.',
    price: 720,
    oldPrice: 900,
    unit: 'м²',
    image: 'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-price/51.png',
    category: 'termopaneli',
    inStock: true,
    specs: {
      'Товщина утеплювача': 'до 100 мм',
      'Зовнішня плита': '15 мм армована',
      'Матеріал': 'Пінополістирол',
      'Фактура': 'Колотий камінь',
    },
  },
  {
    id: 'tp-02',
    slug: 'termopanel-kolotyi-kamin-grey',
    name: 'Термопанель "Колотий камінь" сіра',
    nameRu: 'Термопанель "Колотый камень" серая',
    description: 'Фасадна термопанель з фактурою колотого каменю сірого кольору. Утеплювач пінополістирол до 100мм.',
    descriptionRu: 'Фасадная термопанель с фактурой колотого камня серого цвета. Утеплитель пенополистирол до 100мм.',
    price: 720,
    oldPrice: 900,
    unit: 'м²',
    image: 'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-price/62.png',
    category: 'termopaneli',
    inStock: true,
    specs: {
      'Товщина утеплювача': 'до 100 мм',
      'Зовнішня плита': '15 мм армована',
      'Матеріал': 'Пінополістирол',
      'Фактура': 'Колотий камінь',
    },
  },
  {
    id: 'tp-03',
    slug: 'termopanel-kolotyi-kamin-brown',
    name: 'Термопанель "Колотий камінь" коричнева',
    nameRu: 'Термопанель "Колотый камень" коричневая',
    description: 'Фасадна термопанель з фактурою колотого каменю коричневого кольору. Утеплювач пінополістирол до 100мм.',
    descriptionRu: 'Фасадная термопанель с фактурой колотого камня коричневого цвета. Утеплитель пенополистирол до 100мм.',
    price: 720,
    oldPrice: 900,
    unit: 'м²',
    image: 'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-price/55.png',
    category: 'termopaneli',
    inStock: true,
    specs: {
      'Товщина утеплювача': 'до 100 мм',
      'Зовнішня плита': '15 мм армована',
      'Матеріал': 'Пінополістирол',
      'Фактура': 'Колотий камінь',
    },
  },
  {
    id: 'tp-04',
    slug: 'termopanel-kolotyi-kamin-white',
    name: 'Термопанель "Колотий камінь" біла',
    nameRu: 'Термопанель "Колотый камень" белая',
    description: 'Фасадна термопанель з фактурою колотого каменю білого кольору. Утеплювач пінополістирол до 100мм.',
    descriptionRu: 'Фасадная термопанель с фактурой колотого камня белого цвета. Утеплитель пенополистирол до 100мм.',
    price: 720,
    oldPrice: 900,
    unit: 'м²',
    image: 'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-price/34.png',
    category: 'termopaneli',
    inStock: true,
    specs: {
      'Товщина утеплювача': 'до 100 мм',
      'Зовнішня плита': '15 мм армована',
      'Матеріал': 'Пінополістирол',
      'Фактура': 'Колотий камінь',
    },
  },
  // Термопанелі - різні кольори (з каталогу кольорів)
  {
    id: 'tp-05',
    slug: 'termopanel-color-1',
    name: 'Термопанель ROCKY колір №1',
    nameRu: 'Термопанель ROCKY цвет №1',
    description: 'Фасадна термопанель ROCKY. Індивідуальний підбір кольору. Утеплювач пінополістирол до 100мм.',
    descriptionRu: 'Фасадная термопанель ROCKY. Индивидуальный подбор цвета. Утеплитель пенополистирол до 100мм.',
    price: 720,
    oldPrice: 900,
    unit: 'м²',
    image: 'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-colors/1.jpg',
    category: 'kolory',
    inStock: true,
  },
  {
    id: 'tp-06',
    slug: 'termopanel-color-2',
    name: 'Термопанель ROCKY колір №2',
    nameRu: 'Термопанель ROCKY цвет №2',
    description: 'Фасадна термопанель ROCKY. Індивідуальний підбір кольору. Утеплювач пінополістирол до 100мм.',
    descriptionRu: 'Фасадная термопанель ROCKY. Индивидуальный подбор цвета. Утеплитель пенополистирол до 100мм.',
    price: 720,
    oldPrice: 900,
    unit: 'м²',
    image: 'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-colors/2.jpg',
    category: 'kolory',
    inStock: true,
  },
  {
    id: 'tp-07',
    slug: 'termopanel-color-3',
    name: 'Термопанель ROCKY колір №3',
    nameRu: 'Термопанель ROCKY цвет №3',
    description: 'Фасадна термопанель ROCKY. Індивідуальний підбір кольору. Утеплювач пінополістирол до 100мм.',
    descriptionRu: 'Фасадная термопанель ROCKY. Индивидуальный подбор цвета. Утеплитель пенополистирол до 100мм.',
    price: 720,
    oldPrice: 900,
    unit: 'м²',
    image: 'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-colors/3.jpg',
    category: 'kolory',
    inStock: true,
  },
  {
    id: 'tp-08',
    slug: 'termopanel-color-4',
    name: 'Термопанель ROCKY колір №4',
    nameRu: 'Термопанель ROCKY цвет №4',
    description: 'Фасадна термопанель ROCKY. Індивідуальний підбір кольору. Утеплювач пінополістирол до 100мм.',
    descriptionRu: 'Фасадная термопанель ROCKY. Индивидуальный подбор цвета. Утеплитель пенополистирол до 100мм.',
    price: 720,
    oldPrice: 900,
    unit: 'м²',
    image: 'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-colors/4.jpg',
    category: 'kolory',
    inStock: true,
  },
  {
    id: 'tp-09',
    slug: 'termopanel-color-5',
    name: 'Термопанель ROCKY колір №5',
    nameRu: 'Термопанель ROCKY цвет №5',
    description: 'Фасадна термопанель ROCKY. Індивідуальний підбір кольору. Утеплювач пінополістирол до 100мм.',
    descriptionRu: 'Фасадная термопанель ROCKY. Индивидуальный подбор цвета. Утеплитель пенополистирол до 100мм.',
    price: 720,
    oldPrice: 900,
    unit: 'м²',
    image: 'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-colors/5.jpg',
    category: 'kolory',
    inStock: true,
  },
];

export const projectPhotos = [
  {
    id: 'ph-01',
    title: 'Чорноморськ — Колотий камінь',
    titleRu: 'Черноморск — Колотый камень',
    images: [
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/055-chernomorsk-kolotui-935-tsokol-660/21.jpg',
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/055-chernomorsk-kolotui-935-tsokol-660/22.jpg',
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/055-chernomorsk-kolotui-935-tsokol-660/23.jpg',
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/055-chernomorsk-kolotui-935-tsokol-660/24.jpg',
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/055-chernomorsk-kolotui-935-tsokol-660/25.jpg',
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/055-chernomorsk-kolotui-935-tsokol-660/26.jpg',
    ],
  },
  {
    id: 'ph-02',
    title: 'Віта-Поштова — Колотий камінь',
    titleRu: 'Вита-Почтовая — Колотый камень',
    images: [
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/057-vita-poshtova-kolota-678/1.webp',
    ],
  },
  {
    id: 'ph-03',
    title: 'Буча — Колотий камінь + Дикий камінь',
    titleRu: 'Буча — Колотый камень + Дикий камень',
    images: [
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/051-bycha-678-kolotui-678-diki-kam/1.jpg',
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/051-bycha-678-kolotui-678-diki-kam/2.jpg',
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/051-bycha-678-kolotui-678-diki-kam/3.jpg',
    ],
  },
  {
    id: 'ph-04',
    title: 'Гоголів — Колотий камінь',
    titleRu: 'Гоголев — Колотый камень',
    images: [
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/056-gogoliv-kolota-001-753/1.webp',
    ],
  },
  {
    id: 'ph-05',
    title: 'Чабани — Еліт',
    titleRu: 'Чабаны — Элит',
    images: [
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/60-chabanu-903elit-753/1.jpg',
    ],
  },
  {
    id: 'ph-06',
    title: 'Чубинське — Фагот',
    titleRu: 'Чубинское — Фагот',
    images: [
      'https://www.rocky.net.ua/foto-rocky/termopaneli/termop-foto-obektu/058-chybunske-fagot-126-678/1.jpg',
    ],
  },
];

export const companyInfo = {
  name: 'TM ROCKY',
  phones: ['+38 (063) 930-99-26', '+38 (066) 014-30-36'],
  productionAddress: 'Бориспільський р-н, село Дударків, вул. Нова',
  showroomAddress: 'м. Київ, вул. Анни Ахматової, 13Д',
  email: 'info@rocky-builder.ua',
  workingHours: {
    weekdays: 'Пн-Пт: 9:00 - 18:00',
    saturday: 'Сб: 9:00 - 15:00',
    sunday: 'Нд: Вихідний',
  },
};
