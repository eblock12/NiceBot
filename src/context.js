var Context = function(){
    var client = undefined;

    this.getClient = function() {
        return client;
    };

    this.setClient = function(newClient) {
        client = newClient;
    };
};

module.exports = new Context();
