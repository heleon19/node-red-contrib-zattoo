const Zattoo = require("zattoo-unofficial-api");

module.exports = function(RED) {

  function ZattooConfigNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.zattoo = new Zattoo({
      "user": node.credentials.username,
      "password": node.credentials.password,
      "lang": config.lang,
      "domain": config.domain
    });;

    node.on("close", (removed, done) => {
      node.zattoo.close();
      done();
    });
  }
  RED.nodes.registerType("zattoo-config", ZattooConfigNode, {
    "credentials": {
      "username": { "type": "text" },
      "password": { "type": "password" }
    }
  });

  function ZattooNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.config = config;

    node.zconfig = RED.nodes.getNode(config.zconfig);

    if (node.zconfig) {
      const zattoo = node.zconfig.zattoo;

      node.on("input", async (msg) => {
        try {
          const request = msg.request || node.config.request;
          const channel = msg.channel || node.config.channel;

          if (request === "session") {
            msg.payload = await zattoo.getSessionInfo();

          } else if (request === "channels") {
            msg.payload = await zattoo.getChannelList();

          } else if (request === "stream-urls") {
            msg.payload = await zattoo.getStreamUrls(channel);

          } else {
            throw new Error(`request '${request}' not supported!`);
          }
          node.send(msg);

        } catch (err) {
          node.send([null, { "payload": err.message }]);
          node.error(err.message);
        }
      });

    }
  }
  RED.nodes.registerType("zattoo", ZattooNode);
}
