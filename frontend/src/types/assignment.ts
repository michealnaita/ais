export type AssignmentStatus = "open" | "closed" | "upcoming";

export type Assignment = {
  id: number;
  name: string;
  course: string;
  deadline: string;
  iso: string;
  submitted: number;
  total: number;
  status: AssignmentStatus;
};

export type AssignmentFormData = Pick<Assignment, "name" | "course" | "iso" | "deadline" | "total" | "status">;
