import { AuthorTodayParser } from "./author_today.mjs";
import { writeFile } from "node:fs";
import { delay } from "./common.mjs";
async function main() {
    const parser = new AuthorTodayParser();
    console.log("Parsing author.today.");
    let data = [];
    const step = 1;
    for (let i = 1; i < 100; i += step) {
        await delay(1000);
        const chunk = await parser.parse(i, step);
        data = data.concat(chunk);
        console.log(`Parsed ${chunk.length} books`);
    }
    writeFile("./output/author_today.json", JSON.stringify(data), err => {
        if (err)
            throw err;
        console.log(`Written to "author_today.json"`);
    });
}
await main();
