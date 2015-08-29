

The app was created to streamline the Prep for Prep Alumni Council Election.

## Getting Started
Install Homebrew (http://brew.sh/)

Execute the following commands (for any brew installation, check Caveats section for further instructions)
```
brew install git
brew install node
brew install mongodb
npm install -g bower
npm install -g grunt-cli
```

At the pfpaa root directory, execute the following to install dependencies
```
npm install
```

If you installed mongo through Homebrew, execute the following command to run it in the background
```
mongod --config /usr/local/etc/mongod.conf
```

In a separate terminal, execute the following to run the server:
```
grunt
```
