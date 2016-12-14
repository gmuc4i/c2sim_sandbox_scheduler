TODO
====

+ Make logic independent of block size

+ Database functionality (via [mongoose](http://mongoosejs.com/), for example)

+ Improve user interface


Testing
=======

Mocha is used to run unit tests, the executable can be found in
`node_modules/mocha/bin/mocha`

To run the unit tests from the source directory, run the following from the
command line:

```bash

$ ./node_modules/mocha/bin/mocha unit-tests.js

```

Additionally, if you want the testing program to auto-update as you save the
`unit-tests.js` file, add the `--watch` option, like this:

```bash

$ ./node_modules/mocha/bin/mocha unit-tests.js --watch

```
