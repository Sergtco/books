import { AuthorTodayParser } from "./author_today.mjs";

async function main() {
    const parser = new AuthorTodayParser();
    const list = await parser.getBookList()
    console.log(list);

}

await main()
