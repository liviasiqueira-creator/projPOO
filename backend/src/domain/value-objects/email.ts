export class Email {
  readonly value: string;

  constructor(input: string) {
    this.value = Email.validate(input);
  }

  private static validate(input: string): string {
    const email = input.trim().toLowerCase();

    const regex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regex.test(email)) {
      throw new Error("Invalid email.");
    }

    return email;
  }
}