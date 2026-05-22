export interface User {
    id: number
    name: string
    email: string
}
export interface ExpenseParticipant {
    amount_owed: number
    user: User

}
export interface Group {
    id: number
    name: string
    created_by: User
    members: User[]
    expenses?: Expense[]
}
export interface Expense {
    id: number
    group_id: number
    paid_by_user_id: number
    amount: number
    created_at: Date
    description: string
    participants: ExpenseParticipant[]
}
export interface AuthResponse {
    user: User | null
    token: string | null
}