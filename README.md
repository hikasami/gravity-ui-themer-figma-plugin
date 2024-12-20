## Gravity UI Themer Figma plugin ![beta version](https://img.shields.io/badge/beta-8A2BE2)
A Figma plugin to generate Local Variables and Local Styles from Themer.


### Quickstart
Run `yarn` to install dependencies.
Run `yarn build:watch` to start webpack in watch mode.
Open `Figma` -> `Plugins` -> `Development` -> `Import plugin from manifest...` and choose `manifest.json` file from this repo.

- To change the UI of your plugin (the react code), start editing `App.tsx`.
- To interact with the Figma API edit `controller.ts`.
- Read more on the [Figma API Overview](https://www.figma.com/developers/api).

### Toolings
This repo is using:

- React + Webpack
- TypeScript
- Prettier precommit hook
