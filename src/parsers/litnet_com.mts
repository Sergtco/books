import got from "got";
import * as cheerio from "cheerio";
import { delay, Parser } from "../common.mjs";
import { BookInfo } from "../models.mjs";

export class LitnetComParser implements Parser {
    baseUrl: string;

    constructor() {
        this.baseUrl = "https://litnet.com";
    }

    public async parse(startPage: number = 1, pageCount: number = 1): Promise<BookInfo[]> {
        return Promise.all(Array(pageCount)
            .fill(0)
            .map(async (_, ind) => {
                await delay(20000 * ind)
                console.log(`litnet.com: getting books page ${ind + startPage}`)
                return this.getBookPathList(ind + startPage).then(paths =>
                    paths
                        .map(async (path, i) => {
                            await delay(400 * i);
                            return this.getBookInfo(path);
                        })
                )
            }
            )
        )
            .then((val) => Promise.all(val.flat()))
            .catch((err) => { throw Error("parse litnet.com: ", { cause: err }) })
    }

    private async getBookPathList(pageNumber: number = 1): Promise<string[]> {
        return got(this.baseUrl + `/ru/top/latest-new?page=${pageNumber}`)
            .then((data) =>
                cheerio.load(data.body)(".book-title>a")
                    .toArray()
                    .map((elem) => {
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
            return cheerio.load(bookPage)("div.book-view-info>div:nth-child(1)>div>h1")
                .contents().first().text().trim()
        } catch (err) {
            throw Error("get book title: ", { cause: err })
        }
    }

    private getBookAuthors(bookPage: string): string[] {
        try {
            return cheerio.load(bookPage)(".author")
                .contents().toArray()
                .map((el) => el.data)
                .filter((v) => v != undefined)
        } catch (err) {
            throw Error("get book authors: ", { cause: err })
        }
    }

    private getBookGenres(bookPage: string): string[] {
        try {
            return cheerio.load(bookPage)(".breadcrumb>li>a")
                .contents().toArray()
                .map((elem) => elem.data)
                .filter((v) => v != undefined && v.trim() != "")
                .filter((v, i, ar) => ar.indexOf(v) === i)
                .slice(1)
        } catch (err) {
            throw Error("get book genres: ", { cause: err })
        }
    }

    private getBookCycle(bookPage: string): string {
        try {
            const text = cheerio.load(bookPage)(".book-view-info>div:nth-child(1)>div>p>span.meta-name")
                .filter((_, elem) => elem.type == "tag" && elem.children[0].data == "Цикл: ")
                .next()
                .text()
            return text == "" ? undefined : text;
        } catch (err) {
            throw Error("get book cycle: ", { cause: err });
        }
    }

    private getBookAnnotation(bookPage: string): string {
        try {
            return cheerio.load(bookPage)("#annotation")
                .contents().text().trim()
        } catch (err) {
            throw Error("get book annotation: ", { cause: err })
        }
    }

    private getBookDate(bookPage: string): string {
        try {
            const text = cheerio.load(bookPage)(".book-view-info>div:nth-child(2)>div>p:nth-child(7)>span:nth-child(2)")
                .contents()
                .first()
                .text()
                .trim();
            const minus = text.indexOf("—");
            if (text.indexOf("...") != -1) {
                return new Date(text.slice(0, minus)).getFullYear().toString();
            }
            return new Date(text.slice(minus + 1)).getFullYear().toString();
        } catch (err) {
            throw Error("get book date: ", { cause: err });
        }
    }
};
