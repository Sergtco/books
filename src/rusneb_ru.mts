import got from "got";
import * as cheerio from "cheerio";
import { BookInfo, delay, Parser } from "./common.mjs";

export class RusnebRuParser implements Parser {
    baseUrl: string;

    constructor() {
        this.baseUrl = "https://rusneb.ru";
    }

    public async parse(startPage: number = 1, pageCount: number = 1): Promise<BookInfo[]> {
        return Promise.all(Array(pageCount)
            .fill(0)
            .map(async (_, ind) => {
                await delay(10000 * ind)
                console.log(`rusneb.ru: getting books page ${ind + startPage}`)
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
            .catch((err) => { throw Error("parse rusneb.ru: ", { cause: err }) })
    }

    private async getBookPathList(pageNumber: number = 1): Promise<string[]> {
        return got(this.baseUrl + `/search/?c[0]=25&PAGEN_1=${pageNumber}`)
            .then((data) =>
                cheerio.load(data.body)('div[class^="search-list__item_column"]:nth-child(1)>p:nth-child(1)>a[class^="search-list__item_link"]')
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
            return cheerio.load(bookPage)('h1[class^="title"]')
                .text().trim()
        } catch (err) {
            throw Error("get book title: ", { cause: err })
        }
    }

    private getBookAuthors(bookPage: string): string[] {
        try {
            return cheerio.load(bookPage)('div.cards__elem_right>div>div>div.cards__author>span[itemprop="author"]')
                .contents().toArray()
                .map(el => el.data)
        } catch (err) {
            throw Error("get book authors: ", { cause: err })
        }
    }

    private getBookGenres(bookPage: string): string[] {
        try {
            return cheerio.load(bookPage)('div.content:nth-child(1)')
                .contents()
                .toArray()
                .map(el => el.data)
                .filter(el => el == undefined || el.trim() == "")

        } catch (err) {
            throw Error("get book genres: ", { cause: err })
        }
    }

    private getBookCycle(bookPage: string): string {
        try {
            const text = cheerio.load(bookPage)('a[itemprop="isPartOf"]')
                .contents()
                .text()
                .trim()
            return text == "" ? undefined : text;
        } catch (err) {
            throw Error("get book cycle: ", { cause: err });
        }
    }

    private getBookAnnotation(bookPage: string): string {
        try {
            return cheerio.load(bookPage)('.annotation')
                .text().trim()
        } catch (err) {
            throw Error("get book annotation: ", { cause: err })
        }
    }

    private getBookDate(bookPage: string): string {
        try {
            return cheerio.load(bookPage)('div.cards-table>div>div')
                .filter((_, el) => el.type == "tag" && el.children[0].data != undefined && el.children[0].data.match("Год издания") != undefined)
                .next()
                .text().trim()
        } catch (err) {
            throw Error("get book date: ", { cause: err });
        }
    }
};
