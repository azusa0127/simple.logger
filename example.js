// Require the desired logger in the project.
const { Logger } = require(`./index`);

const log = new Logger({ prefix: `HelloWorld` });
log.info(`I'm telling you Something,`);
log.info(`A story.`);
log.debug(`This Message will not be seen.`);
log.trace(Error(`This Will neither be traced.`));
log.log(`Nor this one -- as the default log level is 'info'!`);

log.enterBlock(`Story`);
log.info(`Long long ago.`);
log.enterBlock(`Warnings`, `warn`);
log.warn(`1.This story will be boring.`);
log.warn(`2.It's only single sentence.`);
log.exitBlock(`Warnings`, `warn`);
log.info(`The quick brown fox jumps over the lazy dog.`);
log.error(`That's it.`);
log.exitBlock(`Story`);

// Change log level to show every channel.
log.changeLogLevel(`trace`);
log.log(`Now You should see me`);
log.debug({
  glossary: {
    title: `example glossary`,
    GlossDiv: {
      title: `S`,
      GlossList: {
        GlossEntry: {
          ID: `SGML`,
          Sorted: true,
          GlossTerm: `Standard Generalized Markup Language`,
          Index: 8879,
          Abbrev: `ISO 8879:1986`,
          GlossDef: {
            para: `A meta-markup language, used to create markup languages such as DocBook.`,
            GlossSeeAlso: [`GML`, `XML`],
          },
        },
      },
    },
  },
});

log.error(new Error(`A Minor Error?`));
log.trace(new Error(`A Big Error!`));
