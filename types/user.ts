/**
 * Shared user and auth types
 */

export type User = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export type LoginCredentials = {
  phone: string;
  password: string;
};

export type SignUpCredentials = {
  name: string;
  phone: string;
  email: string;
  password: string;
};

export type Lawyer = {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rate: string;
  rating: number;
  image: any;
  about: string;
};

