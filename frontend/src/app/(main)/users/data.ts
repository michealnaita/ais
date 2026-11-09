/* Mock user-management API backed by an in-memory store. Replace with real API calls. */
import { mockDelay } from "@/services/mockDelay";
import type { User, UserFormData } from "./types";

const SEED: User[] = [
  { id: 4012, name: "Elif Yılmaz", email: "elif.yilmaz@university.edu", role: "student", active: true },
  { id: 4013, name: "Zeynep Kaya", email: "zeynep.kaya@university.edu", role: "student", active: true },
  { id: 2088, name: "Dr. Aylin Demir", email: "a.demir@university.edu", role: "instructor", active: true },
  { id: 4015, name: "Can Demir", email: "can.demir@university.edu", role: "student", active: false },
  { id: 2091, name: "Dr. Selin Doğan", email: "s.dogan@university.edu", role: "instructor", active: true },
  { id: 1003, name: "Murat Aslan", email: "m.aslan@university.edu", role: "admin", active: true },
  { id: 4020, name: "Burak Çelik", email: "burak.celik@university.edu", role: "student", active: true },
  { id: 4022, name: "Merve Aydın", email: "merve.aydin@university.edu", role: "student", active: true },
  { id: 2095, name: "Dr. Kerem Öztürk", email: "k.ozturk@university.edu", role: "instructor", active: false },
  { id: 4031, name: "Deniz Arslan", email: "deniz.arslan@university.edu", role: "student", active: true },
  { id: 4033, name: "Naz Eren", email: "naz.eren@university.edu", role: "student", active: true },
  { id: 1006, name: "Pelin Avcı", email: "p.avci@university.edu", role: "admin", active: true },
];

let users = [...SEED];

export async function fetchUsers(): Promise<User[]> {
  await mockDelay();
  return users;
}

export async function createUser(data: UserFormData): Promise<User> {
  await mockDelay();
  const created: User = { id: Math.floor(4000 + Math.random() * 5999), active: true, ...data };
  users = [created, ...users];
  return created;
}

export async function updateUser(id: number, data: Partial<UserFormData & Pick<User, "active">>): Promise<void> {
  await mockDelay();
  users = users.map(u => u.id === id ? { ...u, ...data } : u);
}
