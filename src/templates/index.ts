import { DB } from "../database/database.mjs"
import { Book } from "../models.mjs"

type PageType = "genre" | "author";

type IndexData = {
    type: PageType
}

export async function indexPage(data: IndexData): Promise<string> {
    let chartData: ChartInfo;
    switch (data.type) {
        case "genre":
            const bookCountByGenre = await DB.bookCountByGenre()
            chartData = {
                name: "GenreCount",
                type: "bar",
                labels: [...bookCountByGenre.keys()],
                dataset: {
                    label: "Books per genre",
                    data: [...bookCountByGenre.values()],
                }
            }
            break;
        case "author":
            const bookCountByAuthor = await DB.bookCountByAuthor()
            chartData = {
                name: "AuthorCount",
                type: "bar",
                labels: [...bookCountByAuthor.keys()],
                dataset: {
                    label: "Books per author",
                    data: [...bookCountByAuthor.values()],
                }
            }
        default:
            break;
    }
    return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Book store stats</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body>
        <div class="flex flex-col min-h-screen">
            <div class="flex felx-row">
                <a class="flex-grow bg-green-400 border-black border-2" href="/authors">
                    Authors
                </a>
                <a class="button flex-grow bg-green-400 border-black border-2" href="/genres">
                    Genres
                </a>
            </div>
            <div class="flex flex-grow">
                ${createChart(chartData)}
            </div>
        </div>
    </body>
</html>
        `
}

function bookEntry(book: Book): string {
    return `
<div class="flex flex-row flex-nowrap"> 
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


type ChartInfo = {
    name: string;
    type: string;
    labels: string[];
    dataset: {
        label: string;
        data: number[];
    }
}

function createChart(info: ChartInfo): string {
    return `
<div class="flex-grow">
    <canvas id="${info.name}">
    </canvas>
</div>
<script>
const ctx${info.name} = document.getElementById('${info.name}');

new Chart(ctx${info.name}, {
    type:  '${info.type}',
    data: {
        labels: [${info.labels.map(label => "'" + label + "'").join(", ")}],
        datasets: [{
            label: '${info.dataset.label}',
            data: [${info.dataset.data}],
        }]
    },
});
</script>
`
}

