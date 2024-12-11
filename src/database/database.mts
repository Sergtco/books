import { MikroORM, SqliteDriver } from "@mikro-orm/sqlite";
import { Author, Book, BookInfo, Genre } from "../models.mjs";

async function newDB(path: string): Promise<Database> {
    const db = new Database(await MikroORM.init<SqliteDriver>({
        dbName: path,
        name: path,
        entities: [Book, Author, Genre],
    }))
    await db.UpdateSchema();
    return db;
}
class Database {
    private orm: MikroORM;
    constructor(orm: MikroORM) {
        this.orm = orm
    }

    public async UpdateSchema() {
        await this.orm.schema.updateSchema()
    }

    public async AddBook(book: BookInfo): Promise<Book> {
        const em = this.orm.em.fork()

        const newAuthors: Author[] = book.authors.map(author_name => new Author(author_name));
        const newGenres: Genre[] = book.genres.map(genre_name => new Genre(genre_name));
        const newBook: Book = new Book(book.url, book.name, newAuthors, newGenres, book.date, book.cycle, book.annotation);
        await em.persistAndFlush(newBook);
        return newBook;
    }

    public async getBookById(id: number): Promise<Book> {
        const em = this.orm.em.fork()
        const book = await em.findOne(Book, id, { populate: ['genres', 'authors'] });
        return book;
    }

    public async bookCountByGenre(): Promise<Map<string, number>> {
        const res: Map<string, number> = new Map();
        const em = this.orm.em.fork();
        const allGenres = await em.findAll(Genre, { populate: ['books'] });
        for (const genre of allGenres) {
            res.set(genre.name, res.get(genre.name) + genre.books.length || genre.books.length);
        }
        return new Map([...res.entries()].sort((a, b) => b[1] - a[1]))
    }

    public async bookCountByAuthor(): Promise<Map<string, number>> {
        const res: Map<string, number> = new Map();
        const em = this.orm.em.fork();
        const allAuthors = await em.findAll(Author, { populate: ['books'] });
        for (const author of allAuthors) {
            res.set(author.name, res.get(author.name) + author.books.length || author.books.length);
        }
        return new Map([...res.entries()].sort((a, b) => b[1] - a[1]))
    }

}

export const DB = await newDB("./books.sqlite");
