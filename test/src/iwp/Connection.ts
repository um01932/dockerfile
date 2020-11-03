///<reference path="../../node_modules/typescript/lib/lib.es6.d.ts"/>

import {ITransfer} from "./ITransfer";


/**
 * Connection that has a port to an external browsing context.
 * The current context can register api functions for the external context.
 * The current context can call api functions registered by the external context.
 * @author Tobias Straller [Tobias.Straller@nttdata.com]
 */
export class Connection {

    /**
     * Error code inidicating that an api function has not been registered for the current connection
     * @type {number}
     */
    static ERROR_CODE_API_FUNCTION_UNAVAILABLE = 0;

    /**
     * Connection uses this message port for communication
     */
    port:MessagePort;

    private _messageId:number;
    private _keepAlive:boolean;
    private _deferredMap:{[messageId:string]:{reject:(reason?:any) => void, resolve:(value?:any | PromiseLike<any>) => void}};
    private _handlers:{[fn:string]:(...params:any[]) => Promise<any>|any};
    private _onReadyCallback:() => void;
    private _closeHandlers:((connection:Connection) => void)[];
    private _establishedConnections:Connection[];


    /**
     * @constructor
     * @param {MessagePort} port
     * @param {boolean} keepAlive Default is false. When false, the connection will be closed after the first api call.
     * @param onReady will be called when the connection has been established
     */
    constructor(port:MessagePort, keepAlive:boolean = false, onReady?:() => void) {
        this._keepAlive = keepAlive;
        this._establishedConnections = [];
        this._messageId = 0;
        this._deferredMap = {};
        this._handlers = {}
        this._closeHandlers = [];
        this.port = port;
        this.port.onmessage = this.onMessageCallback.bind(this);
        this._onReadyCallback = onReady;
    };

    /**
     * Make call to an api function available on the connection.
     * Return value is a promise that will resolve with the return value of the api call.
     *
     *          connection.callApi('nameOfApiFn', paramVal1, paramVal2)
     *                      .then(function(result) {
     *                          // call complete
     *                      }).catch(function(reason) {
     *                          // call failed
     *                      });
     *
     * @param {string} name
     * @param {Array} params
     * @param {MessagePort} port
     * @returns {Promise}
     */
    callApi(name:string, ...params:any[]):Promise<any> {
        var messageId = this._nextMessageId();
        var port = params[params.length - 1];
        port = port instanceof MessagePort ? port : null;
        return new Promise((resolve, reject) => {
            this.port.postMessage(JSON.stringify({
                messageId: messageId,
                api: {
                    fn: name,
                    params: params
                }
            }), port ? [port] : []);
            this._deferredMap[messageId] = {
                resolve: resolve,
                reject: reject
            };
        });
    };

    /**
     * Register an api function by name. The handler will be called with the supplied parameters and optional a port.
     *
     *          connection.registerApi('myApiFnName', function(param1, param2) {
     *              // handle api call and return a value or a promise
     *              return new Promise(function resolve() {}, function reject() {})
     *          });
     *
     *
     * @param {string} name api function is registered with this name
     * @param {Function} handler function will be called
     * @param {MessagePort} [port]
     */
    registerApi(name:string, handler:(...params:any[]) => Promise<any>|any) {
        this._handlers[name] = handler;
    };

    /**
     * Check whether an api function is registered on the current connection.
     * @param {string} name api function registered under this name
     */
    isRegisteredApi(name:string):boolean {
        return typeof this._handlers[name] !== 'undefined';
    };

    /**
     * Unregister an api function
     * @param {string} name api function registered under this name
     */
    unregisterApi(name:string):void {
        var handler = this._handlers[name];
        if(handler) {
            this._handlers[name] = null;
            delete this._handlers[name];
        }
    };

    /**
     * Close the connection.
     * Removes handlers, closes port.
     */
    close() {
        this.port.postMessage('close');
        this.port.close();
        this._establishedConnections.forEach((connection:Connection) => {
            connection.close();
        });
        this._establishedConnections = [];
        this._closeHandlers.forEach((handler:(connection:Connection) => void) => {
            handler(this);
        });
        this._closeHandlers = [];
        this.port = null;
        this._handlers = {};
        for (var id in this._deferredMap) {
            if (this._deferredMap.hasOwnProperty(id)) {
                this._deferredMap[id].reject('close');
            }
        }
        this._deferredMap = {};
    };

    /**
     * Register a handler which will be called when the connection is closed.
     * The handler will receive the connection as first argument.
     * @param handler
     */
    onClose(handler:(connection:Connection) => void):void {
        if(this._closeHandlers.indexOf(handler) === -1) {
            this._closeHandlers.push(handler);
        }
    }

    /**
     * Unregister a close handler.
     * Also see [[onClose]].
     *
     * @param handler
     */
    offClose(handler?:(connection:Connection) => void):void {
        if(!handler) {
            this._closeHandlers = [];
        } else {
            var index = this._closeHandlers.indexOf(handler);
            if (index > -1) {
                this._closeHandlers.splice(index, 1);
            }
        }
    }

    /**
     * Listener for messages received on the current port
     * @private
     * @param {MessageEvent} event
     */
    private onMessageCallback(event:MessageEvent) {
        if (event.data === 'close') {
            this.close();
        } else if (event.data === 'connected' && typeof this._onReadyCallback === 'function') {
            this._onReadyCallback();
        } else {
            var port = event.ports ? event.ports[0] : null;
            var transfer = JSON.parse(event.data);
            if (typeof transfer.api.result !== 'undefined') {
                this.onResult(transfer, event.ports);
            } else if (transfer.api.error) {
                this.onError(transfer);
            } else {
                this.onApiCall(transfer, port);
            }
        }
    };

    /**
     * An api call has been answered with a result
     * @private
     * @param {ITransfer} transfer
     */
    private onResult(transfer:ITransfer, ports:ReadonlyArray<MessagePort> = []) {
        if (!ports) {
            ports = [];
        }
        var deferred = this._deferredMap[transfer.messageId];
        if (deferred) {
            var connections = ports.map((port) => {
                var connection = new Connection(port, true);
                this._establishedConnections.push(connection);
                connection.onClose(() => {
                    var index = this._establishedConnections.indexOf(connection);
                    if(index > -1) {
                        this._establishedConnections.splice(index, 1);
                    }
                });
                return connection;
            });
            if(connections.length) {
                transfer.api.fn === 'connectAll' ? deferred.resolve(connections) : deferred.resolve(connections[0]);
            } else {
                deferred.resolve(transfer.api.result);
            }

            this._deferredMap[transfer.messageId] = null;
            delete this._deferredMap[transfer.messageId];

            if (!this._keepAlive) {
                this.close();
            }
        }
    };

    /**
     * An api call has been answered with an error
     * @private
     * @param {ITransfer} transfer
     */
    private onError(transfer:ITransfer) {
        var deferred = this._deferredMap[transfer.messageId];
        if (deferred) {

            deferred.reject(transfer.api.error);

            this._deferredMap[transfer.messageId] = null;
            delete this._deferredMap[transfer.messageId];

            if (!this._keepAlive) {
                this.close();
            }
        }
    };

    /**
     * Received a request for an api call. If a handler has been registered, it is called.
     * The result of the function is converted to JSON and assigned to the result property of the transfer object.
     * If a handler is not registered, the transfer object will be extended with an error property.
     * @private
     * @param {ITransfer} transfer
     */
    private onApiCall(transfer, port?:MessagePort) {
        var handler = this._handlers[transfer.api.fn];
        if (handler) {
            var result;
            try {
                result = port ? handler(port, ...transfer.api.params) : handler(...transfer.api.params);
            } catch (e) {
                transfer.api.error = {
                    message: e.message,
                    code: e.code
                };
                this.port.postMessage(JSON.stringify(transfer));
                return;
            }
            if (result && typeof result.then === 'function') {
                result.then(function (data) {
                    var ports = [];
                    if(data && data.port) {
                        ports.push(data.port)
                    } else if(Array.isArray(data)) {
                        ports = data.filter(function(item) {
                            return !!item.port;
                        }).map(function(item) {
                            return item.port
                        });
                    }
                    transfer.api.result = typeof data === 'undefined' ? {} : data;
                    this.port.postMessage(JSON.stringify(transfer), ports);
                }.bind(this)).catch((error) => {
                    transfer.api.error = error instanceof Error ? { message: error.message } : error;
                    this.port.postMessage(JSON.stringify(transfer));
                });
            } else {
                transfer.api.result = typeof result === 'undefined' ? {} : result;
                this.port.postMessage(JSON.stringify(transfer));
            }
        } else {
            transfer.api.error = {
                code: Connection.ERROR_CODE_API_FUNCTION_UNAVAILABLE,
                message: 'Connnection -> onApiCall: API Function "' + transfer.api.fn + "' is not available"
            };
            this.port.postMessage(JSON.stringify(transfer));
        }
    };

    /**
     * Returns the next available message id
     * @private
     * @returns {number}
     */
    private _nextMessageId() {
        return this._messageId++;
    };


}