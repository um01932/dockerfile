import {Client} from "./Client";
import {Host} from "./Host";
import {IClientConfig} from "./IClientConfig";
import "../polyfills/polyfill-assign";

declare var VERSION:string;
declare var module:any;


let _clientPromise:Promise<Client>;

let _hostWindow:Window =  window.opener ? window.opener : window.parent;

let _clientConfig:IClientConfig;


/**
 * Utility for creating hosts or clients.
 * @author Tobias Straller [Tobias.Straller@nttdata.com]
 *
 */
export var Messaging = {

    _VERSION: VERSION,
    
    /**
     * Setter for the window which is serving as host. Default is the parent window.
     * Only change this in case you have a multi frame setup.
     * @param win
     */
    set hostWindow(win:Window) {
      _hostWindow = win;
    },

    /**
     * Configuration options for the client. For security reasons it is strongly advised to set the configuration.
     * @param {IClientConfig} config
     */
    set clientConfig(config:IClientConfig) {
        this._clientConfig = Object.assign({}, config);
    },

    /**
     * Create a messaging api client
     *
     *      this.createClient(window.parent, {origin: 'http://workplace-int.bmwgroup.net', allowConnectFrom: []}).then(function(client) {
     *          //client is connected
     *          client.registerApi('myApiFunctionName', function() {
     *              //handle api call
     *          });
     *      });
     *
     * @param hostWindow The window which is serving as host. Default is the parent window.
     * @param {IClientConfig} config
     * @returns {Promise<Client>}
     */
    createClient(hostWindow:Window = _hostWindow, config:IClientConfig = this._clientConfig):Promise<Client> {
        if(_clientPromise) {
            _clientPromise.then((client:Client) => {
                client.destroy();
            });
        }
        _clientPromise = new Promise((resolve:(client:Client) => void) => {
            new Client(hostWindow, config, (client:Client) => {
                client.hostConnection.onClose(() => {
                    _clientPromise = null;
                });
                resolve(client);
            });
        });
        return _clientPromise;
    },

    /**
     * Returns a client. If no client exists yet, a new client will be created.
     */
    getClient():Promise<Client> {
        if(_clientPromise) {
           return _clientPromise;
        } else {
            return this.createClient();
        }
    },

    /**
     * Create a messaging api host.
     * @returns {Host}
     */
    createHost():Host {
        return new Host();
    },

    /**
     * Utility function to check for a URL parameter value in a query string.
     * @param param
     * @param value
     * @param queryString default is window.location.search
     * @returns {boolean}
     */
    matchUrlParam(param:string, value:string, queryString?:string):boolean {
        if(typeof queryString === 'undefined') {
            queryString = window.location.search;
        }
        var matcher = new RegExp(`^.*?${param}=(.*?)(&.*|$)`);
        var result = matcher.exec(queryString);
        return result !== null && result[1] === value;
    },

    /**
     * Checks whether the current browsing context is running in the workplace environment.
     * @returns {boolean}
     */
    isWorkplaceEnv():boolean {
        return (this.matchUrlParam('env', 'workplace') || window.name.indexOf('myworkplace-') === 0);
    }

};

