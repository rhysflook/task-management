export interface AuthUser {
	id: string;
	email: string;
	name: string;
	role: "user" | "admin" | "guest";
}