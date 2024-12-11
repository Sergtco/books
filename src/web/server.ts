import express, { Request, Response } from "express";
import { indexPage } from "../templates/index.js";

export function serve() {
    let app = express();
    app.use("/static", express.static('public'))
    app.get("/", index)
    app.get("/genres", genres)
    app.get("/authors", authors)
    app.listen(8080, () => console.log("listening on http://localhost:8080"))
}

async function index(req: Request, resp: Response) {
    resp.redirect("/genres");
}

async function genres(req: Request, resp: Response) {
    resp.setHeader("Content-Type", "text/html");
    resp.send(await indexPage({ type: "genre" }))
}

async function authors(req: Request, resp: Response) {
    resp.setHeader("Content-Type", "text/html");
    resp.send(await indexPage({ type: "author" }))
}
