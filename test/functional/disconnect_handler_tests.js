'use strict';
var test = require('./shared').assert;

describe('Disconnect Handler', function() {
  /**
   * @ignore
   */
  it('Should correctly recover when bufferMaxEntries: -1 and restart', {
    metadata: { requires: { topology: ['single', 'replicaset'] }, ignore: { travis: true } },

    test: function(done) {
      var configuration = this.configuration;
      var MongoClient = configuration.require.MongoClient;

      MongoClient.connect(configuration.url(), {}, function(err, client) {
        test.equal(null, err);
        var db = client.db(configuration.db);

        configuration.manager.stop(9).then(function() {
          db
            .collection('disconnect_handler_tests')
            .update({ a: 1 }, { $set: { b: 1 } }, function(err, r) {
              test.equal(null, err);
              test.equal(0, r.result.n);

              client.close();
            });

          setTimeout(function() {
            configuration.manager.restart(9, { waitMS: 5000 }).then(function() {
              done();
            });
          }, 5000);
        });
      });
    }
  });
});
