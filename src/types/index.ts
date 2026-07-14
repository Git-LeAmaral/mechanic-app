export interface Customer {
  id: string;
  name: string;
  document: string; // CPF or CNPJ
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  customerId: string; // Owner relation
  plate: string;      // License plate
  brand: string;      // Manufacturer (e.g. Ford)
  model: string;      // Model name (e.g. Fiesta)
  year: number;       // Year of manufacture
  color: string;      // Color
  mileage: number;    // Last recorded mileage
}

export type OSStatus = 'budget' | 'approved' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceItem {
  id: string;
  description: string;
  price: number;
  quantity: number;
}

export interface PartItem {
  id: string;
  description: string;
  price: number;
  quantity: number;
  partNumber?: string;
}

export interface ServiceOrder {
  id: string;
  osNumber: string;       // OS-1001, etc.
  customerId: string;
  vehicleId: string;
  entryDate: string;      // YYYY-MM-DD
  expectedDate: string;   // YYYY-MM-DD
  completionDate?: string; // YYYY-MM-DD
  mileage: number;        // Mileage at entry
  notes: string;
  status: OSStatus;
  services: ServiceItem[];
  parts: PartItem[];
  discount: number;       // Discount in BRL
  totalAmount: number;    // Calculated total
}
