import got from "got";
import * as cheerio from "cheerio";
export class AuthorTodayParser {
    baseUrl;
    constructor() {
        this.baseUrl = "https://author.today";
    }
    async getBookUrlList(pageNumber = 1) {
        return got(this.baseUrl + `/work/genre/all/ebook?page=${pageNumber}`)
            .then((data) => cheerio.load(data.body)("#search-results>div>div>.book-title>a")
            .toArray()
            .map((elem, _) => {
            switch (elem.type) {
                case "tag":
                    return elem.attribs["href"];
                default:
                    return null;
            }
        })
            .filter((elem, _) => elem != null))
            .catch((err) => { throw Error("error fetching book list author.today", err); });
    }
    async getBookInfo(path) {
        return got(this.baseUrl + path)
            .then((data) => cheerio.load(data.body)(""));
    }
    getBookTitle;
}
;
