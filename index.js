import express from "express"
import axios from "axios"

const app = express();
const port = 3000;

app.use(express.static("public"))

function animeObject(AnimeId, title, imageUrl, synopsis, yearReleased, genres) {
    this.id = AnimeId
    this.title = title;
    this.imageUrl = imageUrl;
    this.synopsis = synopsis;
    this.yearReleased = yearReleased;
    this.genres = genres;
}

let AnimeList = []
let start = 0;
let end = 5;
let page = 1;

app.get('/', async (req, res) => {
    res.render("index.ejs", {content: "Click the button below to get recommedations👇", hasData: false})
})

app.get('/recommendations', async (req, res) => {
    if(AnimeList.length === 0 || end > AnimeList.length){
        try {
            if(end > AnimeList.length){
                page += 1;
                AnimeList = []
                start = 0
                end = 5
            }
            const response = await axios.get("https://api.jikan.moe/v4/top/anime", {
                params:{
                    page: page
                }
            })
            const result = response.data
            result.data.map((item) => {
                const AnimeId = item.mal_id;
                const imageUrl = item.images.jpg.image_url;
                const title = item.title_english
                const synopsis = item.synopsis
                const yearReleased = item.year
                const genres = item.genres.map((genre) => {
                    return genre.name
                })
                if(title){
                    const animeData = new animeObject(AnimeId,title, imageUrl, synopsis, yearReleased, genres)
                    AnimeList.push(animeData);
                }
            })
            res.render("index.ejs", {data: AnimeList.slice(start,end), hasData: true})
        } catch (error) {
            console.log(error)
        }
    }
    else{
        start += 5
        end += 5
        res.render("index.ejs", {data: AnimeList.slice(start,end), hasData: true})
    }
})

app.get("/anime/:id", async (req, res) => {
    const id = req.params.id
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}/full`)
        const data = response.data.data;
        const imageUrl = data.images.jpg.image_url;
        const title = data.title_english
        const description = data.synopsis
        const yearReleased = data.year
        const genres = data.genres.map((genre) => {
            return genre.name
        })
        res.render("description.ejs", {title, imageUrl, description, yearReleased, genres})
    } catch (error) {
        console.log(error)
    }
})
  
app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})