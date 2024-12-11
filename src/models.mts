import { Entity, ManyToMany, PrimaryKey, Property, Rel } from "@mikro-orm/core";

export type BookInfo = {
    url: string;
    name: string;
    authors: string[];
    genres: string[];
    cycle?: string;
    annotation?: string;
    date?: string;
};

@Entity()
export class Book {
    @PrimaryKey()
    id!: number;
    @Property()
    url: string;
    @Property()
    name: string;
    @Property()
    cycle?: string;
    @Property()
    annotation?: string;
    @Property()
    date?: string;
    @ManyToMany(() => Author)
    authors: Rel<Author[]>;
    @ManyToMany(() => Genre)
    genres: Rel<Genre[]>;
    constructor(url: string, name: string, authors: Author[], genres: Genre[], date?: string, cycle?: string, annotation?: string,) {
        this.url = url;
        this.name = name;
        this.date = date;
        this.authors = authors;
        this.genres = genres;
        this.cycle = cycle;
        this.annotation = annotation;
    }
}

@Entity()
export class Genre {
    @PrimaryKey()
    id!: number
    @Property()
    name: string;
    @ManyToMany(() => Book, book => book.genres)
    books: Rel<Book[]>
    constructor(name: string) {
        this.name = name;
    }
}

@Entity()
export class Author {
    @PrimaryKey()
    id!: number
    @Property()
    name: string;
    @ManyToMany(() => Book, book => book.authors)
    books: Rel<Book[]>
    constructor(name: string) {
        this.name = name;
    }
}
