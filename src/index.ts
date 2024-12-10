import { AuthorTodayParser } from "./parsers/author_today.mjs";
import { bulkParse, Parser } from "./common.mjs";
import { LitnetComParser } from "./parsers/litnet_com.mjs";
import { LitresRuParser } from "./parsers/litres_ru.mjs";
import { RusnebRuParser } from "./parsers/rusneb_ru.mjs";
import { Database } from "./database/database.mjs";
import { CronJob } from "cron";


async function main() {
    let parsingCron = await startCronParse();
    console.log(parsingCron);
}

async function startCronParse(): Promise<CronJob> {
    let startPage = 1;
    const cron = new CronJob(
        "0 */10 * * * *", // every 10 minutes
        async () => {
            console.log("Starting to parse data:");
            await runParse(startPage);
            startPage += 6
        },
        null,
        true,
        "Europe/Moscow"
    );
    cron.start();
    return cron
}

async function runParse(startPage: number) {
    const parsers: Parser[] = [new AuthorTodayParser(), new LitnetComParser(), new LitresRuParser(), new RusnebRuParser()];
    console.log("Parsing...");
    const books = await bulkParse(parsers, startPage, 5);
    const db = new Database("books.db");
    await Promise.all(books.map(async book => db.AddBook(book)));
    console.log(`Parsed ${books.length} books!`);
}

await main()
