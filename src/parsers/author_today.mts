import got from "got";
import * as cheerio from "cheerio";
import { delay, Parser } from "../common.mjs";
import { BookInfo } from "../models.mjs";

export class AuthorTodayParser implements Parser {
    baseUrl: string;

    constructor() {
        this.baseUrl = "https://author.today";
    }

    public async parse(startPage: number = 1, pageCount: number = 1): Promise<BookInfo[]> {
        return Promise.all(Array(pageCount)
            .fill(0)
            .map(async (_, ind) => {
                await delay(10000 * ind)
                console.log(`authors.today: getting books page ${ind + startPage}`)
                return this.getBookPathList(ind + startPage).then(paths =>
                    paths
                        .map(async (path, i) => {
                            await delay(150 * i);
                            return this.getBookInfo(path);
                        })
                )
            }
            )
        )
            .then((val) => Promise.all(val.flat()))
            .catch((err) => { throw Error("parse authors.today: ", { cause: err }) })
    }

    private async getBookPathList(pageNumber: number = 1): Promise<string[]> {
        return got(this.baseUrl + `/work/genre/all/ebook?page=${pageNumber}`)
            .then((data) =>
                cheerio.load(data.body)("#search-results>div>div>.book-title>a")
                    .toArray()
                    .map((elem): string | null => {
                        switch (elem.type) {
                            case "tag":
                                return elem.attribs["href"]
                            default:
                                return null
                        }
                    })
                    .filter((elem) => elem != null)
            )
            .catch((err) => { throw Error("fetch book list", { cause: err }) })
    }

    private async getBookInfo(path: string): Promise<BookInfo> {
        return got(this.baseUrl + path)
            .then((data) =>
            ({
                url: this.baseUrl.concat(path),
                name: this.getBookTitle(data.body),
                authors: this.getBookAuthors(data.body),
                genres: this.getBookGenres(data.body),
                cycle: this.getBookCycle(data.body),
                annotation: this.getBookAnnotation(data.body),
                date: this.getBookDate(data.body)
            })


            )
            .catch((err) => { throw Error(`get book info ${this.baseUrl + path}: `, { cause: err }) })
    }

    private getBookTitle(bookPage: string): string {
        try {
            return cheerio.load(bookPage)(".book-meta-panel>.book-title")
                .contents().first().text().trim()
        } catch (err) {
            throw Error("get book title: ", { cause: err })
        }
    }

    private getBookAuthors(bookPage: string): string[] {
        try {
            return cheerio.load(bookPage)(".book-meta-panel>.book-authors")
                .children("span").children("a")
                .contents().toArray()
                .map((el) => el.data)
                .filter((v) => v != undefined)
        } catch (err) {
            throw Error("get book authors: ", { cause: err })
        }
    }

    private getBookGenres(bookPage: string): string[] {
        try {
            return cheerio.load(bookPage)(".book-meta-panel>div>.book-genres")
                .children("a")
                .contents().toArray()
                .map((elem) => elem.data)
                .filter((v) => v != undefined && v.trim() != "")
                .filter((v, i, ar) => ar.indexOf(v) === i)
        } catch (err) {
            throw Error("get book genres: ", { cause: err })
        }
    }

    private getBookCycle(bookPage: string): string {
        try {
            const selector = cheerio.load(bookPage)(".book-meta-panel>div>div:nth-child(3)>a")
                .contents().toArray();
            return selector.length > 0 ? selector[0].data : undefined;
        } catch (err) {
            throw Error("get book cycle: ", { cause: err });
        }
    }

    private getBookAnnotation(bookPage: string): string {
        try {
            return cheerio.load(bookPage)(".annotation>div")
                .contents().text().trim()
        } catch (err) {
            throw Error("get book annotation: ", { cause: err })
        }
    }

    private getBookDate(bookPage: string): string {
        try {
            const elem = cheerio.load(bookPage)(".book-meta-panel>div>div>span.hint-top")
                .toArray()
                .filter((elem) => elem.type == "tag" && elem.attribs["data-time"] != "" && elem.attribs["data-time"] != undefined).at(0);

            return elem && elem.type == "tag" ? (new Date(elem.attribs["data-time"])).getFullYear().toString() : undefined;
        } catch (err) {
            throw Error("get book date: ", { cause: err });
        }
    }
};

