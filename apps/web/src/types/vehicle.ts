export interface Vehicle {
  id: string;
  vin?: string | null;
  make: string;
  model: string;
  year: number;
  color: string;
  mileage?: number | null;
  price?: number | null;
  description?: string | null;
  status: string;
  thumbnail: string;
  image1?: string | null;
  image2?: string | null;
  image3?: string | null;
  image4?: string | null;
  image5?: string | null;
  image6?: string | null;
  image7?: string | null;
  image8?: string | null;
  image9?: string | null;
  image10?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface VehiclesListResponse {
  success: boolean;
  message: string;
  data: Vehicle[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  error?: string;
  timestamp: string;
}