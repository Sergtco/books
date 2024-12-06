import { AuthorTodayParser } from "./parsers/author_today.mjs";
import { bulkParse, delay, Parser } from "./common.mjs";
import { LitnetComParser } from "./parsers/litnet_com.mjs";
import { LitresRuParser } from "./parsers/litres_ru.mjs";
import { RusnebRuParser } from "./parsers/rusneb_ru.mjs";
import { Database } from "./database/database.mjs";

async function main() {
    const parsers: Parser[] = [new AuthorTodayParser(), new LitnetComParser(), new LitresRuParser(), new RusnebRuParser()];
    console.log("Parsing...");
    for (let i = 6; i < 30; i += 5) {
        const books = await bulkParse(parsers, i, 4);
        const db = new Database("books.db");
        await Promise.all(books.map(async book => db.AddBook(book)));
        console.log(`Parsed ${books.length} books!`);
        
        await delay(2000);
    }
}

await main()
