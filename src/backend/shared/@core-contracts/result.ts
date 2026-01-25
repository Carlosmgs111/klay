type Status = "SUCCESS" | "ERROR";

export type ApplicationResult<T> =
  | { status: "SUCCESS"; data: T }
  | { status: "ERROR"; error: ApplicationError };

export interface ApplicationError {
  code: number;
  message: string;
  details?: any;
}

export class Result<E, T> {
  public isSuccess: boolean;
  public error?: E;
  public value?: T;

  private constructor(isSuccess: boolean, error?: E, value?: T) {
    this.isSuccess = isSuccess;
    this.error = error;
    this.value = value;
  }
  public static success<E, T>(value: T): Result<E, T> {
    return new Result<E, T>(true, undefined, value);
  }
  public static failure<E, T>(error: E): Result<E, T> {
    return new Result<E, T>(false, error);
  }
  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error("No value present");
    }
    return this.value!;
  }
  public getError(): E {
    if (this.isSuccess) {
      throw new Error("No error present");
    }
    return this.error!;
  }
}
