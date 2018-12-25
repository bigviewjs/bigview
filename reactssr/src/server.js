import express from "express";
import path from "path";

import React from "react";
import { renderToString } from "react-dom/server";

import Html from "./components/Html";

import { renderToNodeStream } from 'react-dom/server';
import httpextra from 'http-extra'

const app = express();

app.use((req, res, next) => {
    httpextra(res)
    return next()
})

app.use(express.static(path.resolve(__dirname, "../dist")));

app.get("/*", (req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });

    res.write(renderToNodeStream(<Html />));
    // res.write(renderToNodeStream(<Layout />));
    // res.write(renderToNodeStream(<Header />));
    res.end()
});

app.listen(2048);

