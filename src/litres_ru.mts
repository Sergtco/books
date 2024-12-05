import got from "got";
import * as cheerio from "cheerio";
import { BookInfo, delay, Parser } from "./common.mjs";

export class LitresRuParser implements Parser {
    baseUrl: string;

    constructor() {
        this.baseUrl = "https://litres.ru";
    }

    public async parse(startPage: number = 1, pageCount: number = 1): Promise<BookInfo[]> {
        return Promise.all(Array(pageCount)
            .fill(0)
            .map(async (_, ind) => {
                await delay(10000 * ind)
                console.log(`litres.ru: getting books page ${ind + startPage}`)
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
            .catch((err) => { throw Error("parse litres.ru: ", { cause: err }) })
    }

    private async getBookPathList(pageNumber: number = 1): Promise<string[]> {
        return got(this.baseUrl + `/new/?page=${pageNumber}`)
            .then((data) =>
                cheerio.load(data.body)('div[class^="ArtInfo_wrapper"]>a[data-testid^="art__title"]')
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
            return cheerio.load(bookPage)('h1[class^="BookCard_book__title"]')
                .contents().first().text().trim()
        } catch (err) {
            throw Error("get book title: ", { cause: err })
        }
    }

    private getBookAuthors(bookPage: string): string[] {
        try {
            return cheerio.load(bookPage)('div[class^="BookDetailsHeader_persons"]>a>div>div>span')
                .contents().toArray()
                .map(el => el.data)
        } catch (err) {
            throw Error("get book authors: ", { cause: err })
        }
    }

    private getBookGenres(bookPage: string): string[] {
        try {
            return cheerio.load(bookPage)('div[class^="BookGenresAndTags_genresList"]')
                .children('a')
                .contents()
                .toArray()
                .map(el => el.data)

        } catch (err) {
            throw Error("get book genres: ", { cause: err })
        }
    }

    private getBookCycle(bookPage: string): string {
        try {
            const text = cheerio.load(bookPage)('div[class^="BookDetailsHeader_series"]>div>div>a')
                .contents()
                .text()
            return text == "" ? undefined : text;
        } catch (err) {
            throw Error("get book cycle: ", { cause: err });
        }
    }

    private getBookAnnotation(bookPage: string): string {
        try {
            return cheerio.load(bookPage)('div[data-testid^="book__infoAboutBook"]>div>div')
                .text().trim()
        } catch (err) {
            throw Error("get book annotation: ", { cause: err })
        }
    }

    private getBookDate(bookPage: string): string {
        try {
            return cheerio.load(bookPage)('div[class^="CharacteristicsBlock_characteristics_"]>div:nth-child(3)>span')
                .text()
                .trim()
        } catch (err) {
            throw Error("get book date: ", { cause: err });
        }
    }
};
