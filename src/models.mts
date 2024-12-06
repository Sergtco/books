import { Association, CreationOptional, HasManyAddAssociationMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";

export type BookInfo = {
    url: string;
    name: string;
    authors: string[];
    genres: string[];
    cycle?: string;
    annotation?: string;
    date?: string;
};

export class Book extends Model<InferAttributes<Book, { omit: 'authors' | 'genres' }>, InferCreationAttributes<Book, { omit: 'authors' | 'genres' }>> {
    declare id: CreationOptional<number>;
    declare url: string;
    declare name: string;
    declare cycle: string | null;
    declare annotation: string | null;
    declare date: string;

    declare authors: NonAttribute<Author[]>;
    declare genres: NonAttribute<Genre[]>;

    declare addGenre: HasManyAddAssociationMixin<Genre, number>;
    declare addAuthor: HasManyAddAssociationMixin<Author, number>;

    declare static associations: {
        genres: Association<Book, Genre>;
        authors: Association<Book, Author>;
    };
}

export class Genre extends Model {
    declare id: CreationOptional<number>;
    declare name: string;
}

export class Author extends Model {
    declare id: CreationOptional<number>;
    declare name: string;
}
