export type Profile = {
  id: string;
  username: string;
  full_name: string;
  company: string;
  job_title: string;
  email: string;
  phone: string;
  website: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Connection = {
  id: string;
  user_id: string;
  connected_user_id: string;
  exchanged_via: "qr" | "link" | "search";
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string };
        Update: Partial<Profile>;
      };
      connections: {
        Row: Connection;
        Insert: Partial<Connection> & { user_id: string; connected_user_id: string };
        Update: Partial<Connection>;
      };
    };
  };
};
