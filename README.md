# Evidence

Evidence is a lightweight, private progress timeline for recording small wins and milestones. It is built as a static web app, so it can be published directly on GitHub Pages or uploaded as a standalone web app.

## Features

- Log victories with a category and timestamp.
- Search and filter the timeline locally in the browser.
- Delete entries you no longer want to keep.
- Export your timeline as JSON for backup.
- Stores data in `miniappsAI.storage` when available and falls back to browser `localStorage` for standalone hosting.

## Publishing on GitHub Pages

1. Push the repository to GitHub.
2. Open the repository settings.
3. Go to **Pages**.
4. Select the branch you want to publish and choose the repository root as the source.
5. Save and wait for GitHub Pages to deploy the static files.

## Local Preview

Because this is a static app, you can open `index.html` directly in a browser or serve the directory with any static file server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
