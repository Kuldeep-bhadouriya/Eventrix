export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  emailVerified: boolean;
  phone: string | null;
  collegeRollNumber: string | null;
  semester: string | null;
  department: string | null;
};
