import { AuthorTodayParser } from "./author_today.mjs";
import { bulkParse, Parser, saveToTsv } from "./common.mjs";
import { LitnetComParser } from "./litnet_com.mjs";
import { LitresRuParser } from "./litres_ru.mjs";
import { RusnebRuParser } from "./rusneb_ru.mjs";

async function main() {
    const parsers: Parser[] = [new AuthorTodayParser(), new LitnetComParser(), new LitresRuParser(), new RusnebRuParser()];
    console.log("Parsing...");
    const books = await bulkParse(parsers, 1, 5);
    saveToTsv("data.tsv", books).then(() => console.info("Written to data.tsv!"));
}

await main()
