type Status = "SUCCESS" | "ERROR";

export type ApplicationResult<T> =
  | { status: "SUCCESS"; data: T }
  | { status: "ERROR"; error: ApplicationError };

export interface ApplicationError {
  code: number;
  message: string;
  details?: any;
}
