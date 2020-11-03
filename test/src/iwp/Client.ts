import {Connection} from "./Connection";
import {IClientConfig} from "./IClientConfig";
/**
 * WorkplaceClient abstracts sending messages to the workplace and workplace apps.
 * It provides an interface that uses promises to react on asynchronous messages.
 * @author Tobias Straller [Tobias.Straller@nttdata.com]
 */
export class Client {

    hostConnection:Connection;
    allowConnectFrom:string[];

    private _callback:(client:Client) => void;
    private _origin:string;
    private _connectHandlers:((from:string, connection:Connection) => void)[];
    private _clientConnections:{[id:string]:Connection};

    /**
     *
     * @param hostFrame the window which is serving as host. In the workplace environment this is the parent window
     * @param {IClientConfig} config
     * @param {Function} callback
     * @constructor
     */
    constructor(hostWindow:Window, config:IClientConfig = {
        origin: '*',
        allowConnectFrom: []
    }, callback:(client:Client) => void) {
        this._origin = config.origin;
        this._callback = callback;
        this.hostConnection = null;
        this.allowConnectFrom = config.allowConnectFrom;
        this._connectHandlers = [];
        this._clientConnections = {};
        var channel = new MessageChannel();
        this.hostConnection = new Connection(channel.port1, true, () => {
            this._callback(this);
        });
        this.hostConnection.registerApi('connect', this._connectCallHandler.bind(this));
        hostWindow.postMessage('connect', config.origin, [channel.port2]);
        window.addEventListener('beforeunload', this.disconnect.bind(this));
        window.addEventListener('unload', this.destroy.bind(this));
    };

    /**
     * Register a handler function in case another client has been connected
     * @param handler Handler function which will receive the id the client and a connection to the client as argument.
     */
    onConnect(handler:(from:string, connection:Connection) => void) {
        this._connectHandlers.push(handler);
    }

    /**
     * Unregister the given connect handler
     * @param handler
     */
    offConnect(handler:(from:string, connection:Connection) => void) {
        var index = this._connectHandlers.indexOf(handler);
        if (index > -1) {
            this._connectHandlers.splice(index, 1);
        }
    }

    /**
     * Make call to the host api.
     * See also [[Connection.callApi]].
     * @param name
     * @param params
     * @returns {Promise}
     */
    callApi(name:string, ...params:any[]):Promise<any> {
        return this.hostConnection.callApi(name, ...params);
    };

    /**
     * Register an api function at the host connection.
     * See also [[Connection.registerApi]].
     *
     * @param name
     * @param handler
     */
    registerApi(name, handler:(...params:any[]) => Promise<any>|any) {
        this.hostConnection.registerApi(name, handler);
    };

    /**
     * Unregister an api function at the host connection.
     * See also [[Connection.unregisterApi]].
     *
     * @param name
     */
    unregisterApi(name): void {
        this.hostConnection.unregisterApi(name);
    }

    /**
     * Disconnect from host
     */
    disconnect() {
        if (this.hostConnection) {
            this.hostConnection.close();
            this.hostConnection = null;
        }
    };

    /**
     * Destroy the current instance.
     * Remove listeners, close all ports.
     */
    destroy() {
        this.disconnect();
        for (var id in this._clientConnections) {
            if (this._clientConnections.hasOwnProperty(id)) {
                this._clientConnections[id].close();
            }
        }
        this._clientConnections = {};
    };

    /**
     *
     * @private
     */
    private _connectCallHandler(port, params):void {
        if (this.allowConnectFrom.length === 0 || this.allowConnectFrom.indexOf(params.from) > -1) {
            var connection = new Connection(port, true);
            this._clientConnections[params.from] = connection;
            connection.onClose(() => {
               this._clientConnections[params.from] = null;
               delete this._clientConnections[params.from];
            });
            this._connectHandlers.forEach((handler) => {
                handler(params.from, connection);
            });
        } else {
            throw new Error('Client -> _connectCallHandler: Connection refused for ' + params.from);
        }
    }

}