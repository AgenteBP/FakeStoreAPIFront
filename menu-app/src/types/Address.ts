// Datos que carga el usuario para una dirección nueva
export interface NewAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface Address extends NewAddress {
  idAddress: number;
}
