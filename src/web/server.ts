import express, { Request, Response } from "express";
import { DB } from "../database/database.mjs";
import { Book } from "../models.mjs";
import { indexPage } from "../templates/index.js";

export function serve() {
    let app = express();
    app.use("/static", express.static('public'))
    app.get("/", index)
    app.listen(8080, () => console.log("listening on http://localhost:8080"))
}

async function index(req: Request, resp: Response) {
    let books: Book[] = [];
    for (let i = 1; i < 100; i++) {
        const book = await DB.getBookById(i);
        if (book) {
            books.push(book);
        }
    }
    resp.setHeader("Content-Type", "text/html")
    resp.send(await indexPage({ books: books }))
}
