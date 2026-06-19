export interface PasswordBreachPort {
  assertSafe(password: string): Promise<void>;
}
