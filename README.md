# Too Many Cooks

## Usage

```sh
# Clone the repository
git clone git@github.com:richard-to/too-many-cooks.git
cd too-many-cooks

# Create a .env file
cp .env.example .env


# Install dependencies
yarn install
```

Run game server

```sh
# Build frontend client (window 1)
yarn start

# Start game server (window 2)
yarn game_server:start

# Start video server (window 3)
yarn video_server:start
```

You should be able to play game at localhost:1444.
