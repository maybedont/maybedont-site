# Maybe Don't, AI

This repo contains the blog, brochure site and documentation for https://maybedont.ai. 

## Users

If you find any issues in the docs, or any other issue for that matter, please feel free to open an issue in this repo. 

## Developers

This site is built using Hugo. If you want to build this locally, you will need to install Hugo.

### macOS Setup

```
brew install hugo
```

### Start the site locally

Note that `--gc --cleanDestinationDir` is not required but will ensure that old files are cleaned up.
```
hugo --gc --cleanDestinationDir server 
```