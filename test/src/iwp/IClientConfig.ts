/**
 * Interface for configuration of clients.
 * For security reasons it is recommended to supply values for the configuration.
 */
export interface IClientConfig {
    /**
     * Client will check incoming post messages for the given origin. '*' is accepted and is the default value, but you should always set it to a specific origin.
     * The origin will be environment specific, so a different origin should be configured for TEST, INT and PROD environments.
     * Examples:
     * {'http://workplace-int.bmwgroup.net'} : will only allow connections from hosts of the workplace INT environment
     * {'*'} : would allow connections from every host, also outside the BMW environment
     */
    origin?:string;
    /**
     * A whitelist of client ids which are allowed to connect. Default is empty array, meaning that all clients can connect. The Host is managing the client ids.
     * In the workplace the client ids match the app names, e.g. "tlt" or "fls".
     */
    allowConnectFrom?:string[];
}