/*! Built with http://stenciljs.com */
const{h:t}=window.mwp;class e{handleClick(){this.dashboard&&this.connection.callApi("openDashboard",{id:this.dashboard})}render(){return t("img",{src:this.url,onClick:()=>this.handleClick()})}static get is(){return"mwp-image"}static get properties(){return{connection:{type:"Any",attr:"connection"},dashboard:{type:String,attr:"dashboard"},url:{type:String,attr:"url"}}}static get style(){return"mwp-image img{width:100%}"}}export{e as MwpImage};