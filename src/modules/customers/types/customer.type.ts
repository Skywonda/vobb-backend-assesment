export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreatePurchaseDto {
  customerId: string;
  carId: string;
  price: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
}
