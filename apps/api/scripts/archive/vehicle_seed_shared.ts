const sourceVehicles = [
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
] as const;

export interface SeedVehicleRecord {
  year: number;
  make: string;
  model: string;
  desc: string;
  price: number;
  mileage: number;
  fuel: string;
  imgId: string;
  color: string;
  status: "Available";
  vin: string;
  key: string;
  slug: string;
}

export interface UploadedAssetRecord {
  vehicleKey: string;
  make: string;
  model: string;
  year: number;
  source: "repo-root-jpg" | "unsplash" | "fallback-copy";
  tempFileName: string;
  tempFilePath: string;
  fileName: string;
  fileUrl: string;
}

export interface UploadedAssetManifest {
  generatedAt: string;
  assets: UploadedAssetRecord[];
}

const colorPalette = [
  "Guards Red",
  "Midnight Black",
  "Obsidian",
  "Pangea Green",
  "Nardo Grey",
  "Satin Titanium",
  "Frozen Marina Bay Blue",
  "Blu Roma",
  "Launch Green",
] as const;

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseInteger = (value: string): number => Number.parseInt(value.replace(/,/g, ""), 10);

export const getVehicleKey = (vehicle: Pick<SeedVehicleRecord, "year" | "make" | "model">): string =>
  `${vehicle.year}-${slugify(vehicle.make)}-${slugify(vehicle.model)}`;

export const buildUnsplashUrl = (imgId: string, width = 2400): string =>
  `https://images.unsplash.com/photo-${imgId}?q=80&w=${width}&auto=format&fit=crop&fm=jpg`;

export const imageFieldNames = [
  "image1",
  "image2",
  "image3",
  "image4",
  "image5",
  "image6",
  "image7",
  "image8",
  "image9",
  "image10",
] as const;

export const seedVehicles: SeedVehicleRecord[] = sourceVehicles.map((vehicle, index) => {
  const key = getVehicleKey(vehicle);

  return {
    ...vehicle,
    price: parseInteger(vehicle.price),
    mileage: parseInteger(vehicle.mileage),
    color: colorPalette[index % colorPalette.length],
    status: "Available",
    vin: `VX${String(202600000000000 + index)}`,
    key,
    slug: `${key}-${slugify(vehicle.fuel)}`,
  };
});

export const localRootVehicleCount = 3;