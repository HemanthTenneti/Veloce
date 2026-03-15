export interface Vehicle {
  year: number;
  make: string;
  model: string;
  desc: string;
  price: string;
  mileage: string;
  fuel: string;
  imgId: string;
}

export const vehicles: Vehicle[] = [
  {
    year: 2023,
    make: "PORSCHE",
    model: "911 GT3 Touring",
    desc: "The purest distillation of driving.",
    price: "145,000",
    mileage: "2,400",
    fuel: "Petrol",
    imgId: "1614162692292-7ac56d7f7f1e",
  },
  {
    year: 2022,
    make: "TOYOTA",
    model: "Land Cruiser 300",
    desc: "The road ends where you decide it does.",
    price: "78,500",
    mileage: "42,000",
    fuel: "Diesel",
    imgId: "1598462058479-79a08e70a3c2",
  },
  {
    year: 2022,
    make: "MERCEDES-BENZ",
    model: "G63 AMG",
    desc: "Presence that demands absolute attention.",
    price: "162,000",
    mileage: "12,500",
    fuel: "Petrol",
    imgId: "1605559424843-9e4c228bf1c2",
  },
  {
    year: 2024,
    make: "LAND ROVER",
    model: "Defender 110 V8",
    desc: "Unstoppable capability meets modern luxury.",
    price: "95,500",
    mileage: "1,200",
    fuel: "Petrol",
    imgId: "1617531653332-bd46c24f2068",
  },
  {
    year: 2021,
    make: "AUDI",
    model: "RS6 Avant",
    desc: "Pace and space in perfect harmony.",
    price: "88,900",
    mileage: "28,000",
    fuel: "Petrol",
    imgId: "1603584173870-7d23f2a0e4ce",
  },
  {
    year: 2023,
    make: "ASTON MARTIN",
    model: "DBX 707",
    desc: "The sports car of SUVs.",
    price: "185,000",
    mileage: "4,500",
    fuel: "Petrol",
    imgId: "1644331046944-8d48e02d4f24",
  },
  {
    year: 2022,
    make: "BMW",
    model: "M5 Competition",
    desc: "Executive express redefined.",
    price: "82,000",
    mileage: "18,000",
    fuel: "Petrol",
    imgId: "1580273916550-e323be2ae537",
  },
  {
    year: 2020,
    make: "FERRARI",
    model: "Roma",
    desc: "La Nuova Dolce Vita.",
    price: "165,000",
    mileage: "9,000",
    fuel: "Petrol",
    imgId: "1592837372223-28c049e25e64",
  },
  {
    year: 2023,
    make: "RIVIAN",
    model: "R1S Launch Edition",
    desc: "Electric adventure awaits.",
    price: "92,000",
    mileage: "3,000",
    fuel: "Electric",
    imgId: "1660662259160-c44754ab34c8",
  },
];

/** Featured vehicles are the first 3 entries shown on the landing hero carousel */
export const featuredVehicles: Vehicle[] = [
  {
    year: 2023,
    make: "PORSCHE",
    model: "911 GT3 Touring",
    desc: "The purest distillation of driving.",
    price: "145,000",
    mileage: "2,400",
    fuel: "Petrol",
    imgId: "1614162692292-7ac56d7f7f1e",
  },
  {
    year: 2022,
    make: "MERCEDES-BENZ",
    model: "G63 AMG",
    desc: "Presence that demands absolute attention.",
    price: "162,000",
    mileage: "12,500",
    fuel: "Petrol",
    imgId: "1605559424843-9e4c228bf1c2",
  },
  {
    year: 2024,
    make: "LAND ROVER",
    model: "Defender 110 V8",
    desc: "The road ends where you decide it does.",
    price: "95,500",
    mileage: "1,200",
    fuel: "Petrol",
    imgId: "1617531653332-bd46c24f2068",
  },
];

/** Helper to get the Unsplash URL from an image ID */
export function getUnsplashUrl(imgId: string, width = 2940): string {
  return `https://images.unsplash.com/photo-${imgId}?q=80&w=${width}&auto=format&fit=crop`;
}

/** The single Supabase image used as fallback on inventory grid cards */
export const INVENTORY_CARD_IMG =
  "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg";
