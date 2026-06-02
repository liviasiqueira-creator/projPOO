export class Phone {
    readonly value: string;

    constructor(input: string) {
        this.value = Phone.format(input);
    }

    private static format(input: string): string {
        const phone = input.replace(/\D/g, "");
        const normalized = phone.startsWith("55")
            ? phone.slice(2)
            : phone;

        if (normalized.length !== 10 && normalized.length !== 11) {
            throw new Error("Invalid phone.");
        }
        return `+55${normalized}`;
    }
}