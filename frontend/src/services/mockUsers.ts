/* Hard-coded user until auth exists. Change CURRENT_USER to view the app as another role. */
import type { CurrentUser, Role } from '@/types/user';

export const MOCK_USERS: Record<Role, CurrentUser> = {
  student: {
    id: 1001,
    role: 'student',
    name: 'Mehmet Hassan',
    initials: 'MH',
    sub: 'Turkish History · HIST 304',
  },
  instructor: {
    id: 2001,
    role: 'instructor',
    name: 'Dr. Aylin Demir',
    initials: 'AD',
    sub: 'Instructor · HIST 304',
  },
  admin: {
    id: 3001,
    role: 'admin',
    name: 'Murat Aslan',
    initials: 'MA',
    sub: 'Administrator',
  },
};

export const CURRENT_USER: CurrentUser = MOCK_USERS.student;
