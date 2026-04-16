export type RegistrationTab = "all" | "upcoming" | "completed" | "cancelled";
export type RegistrationSort = "date" | "name" | "status";
export type SortOrder = "asc" | "desc";

export type RegistrationStatus = "REGISTERED" | "ATTENDED" | "CANCELLED";

export type RegisteredEventItem = {
  registrationId: string;
  registrationStatus: RegistrationStatus;
  registeredAt: string;
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    venue: string;
    bannerUrl: string | null;
    status: string;
  };
};

export type RegistrationsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: {
    message?: string;
  };
  meta?: {
    pagination?: RegistrationsPagination;
  };
};
