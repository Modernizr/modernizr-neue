define(function(){return{load:function(name,req,onLoad,config){req([req.toUrl(name)],function(mod){onLoad(mod)})},normalize:function(name,norm){return(name+=name.indexOf("?")<0?"?":"&")+"noext=1"}}});
//# sourceMappingURL=noext.js.map
