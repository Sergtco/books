import { Book } from "../models.mjs"

type IndexData = {
    books: Book[]
}

export function indexPage(data: IndexData): string {
    return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Book store stats</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
        <div class="flex flex-col min-h-screen">
            <div class="flex flex-row place-content-center">
                <div class="bg-green-400 size-10">
                    
                </div>
                <div class="bg-green-400 size-10">
                    
                </div>
            </div>
            <div class="flex flex-col">
${data.books.map(book => bookEntry(book)).join("\n")}
            </div>
        </div>
    </body>
</html>
        `
}

function bookEntry(book: Book): string {
    return `
<div class="flex flex-row"> 
    <p class="grow">${book.url} | </p>
    <p class="grow">${book.name} | </p>
    <p class="grow">${book.cycle} | </p>
    <p class="grow">${book.date} | </p>
    <p class="grow">${book.genres.map(genre => genre.name).join(", ")} | </p>
    <p class="grow">${book.authors.map(author => author.name).join(", ")}</p>
</div>
`
}

function bookField(name: string, entry: string): string {
    return `
<div>
    <span>
    ${name}
    </span>
    <span>
    ${entry}
    </span>
</div>
`
}
