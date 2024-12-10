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

}

export const DB = await newDB("./books.sqlite");
