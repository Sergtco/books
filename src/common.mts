import { stringify } from "csv-stringify/sync";
import { writeFile } from "node:fs/promises";
import { BookInfo } from "./models.mjs";

export function delay(time: number): Promise<undefined> {
    return new Promise(resolve => setTimeout(resolve, time));
}

export interface Parser {
    parse(startPage?: number, pageCount?: number): Promise<BookInfo[]>
}

export async function bulkParse(parsers: Parser[], fromPage: number = 1, countPages: number = 1): Promise<BookInfo[]> {
    return Promise.all(
        parsers.map(parser => parser.parse(fromPage, countPages))
    ).then(books => books.flat())
}

export async function saveToTsv(filename: string, books: BookInfo[]) {
    writeFile(filename, stringify(books, { delimiter: "\t", header: true }))
}
