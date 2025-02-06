# Palindrome's deployment of Jolly Roger

You will need a version of Node and npm compatible with Meteor v2 (for now) on both your server and development environment. You may find it convenient to use [nvm](https://github.com/nvm-sh/nvm) to manage this. On our production server, we use:

- Node 14.21.3
- npm 6.14.18

1. Build the tarball
   `meteor build --architecture <your_server_arch> /path/to/build/dir` (e.g. `meteor build --architecture os.linux.x86_64`, but check the help if you need to)

2. Copy the tarball from your build dir to your server
3. (Server) Set any environment variables (see DEVELOPMENT.md)
4. (Server) Extract the tarball somewhere that the user who will be running the application can access it
5. (Server) Run `npm install` in `bundle/programs/server`
6. (Server) Run `node main.js` in `bundle` (recommended: daemonise this and restart the service)
7. (Server, once-only) Set your favourite reverse proxy (e.g. nginx) to point at the app (port 3000 by default)

You'll need to point a (sub)domain at your server, and then you have a running version of Jolly Roger.
