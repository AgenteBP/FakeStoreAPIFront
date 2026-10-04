import type { Address, NewAddress } from "../types/Address";
import type { AuthUser } from "../types/AuthUser";
import { apiRequest } from "./api";

// Direcciones guardadas del usuario logueado
export function getAddresses(user: AuthUser): Promise<Address[]> {
  return apiRequest<Address[]>(`/api/users/${user.idUser}/addresses`, { token: user.token });
}

// Las direcciones que se cargan desde el checkout son siempre de envío
export function createAddress(user: AuthUser, address: NewAddress): Promise<Address> {
  return apiRequest<Address>(`/api/users/${user.idUser}/addresses`, {
    method: "POST",
    token: user.token,
    body: { ...address, type: "SHIPPING" },
  });
}
