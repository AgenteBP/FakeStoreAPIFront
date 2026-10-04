export interface AuthUser {
  idUser: number;
  name: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  token: string;
}
