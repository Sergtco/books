export function delay(time: number): Promise<undefined> {
    return new Promise(resolve => setTimeout(resolve, time));
}

export interface Parser {
    parse(startPage?: number, pageCount?: number): Promise<BookInfo[]>
}

export type BookInfo = {
    name: string;
    authors: string[];
    genres: string[];
    cycle?: string;
    annotation?: string;
    date?: string;
};
