import got from "got";
import * as cheerio from "cheerio";
import { delay } from "./common.mjs";
export class AuthorTodayParser {
    baseUrl;
    constructor() {
        this.baseUrl = "https://author.today";
    }
    async parse(startPage = 1, pageCount = 1) {
        return Promise.all(Array(pageCount)
            .fill(0)
            .map(async (_, ind) => {
            console.log(`authors.today: getting books page ${ind + startPage}`);
            return this.getBookPathList(ind + startPage).then(paths => paths
                .map(async (path, i) => {
                await delay(150 * i);
                return this.getBookInfo(path);
            }));
        }))
            .then((val) => Promise.all(val.flat()))
            .catch((err) => { throw Error("parse authors.today: ", { cause: err }); });
    }
    async getBookPathList(pageNumber = 1) {
        return got(this.baseUrl + `/work/genre/all/ebook?page=${pageNumber}`)
            .then((data) => cheerio.load(data.body)("#search-results>div>div>.book-title>a")
            .toArray()
            .map((elem) => {
            switch (elem.type) {
                case "tag":
                    return elem.attribs["href"];
                default:
                    return null;
            }
        })
            .filter((elem) => elem != null))
            .catch((err) => { throw Error("fetch book list", { cause: err }); });
    }
    async getBookInfo(path) {
        return got(this.baseUrl + path)
            .then((data) => ({
            name: this.getBookTitle(data.body),
            authors: this.getBookAuthors(data.body),
            genres: this.getBookGenres(data.body),
            cycle: this.getBookCycle(data.body),
            annotation: this.getBookAnnotation(data.body),
            date: this.getBookDate(data.body)
        }))
            .catch((err) => { throw Error(`get book info ${this.baseUrl + path}: `, { cause: err }); });
    }
    getBookTitle(bookPage) {
        try {
            return cheerio.load(bookPage)(".book-meta-panel>.book-title")
                .contents().first().text().trim();
        }
        catch (err) {
            throw Error("get book title: ", { cause: err });
        }
    }
    getBookAuthors(bookPage) {
        try {
            return cheerio.load(bookPage)(".book-meta-panel>.book-authors")
                .children("span").children("a")
                .contents().toArray()
                .map((el) => el.data)
                .filter((v) => v != undefined);
        }
        catch (err) {
            throw Error("get book authors: ", { cause: err });
        }
    }
    getBookGenres(bookPage) {
        try {
            return cheerio.load(bookPage)(".book-meta-panel>div>.book-genres")
                .children("a")
                .contents().toArray()
                .map((elem) => elem.data)
                .filter((v) => v != undefined);
        }
        catch (err) {
            throw Error("get book genres: ", { cause: err });
        }
    }
    getBookCycle(bookPage) {
        try {
            const selector = cheerio.load(bookPage)(".book-meta-panel>div>div:nth-child(3)>a")
                .contents().toArray();
            return selector.length > 0 ? selector[0].data : undefined;
        }
        catch (err) {
            throw Error("get book cycle: ", { cause: err });
        }
    }
    getBookAnnotation(bookPage) {
        try {
            return cheerio.load(bookPage)(".annotation>div")
                .contents().text().trim();
        }
        catch (err) {
            throw Error("get book annotation: ", { cause: err });
        }
    }
    getBookDate(bookPage) {
        try {
            const elem = cheerio.load(bookPage)(".book-meta-panel>div>div>span.hint-top")
                .toArray()
                .filter((elem) => elem.type == "tag" && elem.attribs["data-time"] != "")[0];
            return elem.type == "tag" ? elem.attribs["data-time"] : "";
        }
        catch (err) {
            throw Error("get book date: ", { cause: err });
        }
    }
}
;
