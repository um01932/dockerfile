/**
 * Interface describing the transfer object used by the Messaging API
 * @author Tobias Straller [Tobias.Straller@nttdata.com]
 */
export interface ITransfer {
    /**
     * Used by the connection to identify messages
     */
    messageId:string,
    /**
     * Caller id
     */
    from:string,
    /**
     * Describes the api call
     */
    api:{
        /**
         * Name of the api function
         */
        fn:string,
        /**
         * The api function's return value, which can be a serializable object
         */
        result?:any,
        /**
         * If an error occured during the api call, this property will be set
         */
        error?: {
            code:string,
            message:string
        }
    }
    /**
     * Ports for new connections
     */
    ports?:MessagePort[]
}
