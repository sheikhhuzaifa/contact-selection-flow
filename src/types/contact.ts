export type ContactType = "company" | "individual";

export interface Contact {
  id: string;
  type: ContactType;
  name: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email: string;
  addressLine1: string;
  city: string;
  country: string;
}

export interface AppState {
  client: Contact | null;
  primaryContact: Contact | null;
  secondaryContact: Contact | null;
}

export type ContactFieldKey = keyof AppState;
