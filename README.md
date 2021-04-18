# Too Many Cooks

## Usage

I forked geckos.io so I could add audio/video streaming to the server. Right now the
code is on an experimental branch called [with-streams](https://github.com/richard-to/geckos.io/tree/with-streams).

Here are the steps to use my fork in place of the normal geckos.io packages:

```
# Clone the repository
git clone git@github.com:richard-to/geckos.io.git
cd geckos.io

# Checkout the experimental branch
git checkout with-streams

# Install dependencies
npm install

# Build all the packages
npm run-script build

# Link the @geckos.io/common package
cd packages/common
yarn link

# Link the @geckos.io/client package
cd ../client
yarn link

# Link the @geckos.io/server package
cd ../server
yarn link
```

Now you can set up the Too Many Cooks repository:

```sh
# Clone the repository
git clone git@github.com:richard-to/too-many-cooks.git
cd too-many-cooks

# Install dependencies
yarn install

# Link geckos.io forked packages
yarn link @geckos.io/common
yarn link @geckos.io/client
yarn link @geckos.io/server
```

Run game server

```sh
# Build frontend client
yarn start

# Start game server
yarn server:start
```

You should be able to play game at localhost:1444.
