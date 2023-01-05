# Git Pull

Process that watches a git repo and automatically pulls changes down.

## Installation

SSH into your server instance:

```
ssh -i "yourkey.pem" ubuntu@ec2-instance.amazonaws.com
```

Clone this repo

```
git clone https://github.com/Atomic-Reactor/Git-Pull.git
```

Start the service

```
cd Git-Pull
npm start

// Using PM2?
cd Git-Pull
pm2 start npm --watch --name "Git-Pull" -- start
pm2 save
```

You can update the codebase via `git pull`. If you're using PM2 it will automatically restart the service.

## Config

You can create a config.js file to customize the git watch and branch.

### branch

The remote branch to pull

> The remote must have a valid ssh key supplied for any clients executing a pull.

### watch

The local git repository path
