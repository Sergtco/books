import got, { Response } from "got";
import * as cheerio from "cheerio";

export class AuthorTodayParser {
    baseUrl: string;
    constructor() {
        this.baseUrl = "https://author.today";
    }

    public async getBookUrlList(pageNumber: number = 1): Promise<string[]> {
        return got(this.baseUrl + `/work/genre/all/ebook?page=${pageNumber}`)
            .then((data) =>
                cheerio.load(data.body)("#search-results>div>div>.book-title>a")
                    .toArray()
                    .map((elem, _): string | null => {
                        switch (elem.type) {
                            case "tag":
                                return elem.attribs["href"]
                            default:
                                return null
                        }
                    })
                    .filter((elem, _) => elem != null)
            )
            .catch((err) => { throw Error("error fetching book list author.today", err) })
    }
    public async getBookInfo(path: string): Promise<BookInfo> {
        return got(this.baseUrl + path)
            .then((data) =>
                cheerio.load(data.body)("")
            )
    }
    private getBookTitle
};

export type BookInfo = {
    name?: string;
    authors: string[];
    genres: string[];
    cycle?: string;
    annotation?: string;
    date?: string;
};
