import { DataTypes, Sequelize } from "sequelize";
import { Author, Book, BookInfo, Genre } from "../models.mjs";

export class Database {
    private orm: Sequelize;
    constructor(path: string) {
        this.orm = new Sequelize(`sqlite:${path}`, { logging: false });
        Book.init({
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },
            url: {
                type: new DataTypes.STRING(256),
                allowNull: false,
                unique: true,
            },
            name: {
                type: new DataTypes.STRING(),
                allowNull: false,
            },
            date: DataTypes.DATE,
            cycle: new DataTypes.STRING(),
            annotation: new DataTypes.STRING(),
        }, { tableName: "book", sequelize: this.orm });

        Genre.init({
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: new DataTypes.STRING(),
                allowNull: false,
                unique: true,
            }
        }, { tableName: "genre", sequelize: this.orm });

        Author.init({
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: new DataTypes.STRING(),
                allowNull: false,
                unique: true,
            }
        }, { tableName: "author", sequelize: this.orm });

        Book.belongsToMany(Genre, { through: "Book_Genre", as: "genres" });
        Book.belongsToMany(Author, { through: "Book_Author", as: "authors" });

    }


    public async AddBook(book: BookInfo): Promise<Book> {
        await this.orm.sync();
        const transaction = await this.orm.transaction();
        try {
            const [newBook, present] = await Book.findOrCreate({ where: { url: book.url }, defaults: { url: book.url, name: book.name, date: book.date, cycle: book.cycle, annotation: book.annotation }, transaction: transaction });
            if (present) {
                transaction.commit()
                return newBook;
            }

            for (const genre of book.genres) {
                const [newGenre, _] = await Genre.findOrCreate({ where: { name: genre }, defaults: { name: genre }, transaction: transaction });
                await newBook.addGenre(newGenre, { transaction: transaction })
            }

            for (const author of book.authors) {
                const [newauthor, _] = await Author.findOrCreate({ where: { name: author }, defaults: { name: author }, transaction: transaction });
                await newBook.addAuthor(newauthor, { transaction: transaction })
            }

            const found = await Book.findOne({ where: { url: newBook.url }, include: [Book.associations.genres, Book.associations.authors], transaction: transaction });
            transaction.commit();
            return found;
        } catch (exc) {
            transaction.rollback();
            return undefined;
        }
    }
}

