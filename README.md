Bitbucket backup
===

This is a Node.js application, which helps you cloning all your repos from Bitbucket to your local machine. It may be helpful when owning many repositories.

Install
--

This app requires a single dependency - Node.js. You can install it by simply running

```
npm install @naterkane/getallrepos
```

Usage
--
```
node app --user=bbUser --pass=bbPass --owner=teamOrUserName --folder=./backup-folder
```

Note that all options are mandatory, except `--folder`. It defaults to `./bb-backup`.
