export function convertDate(dateISO: string): string {
    const date = new Date(dateISO);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}