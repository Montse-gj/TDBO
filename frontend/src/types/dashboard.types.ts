// Tipos compartidos para los hooks del dashboard
export type Group = {
  group_id: number;
  group_name: string;
  created_by: string;
  trip_starts: string;
  trip_ends: string;
};

export type Member = {
  user_id: number;
  user_name: string;
  user_email: string;
};

export type Expense = {
  expense_id: number;
  group_id: number;
  paid_by_user_id: number;
  amount: number;
  description: string;
  created_at: string;
  paidByUser: {
    user_id: number;
    user_name: string;
    user_email: string;
  };
};

export type MemberBalance = {
  user_id: number;
  user_name: string;
  user_email: string;
  total_paid: number;
  share: number;
  net_balance: number;
};

export type SuggestedTransfer = {
  from_user_id: number;
  from_user_name: string;
  to_user_id: number;
  to_user_name: string;
  amount: number;
};

export type BalanceResponse = {
  group_id: number;
  total_group_spent: number;
  number_of_members: number;
  share_per_member: number;
  member_balances: MemberBalance[];
  suggested_transfers: SuggestedTransfer[];
};
