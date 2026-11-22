import express from 'express';
import path from 'path';
import { createServer } from './api/server';
import { Agent } from './agent/Agent';
import { Planner } from './planner/Planner';
import { ToolRegistry } from './tools/ToolRegistry';
import { MemoryStore } from './memory/MemoryStore';
import { initializeDatabase } from './db/sqlite';
import fs, { Dirent } from "fs";

const app = express();
const port = Number(process.env.PORT || 3001);
const rootDir = process.cwd();

const memory = new MemoryStore();
const tools = new ToolRegistry();
const planner = new Planner();
const agent = new Agent({ memory, planner, tools });
// const fs = require("fs");

initializeDatabase();
createServer(app, agent);
app.use('/data', express.static(path.join(rootDir, 'data')));
app.use('/js', express.static(path.join(rootDir, 'src', 'js')));
app.get('/', (_req, res) => {
  res.sendFile(path.join(rootDir, 'src', 'base.html'));
});

app.get(['/GuessGame', '/guessgame'], (_req, res) => {
  res.sendFile(path.join(rootDir, 'src', 'GuessGame.html'));
});

app.get(['/Noitu', '/noitu'], (_req, res) => {
  res.sendFile(path.join(rootDir, 'src', 'Noitu.html'));
});

app.get(['/shiritori', '/Shiritori'], (_req, res) => {
  res.sendFile(path.join(rootDir, 'src', 'shiritori.html'));
});

app.get(['/study-japanese', '/study-Japanese'], (_req, res) => {
  res.sendFile(path.join(rootDir, 'src', 'study-japanese.html'));
});

app.get(['/study-english', '/study-English'], (_req, res) => {
  res.sendFile(path.join(rootDir, 'src', 'study-english.html'));
});

app.get(['/flash-card', '/flashcard'], (_req, res) => {
  res.sendFile(path.join(rootDir, 'src', 'flash-card.html'));
});

app.get(['/readpdf', '/readPDF'], (_req, res) => {
  res.sendFile(path.join(rootDir, 'src', 'readPDF.html'));
});

app.use('/pdfs', express.static(path.join(rootDir, 'data', 'pdfs')));
app.use(
    express.static(path.join(rootDir, "data"))
);


interface PdfNode {
    type: "folder" | "file";
    name: string;
    path?: string;
    relativePath?: string;
    children?: PdfNode[];
}


function buildPdfTree(
    dir: string,
    rootDir: string = dir
): PdfNode[] {

    const items = fs.readdirSync(dir, {
        withFileTypes: true
    });

    return items.flatMap((item): PdfNode[] => {

        const fullPath =
            path.join(
                dir,
                item.name
            );

        if (item.isDirectory()) {

            return [{
                type: "folder",
                name: item.name,
                children: buildPdfTree(
                    fullPath,
                    rootDir
                )
            }];
        }

        if (
            item.isFile() &&
            item.name
                .toLowerCase()
                .endsWith(".pdf")
        ) {

            return [{
                type: "file",
                name: item.name,
                relativePath: path
                    .relative(
                        rootDir,
                        fullPath
                    )
                    .replace(
                        /\\/g,
                        "/"
                    )
            }];
        }

        return [];
    });
}

function buildPdfTree2(
    dir: string
): PdfNode[]{
    const items = fs.readdirSync(dir, {
        withFileTypes: true
    });

    return items
        .map((item: Dirent): PdfNode | null => {

            const fullPath =
                path.join(
                    dir,
                    item.name
                );

            if (
                item.isDirectory()
            ) {

                return {

                    type: "folder",

                    name: item.name,

                    children:
                        buildPdfTree(
                            fullPath
                        )
                };
            }

            if (
                item.isFile() &&
                item.name
                    .toLowerCase()
                    .endsWith(".pdf")
            ) {

                return {

                    type: "file",

                    name: item.name,

                    path: fullPath
                };
            }

            return null;
        })
        .filter(
            (
                item
            ): item is PdfNode =>
                item !== null
        );
}

function getAllPdfFiles(
    dir: string,
    rootDir: string = dir
): string[] {

    const results: string[] = [];

    const items = fs.readdirSync(dir, {
        withFileTypes: true
    });

    for (const item of items) {

        const fullPath = path.join(
            dir,
            item.name
        );

        if (item.isDirectory()) {

            results.push(
                ...getAllPdfFiles(
                    fullPath,
                    rootDir
                )
            );

        } else if (
            item.isFile() &&
            item.name
                .toLowerCase()
                .endsWith(".pdf")
        ) {

            results.push(
                path
                    .relative(
                        rootDir,
                        fullPath
                    )
                    .replace(/\\/g, "/")
            );
        }
    }

    return results;
}

app.get("/api/pdftree", (req, res) => {
     const rootDir = path.join(
        "data",
        "pdfs"
    );

    res.json(
        buildPdfTree(rootDir)
    );
});

app.get("/api/pdfs", (req, res) => {

    try {

    const pdfDir = path.join(
        "data",
        "pdfs"
    );

        const pdfs = getAllPdfFiles(pdfDir);

        res.json(pdfs);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error:
                err instanceof Error
                    ? err.message
                    : String(err)
        });
    }
});



app.listen(port, () => {
  console.log(`AI agent server listening on http://localhost:${port}`);
});
