export type SessionUser = {
  id: string;
  firmId: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "STAFF";
};
