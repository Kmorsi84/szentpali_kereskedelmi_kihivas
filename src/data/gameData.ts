import type { ChallengeMeta } from '../types';

export const SCHOOL_FULL_NAME =
  'Miskolci SZC Szentpáli István Kereskedelmi és Vendéglátó Technikum és Szakképző Iskola';
export const SCHOOL_SHORT_NAME = 'Szentpáli Technikum';
export const PROGRAM_NAME = 'Kereskedelmi értékesítő';

export const IMAGES = {
  heroRetail: '/src/assets/images/hero_retail_market_1795287963038.jpg',
  mysteryBox: '/src/assets/images/mystery_box_crate_1795287963151.jpg',
  dryGoodsScale: '/src/assets/images/dry_goods_scale_1795287963972.jpg',
  pomegranate: '/src/assets/images/produce_pomegranate_1795287962771.jpg',
  kohlrabi: '/src/assets/images/produce_kohlrabi_1795287963618.jpg',
  eggplant: '/src/assets/images/produce_eggplant_1795287962730.jpg',
  beetroot: '/src/assets/images/produce_beetroot_1795287963033.jpg',
  avocado: '/src/assets/images/produce_avocado_1795287963295.jpg',
} as const;

export const CHALLENGES: ChallengeMeta[] = [
  {
    id: 'shopping',
    order: 1,
    title: '3000 Ft-os Bevásárlás',
    shortTitle: 'Bevásárlás',
    subtitle: 'Válassz okosan az árcédulák alapján, és maradj 3 000 Ft alatt!',
    durationLabel: '~45 mp',
    maxScore: 100,
    partnerTag: 'Tesco',
  },
  {
    id: 'mystery',
    order: 2,
    title: 'Titkos Doboz',
    shortTitle: 'Titkos doboz',
    subtitle: 'Tapintás és érzékszervi nyomok alapján találd ki, mi rejtőzik benne!',
    durationLabel: '~40 mp',
    maxScore: 100,
    partnerTag: 'Coop',
  },
  {
    id: 'shelf',
    order: 3,
    title: 'Polcrendezés, Mérés és Csomagolás',
    shortTitle: 'Polc & Mérés',
    subtitle: 'Rendezd a polcot, mérj ki pontos mennyiséget, és csomagolj profin!',
    durationLabel: '~50 mp',
    maxScore: 100,
    partnerTag: 'Interspar',
  },
  {
    id: 'pricing',
    order: 4,
    title: 'Árkalkuláció a Kasszánál',
    shortTitle: 'Árkalkuláció',
    subtitle: 'Számolj tömegárat, visszajárót 5 000 Ft-ból és 20%-os akciót!',
    durationLabel: '~45 mp',
    maxScore: 100,
    partnerTag: 'Tesco',
  },
  {
    id: 'produce',
    order: 5,
    title: 'Zöldség-Gyümölcs Felismerő',
    shortTitle: 'Zöldség-Gyümölcs',
    subtitle: 'Milyen gyümölcsöt vagy zöldséget látsz a kassza mérlegén?',
    durationLabel: '~35 mp',
    maxScore: 100,
    partnerTag: 'Interspar',
  },
];

export type ProductArtId =
  | 'bread'
  | 'milk'
  | 'apple'
  | 'pasta'
  | 'eggs'
  | 'toothpaste'
  | 'peas'
  | 'sponge'
  | 'chips'
  | 'drink'
  | 'lemon'
  | 'toy'
  | 'beans'
  | 'butter';

export interface ShopProduct {
  id: string;
  name: string;
  unit: string;
  price: number;
  art: ProductArtId;
  onList: boolean;
  isImpulse?: boolean;
  category: 'Pékáru' | 'Tejtermék' | 'Gyümölcs' | 'Szárazáru' | 'Háztartás' | 'Nasi';
}

export const SHOPPING_BUDGET = 3000;

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'bread',
    name: 'Félbarna kenyér',
    unit: '750 g',
    price: 599,
    art: 'bread',
    onList: true,
    category: 'Pékáru',
  },
  {
    id: 'milk',
    name: 'Friss tej 2,8%',
    unit: '1 liter',
    price: 449,
    art: 'milk',
    onList: true,
    category: 'Tejtermék',
  },
  {
    id: 'apple',
    name: 'Magyar alma',
    unit: '1 kg',
    price: 699,
    art: 'apple',
    onList: true,
    category: 'Gyümölcs',
  },
  {
    id: 'pasta',
    name: 'Csomagolt tészta',
    unit: '500 g',
    price: 490,
    art: 'pasta',
    onList: false,
    category: 'Szárazáru',
  },
  {
    id: 'peas',
    name: 'Sárgaborsó',
    unit: '500 g',
    price: 390,
    art: 'peas',
    onList: false,
    category: 'Szárazáru',
  },
  {
    id: 'eggs',
    name: 'Friss tojás',
    unit: '6 db',
    price: 590,
    art: 'eggs',
    onList: false,
    category: 'Tejtermék',
  },
  {
    id: 'sponge',
    name: 'Konyhai szivacs',
    unit: '3 db',
    price: 349,
    art: 'sponge',
    onList: false,
    category: 'Háztartás',
  },
  {
    id: 'toothpaste',
    name: 'Mentolos fogkrém',
    unit: '75 ml',
    price: 649,
    art: 'toothpaste',
    onList: false,
    category: 'Háztartás',
  },
  {
    id: 'chips',
    name: 'Prémium chips',
    unit: '140 g',
    price: 799,
    art: 'chips',
    onList: false,
    isImpulse: true,
    category: 'Nasi',
  },
  {
    id: 'drink',
    name: 'Szénsavas üdítő',
    unit: '0,5 l',
    price: 549,
    art: 'drink',
    onList: false,
    isImpulse: true,
    category: 'Nasi',
  },
];

export interface MysteryItem {
  id: string;
  name: string;
  art: ProductArtId;
  clues: [string, string, string];
  retailFact: string;
}

export const MYSTERY_ITEMS: MysteryItem[] = [
  {
    id: 'alma',
    name: 'Alma',
    art: 'apple',
    clues: [
      'Forma: Kerekded, tenyérbe simuló, a tetején kis bemélyedés és vékony szár érezhető.',
      'Felület: Hűvös, teljesen sima, enyhén viaszos héj, nem horpad be könnyen.',
      'Súly és érzet: Tömör, lédús gyümölcs, a zöldség-gyümölcs osztály sztárja.',
    ],
    retailFact: 'Az almát mindig óvatosan pakoljuk a rekeszbe, mert a megütődött gyümölcs gyorsan barnul.',
  },
  {
    id: 'citrom',
    name: 'Citrom',
    art: 'lemon',
    clues: [
      'Forma: Ovális, két végén jellegzetes kis csúcsos kidudorodás tapintható.',
      'Felület: Apró pórusokkal teli, kissé rücskös, rugalmas citrus-héj.',
      'Illat-nyom: Ha megdörzsölöd, friss, fanyar illóolaj érződik a kezeden.',
    ],
    retailFact: 'A kezeletlen héjú citromot a vevők kifejezetten keresik süteményekhez — érdemes kiemelni a címkén!',
  },
  {
    id: 'szivacs',
    name: 'Szivacs',
    art: 'sponge',
    clues: [
      'Forma: Könnyű, szögletes téglatest, könnyedén össze tudod nyomni az ujjaiddal.',
      'Felület: Az egyik oldala puha, szivacsos hab, a másik oldala érdes dörzsifelület.',
      'Súly és hang: Szinte súlytalan, összenyomva azonnal visszanyeri az alakját.',
    ],
    retailFact: 'A háztartási vegyi áruk és szivacsok mindig külön polcra kerülnek az élelmiszerektől.',
  },
  {
    id: 'fogkrem',
    name: 'Fogkrém',
    art: 'toothpaste',
    clues: [
      'Forma: Hosszúkás, keskeny papírdobozban vagy hajlékony tubusban van, egyik végén csavaros kupakkal.',
      'Felület: Sima kartondoboz vagy sima műanyag tubus, belenyomva enyhén enged.',
      'Súly: Közepesen tömör, pasztaszerű töltettel a drogéria polcáról.',
    ],
    retailFact: 'A szemmagasságba kihelyezett fogkrémek akár 30%-kal jobban fogynak a boltokban.',
  },
  {
    id: 'teszta',
    name: 'Csomagolt tészta',
    art: 'pasta',
    clues: [
      'Forma: Lapos, zörgő tasak, benne sok apró, kemény, csavart vagy cső alakú darabka.',
      'Felület: Fényes, sima fóliacsomagolás, ami tapintásra hangosan zörög.',
      'Súly és hang: Rázásra száraz, kopogó hangot ad ki — fél kilós alapélelmiszer.',
    ],
    retailFact: 'A száraztésztáknál a FIFO elv (régebbi lejárat elöl) segít megelőzni az élelmiszer-pazarlást.',
  },
  {
    id: 'jatek',
    name: 'Kisebb játék',
    art: 'toy',
    clues: [
      'Forma: Apró, szilárd tárgy, mozgatható vagy kerekedő részekkel és sima élekkel.',
      'Felület: Kemény, fényes műanyag vagy festett fa, nem ehető és nem összenyomható.',
      'Súly és hang: Könnyű, a kasszazóna melletti ajándék- vagy játékpolcon találod.',
    ],
    retailFact: 'A játékokon minden kereskedőnek ellenőriznie kell a CE biztonsági jelölést és a korhatár-piktogramot.',
  },
];

export type ShelfCategoryId = 'fresh' | 'dry' | 'home';

export interface ShelfItem {
  id: string;
  name: string;
  art: ProductArtId;
  targetShelf: ShelfCategoryId;
  hint: string;
}

export const SHELF_CATEGORIES: { id: ShelfCategoryId; title: string; subtitle: string }[] = [
  { id: 'fresh', title: 'Friss gyümölcs', subtitle: 'Hűtött / zöldség-gyümölcs pult' },
  { id: 'dry', title: 'Szárazáru és pékáru', subtitle: 'Kenyér, tészta, hüvelyesek' },
  { id: 'home', title: 'Háztartás és drogéria', subtitle: 'Élelmiszertől elkülönítve' },
];

export const SHELF_ITEMS: ShelfItem[] = [
  { id: 's-apple', name: 'Magyar alma', art: 'apple', targetShelf: 'fresh', hint: 'Gyümölcs rekesz' },
  { id: 's-pasta', name: 'Száraztészta', art: 'pasta', targetShelf: 'dry', hint: 'Szárazáru polc' },
  { id: 's-sponge', name: 'Konyhai szivacs', art: 'sponge', targetShelf: 'home', hint: 'Háztartási sor' },
  { id: 's-lemon', name: 'Friss citrom', art: 'lemon', targetShelf: 'fresh', hint: 'Citrus pult' },
  { id: 's-bread', name: 'Friss kenyér', art: 'bread', targetShelf: 'dry', hint: 'Pékáru állvány' },
  { id: 's-toothpaste', name: 'Fogkrém', art: 'toothpaste', targetShelf: 'home', hint: 'Drogéria részleg' },
];

export interface WeighingTask {
  id: string;
  itemName: string;
  art: ProductArtId;
  targetGrams: number;
  toleranceGrams: number;
  unitPricePerKg: number;
}

export const WEIGHING_TASKS: WeighingTask[] = [
  {
    id: 'w-pasta',
    itemName: 'Száraztészta (orsótészta)',
    art: 'pasta',
    targetGrams: 250,
    toleranceGrams: 15,
    unitPricePerKg: 980,
  },
  {
    id: 'w-beans',
    itemName: 'Vörösbab',
    art: 'beans',
    targetGrams: 300,
    toleranceGrams: 15,
    unitPricePerKg: 1190,
  },
  {
    id: 'w-peas',
    itemName: 'Sárgaborsó',
    art: 'peas',
    targetGrams: 200,
    toleranceGrams: 15,
    unitPricePerKg: 780,
  },
];

export interface PackagingQuestion {
  scenario: string;
  options: {
    id: string;
    title: string;
    detail: string;
    isBest: boolean;
    feedback: string;
  }[];
}

export const PACKAGING_QUESTION: PackagingQuestion = {
  scenario:
    'Egy vásárló ajándékba visz egy törékeny kézműves mézet és egy frissen sült péksüteményt. Melyik csomagolási megoldás a legprofibb?',
  options: [
    {
      id: 'plastic-mix',
      title: 'Egyetlen vékony műanyag zacskóba mindkettőt',
      detail: 'Gyors, de összenyomódhat a péksütemény és összetörhet az üveg.',
      isBest: false,
      feedback:
        'A friss pékáru és a nehéz üveg együtt könnyen megsérül, ráadásul ajándéknak sem esztétikus.',
    },
    {
      id: 'craft-pro',
      title: 'Selyempapír + merev díszdoboz az üvegnek, külön papírtasak a pékárunak',
      detail: 'Védi a törékeny árut, szellőzik a pékáru, és prémium élményt ad.',
      isBest: true,
      feedback:
        'Profi értékesítői választás! A törékeny terméket rögzítjük, a friss pékárut szellőző papírtasakba tesszük.',
    },
    {
      id: 'foil-tight',
      title: 'Légbuborék nélkül, szoros folpackba tekerve',
      detail: 'Befülled a pékáru, és nem véd az ütődéstől.',
      isBest: false,
      feedback:
        'A meleg vagy ropogós pékáru megpuhul a fóliában, az üveg pedig nem kap ütés elleni védelmet.',
    },
  ],
};

export interface UnitPriceRow {
  product: string;
  pricePerKg: number;
}

export const PRICING_TABLE: UnitPriceRow[] = [
  { product: 'Alma', pricePerKg: 699 },
  { product: 'Banán', pricePerKg: 899 },
  { product: 'Szőlő', pricePerKg: 1499 },
  { product: 'Dió', pricePerKg: 3990 },
];

export interface PricingQuestion {
  id: string;
  prompt: string;
  tag: string;
  options: number[];
  correctAnswer: number;
  explanation: string;
}

export const PRICING_QUESTIONS: PricingQuestion[] = [
  {
    id: 'q1',
    tag: 'Tömegár számítás',
    prompt: 'Mennyi 1,5 kg alma ára?',
    options: [999, 1049, 1149, 1398],
    correctAnswer: 1049,
    explanation: '699 Ft × 1,5 = 1 048,5 Ft, amit kerekítve 1 049 Ft-ra számolunk.',
  },
  {
    id: 'q2',
    tag: 'Fél kiló ára',
    prompt: 'Mennyibe kerül 0,5 kg dió?',
    options: [1895, 1995, 2095, 1950],
    correctAnswer: 1995,
    explanation: '3 990 Ft ÷ 2 = 1 995 Ft.',
  },
  {
    id: 'q3',
    tag: 'Kosár összegzés',
    prompt: 'Egy vásárló 2 kg banánt és 1 kg almát vesz. Mennyit fizet összesen?',
    options: [2297, 2398, 2497, 2597],
    correctAnswer: 2497,
    explanation: '2 × 899 Ft (1 798 Ft) + 699 Ft = 2 497 Ft.',
  },
  {
    id: 'q4',
    tag: 'Visszajáró 5 000 Ft-ból',
    prompt: 'A vásárló 5 000 Ft-ot ad a 2 497 Ft-os vásárlásra. Mennyi a pontos visszajáró?',
    options: [2403, 2503, 2513, 2603],
    correctAnswer: 2503,
    explanation: '5 000 Ft − 2 497 Ft = 2 503 Ft (készpénzes fizetésnél a bolti 5 Ft-os kerekítéssel 2 505 Ft jár vissza).',
  },
  {
    id: 'q5',
    tag: '20%-os akció',
    prompt: 'A dió (3 990 Ft/kg) ma 20%-os akcióban van! Mennyi az akciós ára?',
    options: [2992, 3192, 3290, 3490],
    correctAnswer: 3192,
    explanation: '20% kedvezmény = 798 Ft. 3 990 Ft − 798 Ft = 3 192 Ft.',
  },
];

export interface ProduceQuizItem {
  id: string;
  image: string;
  correctName: string;
  options: string[];
  pluCode: string;
  tip: string;
}

export const PRODUCE_QUIZ_ITEMS: ProduceQuizItem[] = [
  {
    id: 'pomegranate',
    image: IMAGES.pomegranate,
    correctName: 'Gránátalma',
    options: ['Gránátalma', 'Vérnarancs', 'Füge', 'Datolyaszilva'],
    pluCode: 'PLU 3127',
    tip: 'A jó minőségű gránátalma méretéhez képest nehéz, héja feszes és mélyvörös.',
  },
  {
    id: 'kohlrabi',
    image: IMAGES.kohlrabi,
    correctName: 'Karalábé',
    options: ['Zellergumó', 'Karalábé', 'Fehér retek', 'Édeskömény'],
    pluCode: 'PLU 4628',
    tip: 'A friss karalábét a ropogós, élénkzöld leveleiről ismered fel a zöldségpulton.',
  },
  {
    id: 'eggplant',
    image: IMAGES.eggplant,
    correctName: 'Padlizsán',
    options: ['Cukkini', 'Fekete retek', 'Padlizsán', 'Lila édesburgonya'],
    pluCode: 'PLU 4081',
    tip: 'A friss padlizsán héja fényes és sima, a csészelevele pedig élénkzöld.',
  },
  {
    id: 'beetroot',
    image: IMAGES.beetroot,
    correctName: 'Cékla',
    options: ['Cékla', 'Hónapos retek', 'Lilahagyma', 'Rebarbara'],
    pluCode: 'PLU 4539',
    tip: 'A cékla kemény gumója hetekig eláll hűvös helyen, zsenge levele is ehető.',
  },
  {
    id: 'avocado',
    image: IMAGES.avocado,
    correctName: 'Avokádó',
    options: ['Kivi', 'Mangó', 'Avokádó', 'Zöld körte'],
    pluCode: 'PLU 4225',
    tip: 'A „Ready to eat” (fogyasztásra kész) avokádó enyhe nyomásra puhán enged a száránál.',
  },
];

export function formatFt(value: number): string {
  return `${value.toLocaleString('hu-HU')} Ft`;
}
