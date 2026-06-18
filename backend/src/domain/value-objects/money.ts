export class Money {
  readonly value: number;

  constructor(value: number) {
    this.value = Money.validate(value);
  }

  private static validate(value: number): number {
    if (!Number.isInteger(value)) {
      throw new Error("Money must be stored in cents.");
    }

    if (value < 0) {
      throw new Error("Money cannot be negative.");
    }

    return value;
  }

  get formatted(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(this.value / 100);
  }
}