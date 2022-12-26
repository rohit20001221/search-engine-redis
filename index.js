const express = require("express");
const redis = require("redis");
const { promisifyAll } = require("bluebird");

const app = express();
const port = 3001;

promisifyAll(redis);

const client = redis.createClient();
client.connect();

app.use(express.static("public"));

app.get("/search", async (req, res) => {
    const { q } = req.query;

    if (q.trim() === "") {
        return res.json([]);
    }

    const search = [];
    q.split(" ").forEach((term) => {
        if (term.trim() !== "") {
            search.push(`(%%${term.trim()}%%)`);
        }
    });
    const s = search.join(" ");

    try {
        const result = await client.ft.search("idx:medicine", s);
        return res.json(result.documents);
    } catch {
        return res.json([]);
    }
});

app.listen(port, () => {
    console.log("running on http://localhost:3001");
});
