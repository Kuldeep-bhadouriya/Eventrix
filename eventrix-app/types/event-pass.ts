export type EventPassData = {
  event: {
    id: string;
    title: string;
    date: string; // ISO
    time: string;
    venue: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  };
  registration: {
    id: string;
    referenceNumber: string;
    seatNumber: string | null;
  };
  qrValue: string;
};
