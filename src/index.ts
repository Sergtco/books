import { AuthorTodayParser } from "./parsers/author_today.mjs";
import { bulkParse, Parser } from "./common.mjs";
import { LitnetComParser } from "./parsers/litnet_com.mjs";
import { LitresRuParser } from "./parsers/litres_ru.mjs";
import { RusnebRuParser } from "./parsers/rusneb_ru.mjs";
import { CronJob } from "cron";
import { serve } from "./web/server.js";
import { DB } from "./database/database.mjs";


async function main() {
    const parsingCron = await startCronParse();
    serve();
}

async function startCronParse(): Promise<CronJob> {
    let startPage = 1;
    const cron = CronJob.from({
        // cronTime: "0 */5 * * * *", // every 10 minutes
        cronTime: "* * * * * *", // every 0 minutes
        onTick: async () => {
            try {
                console.log("Starting to parse data:");
                await runParse(startPage);
                startPage += 6
            } catch (exc) {
                console.log(exc);
            }
        },
        runOnInit: true,
        utcOffset: 60 * 3,
        waitForCompletion: true,

    });
    return cron
}

async function runParse(startPage: number) {
    const parsers: Parser[] = [new AuthorTodayParser(), new LitnetComParser(), new LitresRuParser()/* , new RusnebRuParser() */];
    console.log("Parsing...");
    const books = await bulkParse(parsers, startPage, 5);
    await Promise.all(books.map(async book => DB.AddBook(book).catch(() => undefined)));
    console.log(`Parsed ${books.length} books!`);
}

await main()
