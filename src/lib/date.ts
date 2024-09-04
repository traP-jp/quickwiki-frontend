export function convertDate(dateISO: string): string {
    const date = new Date(dateISO);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}
