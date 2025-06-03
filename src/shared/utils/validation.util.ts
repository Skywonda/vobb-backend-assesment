import { ValidationException } from '../errors/common.errors';

export class ValidationUtil {
  static validate(validations: { isValid: boolean; message: string }[]): void {
    const errors = validations
      .filter(v => !v.isValid)
      .map(v => v.message);

    if (errors.length > 0) {
      throw new ValidationException(errors.join(', '));
    }
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }
} 