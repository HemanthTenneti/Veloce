export interface Vehicle {
  id: string;
  name: string;
  color: string;
  price: number;
  status: "available" | "reserved" | "sold";
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleProperties: string;
  message: string;
  source?: string;
  status?: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  leadId: string;
}
