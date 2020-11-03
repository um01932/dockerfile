import {Connection} from "./Connection";

/**
 * A host can manage connections to multiple clients.
 * The host registers an api function on every client connection, which allows clients to connect to each other.
 * The host acts as a connection broker between the clients und supplies the MessageChannel.
 *
 * Connections can be grouped by supplying a group parameter. Grouped connections can only communicate with connections in the same or in the default group.
 * Groups are used in the workplace to restrict communication between widgets on a dashboard.
 *
 * @author Tobias Straller [Tobias.Straller@nttdata.com]
 */
export class Host {

    private _connections:{ [group:string]: {[id:string]: Connection }};
    private _messageListeners:{ [id:string]: EventListenerOrEventListenerObject };
    private _promises:{ [group:string]: {[id:string]:{resolve:(connection:Connection) => void, reject:(reason:any) => void}[]}};

    /**
     * @constructor
     */
    constructor() {
        this._connections = {'default': {}};
        this._promises = {};
        this._messageListeners = {};

    }

    /**
     * Find a connection. If connection is not found in supplied group, then check default group.
     * @param id
     * @param group
     * @returns {any}
     */
    private connectionGet(id:string, group:string='default'):Connection {
        var connection;
        if(group !== 'default' && this._connections[group]) {
            connection = this._connections[group][id];
        }
        if(!connection) {
            connection = this._connections['default'][id];
        }
        return connection;
    }

    /**
     * Find all connections in all groups
     * @param {string} id
     * @returns {Connection}
     */
    private connectionGetAll(id:string):Connection[] {
        return Object.keys(this._connections).map((group: string) => {
            return this._connections[group][id];
        }).filter(function(con) {
            return !!con;
        });
    }

    /**
     * Add a connection to a group.
     * @param id
     * @param connection
     * @param group
     */
    private connectionAdd(id:string, connection:Connection, group:string='default'):void {
        if(!this._connections[group]) {
            this._connections[group] = {};
        }
        this._connections[group][id] = connection;
    }

    /**
     * Remove a connection from a group
     * @param id
     * @param group
     */
    private connectionRemove(id:string, group:string='default'):void {
        if(this._connections[group]) {
            this._connections[group][id] = null;
            delete this._connections[group][id];
        }
    }

    /**
     * Create a message channel between two clients.
     * @param {string} from
     * @param group
     * @param params
     * @private
     */
    private connect(from, group:string, params):Promise<{port:MessagePort}> {
        var messageChannel = new MessageChannel();
        var connection = this.connectionGet(params.id, group);
        if (connection) {
            params.from = from;
            return connection.callApi('connect', params, messageChannel.port1).then(() => {
                return {port: messageChannel.port2};
            });
        } else {
            throw new Error('Host -> connect: Not connected to client ' + params.id);
        }
    };

    /**
     * Create a message channel between two clients.
     * @param {string} from
     * @param group
     * @param params
     * @private
     */
    private connectAll(from, params):Promise<{port:MessagePort}[]> {
       return Promise.all(this.connectionGetAll(params.id).map((connection:Connection) => {
            var messageChannel = new MessageChannel();
            params.from = from;
            return connection.callApi('connect', params, messageChannel.port1).then(() => {
                return {port: messageChannel.port2};
            });
        }));
    };

    /**
     * Add a promise that will resolve with a connection
     * @param id
     * @param promise
     * @param group
     * @returns {{resolve: ((connection:Connection)=>void), reject: ((reason:any)=>void)}}
     */
    private addPromise(id:string, promise:{resolve:(connection:Connection) => void, reject:(reason:any) => void}, group:string='default'):{resolve:(connection:Connection) => void, reject:(reason:any) => void} {
        if(!this._promises[group]) {
            this._promises[group] = {};
        }
        if(!this._promises[group][id]) {
            this._promises[group][id] = [];
        }
        this._promises[group][id].push(promise);
        return promise;
    }

    /**
     * Resolve all promises for a certain connection
     * @param id
     * @param connection
     * @param original
     * @param group
     */
    private resolvePromises(id:string, connection:Connection, original:{resolve:(connection:Connection) => void, reject:(reason:any) => void}, group:string='default'):void {
        if(this._promises[group] && this._promises[group][id]) {
            this._promises[group][id].forEach((promise:{resolve:(connection:Connection) => void, reject:(reason:any) => void}) => {
                if(promise !== original) {
                    promise.resolve(connection);
                }
            });
            this._promises[group][id] = [];
        }
    }

    /**
     * Create a new connection to a client.
     * When creating a connection to an iframe content window, wait for the load event.
     *
     *          frame.addEventListener('load', function() {
     *              host.createConnection('myId', 'http://some.origin.tld', frame.contentWindow)
     *                     .then(function(connection) {
     *                          //client is ready to receive
     *                      });
     *          });
     *
     *
     * @param id used to identify the client
     * @param frame reference to the browsing context, eg. contentWindow of an iframe
     * @param group connections are only allowed to communicate within their connection group or the default group
     * @returns {Connection}
     */
    createConnection(id:string, origin:string, frame:Window, group?:string):Promise<Connection> {
        this.removeConnection(id, group);
        var p = new Promise((resolve:(connection:Connection) => void, reject:(reason:any) => void) => {
            var promise = this.addPromise(id, {resolve: resolve, reject: reject});
            this._messageListeners[id] = (event:any) => {
                // correct frame?
                if(event.source !== frame) {
                    return;
                }
                //is it really the app?
                if(event.origin !== origin) {
                    console.error(`Host -> createConnection: Cannot create connection. 
                        Message origin ${event.origin} does not match target origin ${origin}!`);
                    return;
                }
                var connection = new Connection(event.ports[0], true);
                connection.registerApi('connect', this.connect.bind(this, id, group));
                connection.registerApi('connectAll', this.connectAll.bind(this, id));
                connection.onClose(() => {
                    this.removeConnection(id, group);
                });
                this.connectionAdd(id, connection, group);
                resolve(connection);
                this.resolvePromises(id, connection, promise, group);
                connection.port.postMessage('connected');
                window.removeEventListener('message', this._messageListeners[id]);
            };
            window.addEventListener('message', this._messageListeners[id], false);
        });
        return p;
    };

    /**
     * Creates a local connection that is not transfered via postMessage
     * @param {string} id
     * @param {string} group
     */
    createLocalConnection(id:string, group:string): Connection {
        var channel = new MessageChannel();
        var host = new Connection(channel.port1, true);
        host.registerApi('connect', this.connect.bind(this, id, group));
        host.registerApi('connectAll', this.connectAll.bind(this, id));
        host.onClose(() => {
            this.removeConnection(id, group);
        });
        this.connectionAdd(id, host, group);
        return new Connection(channel.port2, true);
    }

    /**
     * Returns the connection for the given client id
     * @param id used to identify the client
     * @param group connections are only allowed to communicate within their connection group or the default group
     * @returns {Connection} returns null if no connection was found for the client id
     */
    getConnection(id:string, group?:string):Promise<Connection> {
        var promise = new Promise<Connection>((resolve, reject) => {
            var connection = this.connectionGet(id, group);
            if (connection) {
                resolve(connection);
            } else {
                this.addPromise(id, {resolve: resolve, reject: reject}, group);
            }
        });
        return promise;
    };

    /**
     * Whether the current host has an established connection for the given id
     * @param id
     * @param group connections are only allowed to communicate within their connection group or the default group
     * @returns {boolean}
     */
    hasConnection(id:string, group?:string):boolean {
        return typeof this.connectionGet(id, group) !== 'undefined';
    }

    /**
     * Close the connection with given id
     * @param id
     */
    closeConnection(id:string, group:string = 'default'):void {
        var con = this.connectionGet(id, group);
        if (con) {
            con.close();
        }
        var promises = this._promises[group] && this._promises[group][id];
        if(promises) {
            promises.forEach((p:{resolve:(connection:Connection) => void, reject:(reason:any) => void}) => {
                p.reject('Connection removed.');
            });
        }
        delete this._promises[id];
       this.removeConnection(id, group);
    }

    /**
     * Remove a connection
     * @private
     * @param id
     * @param group connections are only allowed to communicate within their connection group or the default group
     */
    private removeConnection(id:string, group?:string):void {
       var connection = this.connectionGet(id, group);
        if(connection) {
           connection.offClose();
           this.connectionRemove(id, group);
       }

       if(this._messageListeners[id]) {
           window.removeEventListener('message', this._messageListeners[id]);
           delete this._messageListeners[id];
       }
    }

    /**
     * Destroy the host. Closes all connections
     */
    destroy():void {
        var ids = [];
        for(var group in this._connections) {
            if (this._connections.hasOwnProperty(group)) {
                for (var id in this._connections[group]) {
                    if (this._connections[group].hasOwnProperty(id)) {
                        ids.push(id);
                    }
                }
                ids.forEach((id:string) => {
                    this.closeConnection(id);
                });
            }
        }
    }

}
