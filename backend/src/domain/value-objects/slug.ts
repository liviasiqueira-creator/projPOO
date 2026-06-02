export class Slug {
  readonly value: string;

  constructor(input: string) {
    this.value = Slug.format(input);
  }

  private static format(input: string): string {
    return input
      .normalize("NFD")                   // separa acentos
      .replace(/[\u0300-\u036f]/g, "")    // remove acentos
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")       // remove especiais
      .trim()
      .replace(/\s+/g, "-")               // espaços → hífens
      .replace(/-+/g, "-");               // hífens duplos → simples
  }
}