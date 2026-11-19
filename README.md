# Undertow

Physical photographs with fluid movement. Drag to sift through an overlapping pile, click a print to inspect it, and adjust the feeling and size of the collection.

Undertow is a browser gallery with no framework, build step, account system, storage provider, or required backend. It works independently of any administrative application. MIT licensed.

## Try it

[Explore the live Natural Place gallery](https://gallery.naturalplaceblog.com) to try Undertow with a published photo collection.

Open `index.html` for a sample collection and independent switches for the sliders and Add photos control. Open `undertow-standalone.html` for one self-contained file you can use with local photos. Local selections stay in the browser session; they are never uploaded or saved by Undertow.

`examples/published-gallery.html` demonstrates a supplied collection with the sliders and Add photos hidden. All demo art is generic and included locally. This package contains no blog content, private transcripts, account details, or credentials.

You can open the examples directly from disk. For normal hosting, serve this folder as static files; GitHub Pages or any ordinary web server is sufficient. Only the gallery code and the published collection belong in a public repository.

## Embed

```html
<div id="gallery" style="height: 80vh; min-height: 420px"></div>
<script src="src/undertow.js"></script>
<script>
  const gallery = new Undertow(document.getElementById('gallery'), {
    showControls: false,
    showAddPhotos: false,
    photos: [
      {
        src: '/images/lake-large.jpg',
        previewSrc: '/images/lake-preview.jpg',
        name: 'At the lake',
        alt: 'Trees reflected in still water'
      }
    ]
  });
</script>
```

Give the host container an explicit height. Styles are isolated inside its shadow root, so gallery styling does not affect the host page. Multiple independent galleries can coexist on a page.

The host may provide relative paths, remote image URLs, or a mixture of sources. A string URL can also be used in place of an object. `src` is the larger image opened in the viewer; optional `previewSrc` is the smaller image loaded for the animated pile. Using previews prevents every visitor from downloading all the originals before browsing. Ordinary cross-origin image display is supported; Undertow does not export or read pixels from these canvases.

## Options

| Option | Default | Purpose |
| --- | --- | --- |
| `showControls` | `true` | Show the size, viscosity, stir strength, and depth sliders. |
| `showHint` | `true` | Show a quiet exploration hint when sliders are hidden; fade it after the first drag. |
| `showAddPhotos` | `true` | Show the local photo picker. This picker never uploads files. |
| `showRescatter` | `true` | Show the Rescatter button. |
| `showHeader` | `true` | Show the title and header actions; hiding it also hides all header actions. |
| `showCount` | `true` | Show the photo count. |
| `size` | `100` | Print size, 35–200%, relative to the automatic collection fit. |
| `viscosity` | `40` | Resistance, 0–100. |
| `strength` | `62` | Stirring strength, 0–100. |
| `depth` | `85` | Variation in layer response, 0–100. Prints remain free to overlap. |
| `maxPhotos` | `400` | Maximum loaded collection size. |
| `title` | `"Undertow"` | Header title, rendered as plain text. |
| `subtitle` | `"An unarranged collection"` | Header subtitle, rendered as plain text. |
| `photos` | `[]` | Initial photo array. Change it later with `setPhotos` or `addPhotos`. |

With sliders hidden, a small hint says “Drag to explore · Click a photo to look closer” (touch wording on phones). It stays until the first deliberate drag, then fades for the lifetime of that gallery instance. Hovering or clicking does not dismiss it. It never intercepts pointer input. Set `showHint: false` to omit it. The CSS custom property `--undertow-hint-bottom` on the host container can reserve space for a host page footer.

Hiding the sliders does not reset their values or disable their effects. The visibility flags are independent and can change without reloading images or resetting the pile.

```js
gallery.setOptions({ showControls: false, showAddPhotos: false, size: 125 });
gallery.setOptions({ showControls: true }); // Restore sliders; retain current values.
```

## API

- `gallery.ready`: promise for the initial photo load.
- `gallery.setOptions(options)`: update settings and visibility in place.
- `gallery.getOptions()`: read a copy of current settings, including slider changes.
- `await gallery.addPhotos(array)`: append supplied URLs or photo objects.
- `await gallery.setPhotos(array)`: replace the collection; a newer replacement cancels older pending additions.
- `await gallery.addFiles(fileList)`: append browser File objects without uploading them.
- `gallery.getPhotos()`: read source URLs, preview URLs, names, and alt text.
- `gallery.rescatter()`: scatter the current prints.
- `gallery.clear()`: remove prints and release owned local object URLs.
- `gallery.destroy()`: stop animation, detach observers/listeners, and clear the host.

Photo-loading methods resolve to `{ added, failed, skipped }`. `failed` contains input indices and messages. Broken images are skipped while the rest load. Relative paths resolve against the embedding page URL. URLs created from local files are temporary and do not form a persistent collection.

The container emits `undertow:change` with `{ count }` and `undertow:select` with `{ photo }` in `event.detail`. The built-in viewer still opens when a photograph is selected.

```js
document.getElementById('gallery').addEventListener('undertow:select', event => {
  console.log(event.detail.photo.name);
});
```

## Connect an administrative application later

An external application can manage login, uploads, storage, captions, draft/published state, and duplicate checking. It supplies Undertow with settings and an array containing only the photos intended for that audience. For example, that application can fetch its own published JSON list and call `gallery.setPhotos(list.photos)`.

The core does not know whether images come from WordPress, an S3-compatible bucket, local files, or another host. It does not list buckets, synchronize a media library, manage DNS, store credentials, or publish changes. Hiding controls is presentation configuration, not an authorization boundary. Private content must stay out of public source files and public photo lists; the hosting application controls access to protected photos.

A deployment might therefore consist of a static Undertow frontend, a separate protected administrative service, and external image storage. The same frontend can be reused elsewhere without that service.

## Files

- `src/undertow.js`: reusable gallery engine and isolated interface.
- `index.html`: interactive configuration demo.
- `undertow-standalone.html`: generated single-file local gallery.
- `examples/published-gallery.html`: supplied collection with viewer-only controls.
- `assets/`: generic sample illustrations.
- `LICENSE`: MIT license.

The standalone file is bundled from `src/undertow.js`; make code changes in the source, then run `node scripts/build-standalone.cjs` (or `npm run build`) to regenerate it. Node.js is only needed for this optional build and the tests, not for running the gallery. Run `npm test` to check configuration independence, loading, lifecycle cleanup, interaction behavior, and dense stacks; no dependency installation is needed. Browser photo memory and drawing work still grow with collection size. The default cap is 400 photos; performance depends on device, image dimensions, and selected print size.
