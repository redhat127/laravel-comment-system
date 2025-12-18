export type UsersTable = {
  id: string;
  name: string;
  username: string;
  email: string;
  email_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SharedPropAuth = {
  auth?: Pick<UsersTable, 'id' | 'name' | 'username' | 'email' | 'email_verified_at' | 'created_at' | 'updated_at'>;
};

export type SharedFlashMessage = {
  flashMessage?: {
    type: 'error' | 'success';
    text: string;
  };
};
