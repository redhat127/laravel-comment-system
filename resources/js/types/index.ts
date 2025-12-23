export type UsersTable = {
  id: string;
  name: string;
  username: string;
  email: string;
  username_changed_at: string | null;
  email_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  avatar: string | null;
};

export type CommentsTable = {
  id: string;
  body: string;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
};

export type SharedPropAuth = {
  auth?: {
    data: Pick<
      UsersTable,
      'id' | 'name' | 'username' | 'email' | 'email_verified_at' | 'username_changed_at' | 'created_at' | 'updated_at' | 'avatar'
    >;
  };
};

export type FlashMessage = {
  flashMessage?: {
    type: 'error' | 'success';
    text: string;
  };
};
