/** An assignment the student is enrolled in but hasn't submitted to yet. */
export type EnrolledAssignment = {
  id: string;
  name: string;
  course: string;
  due: string;
  soon: boolean;
  instructor: string;
  words: string;
  fileTypes: string;
  maxSize: string;
  description: string;
};

export type SelectedFile = {
  name: string;
  size: string;
  ext: string;
};

export type NewSubmission = SelectedFile & { assignment: string };
