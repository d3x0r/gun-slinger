/* 

reserved words :
  and, or, on, root, get
  , fields
  , "=", ">", ">=", "<", "<=", "<>", "!="
  , "||", "&&"
  , "*"

Usage : 
var optionTreeScheme =
{  
        'option' : { value : 'string', parent : 'option', children: 'set(option)', name : 'name'  },
        'name': { name : 'string' }
 }

var simsSchema =
{
    person : { name : "string", age : "number", bday: "Date", spouse : "person", siblings:  "set(person)", items : "set(item)" },
    ...
    animal : [ name : "string", type : "string", owner : "person" ],
    item : [ name : "string", weight : "number" ],
}

var dataSet = createGraphSchema( simsSchema );

----------

{ 
}


.select( what )
.where( condition )
[.limit( count [,offset] )]
[.order( order By )]
[.limit( count [,offset] )]

var conditions = [
        { name : { "=" : "bob" } },
        { sex : { "=":"yes" } },

        { age : { ">":18, "<":25 } }


        { siblings : { age : { ">":18, "<":25 } }

        { siblings : { items : { name : { "=" : "gun" } } } }

        { and : [ { siblings : { items : { name : { "=" : "gun" } } } } }
                , { siblings : { items : { name : { "=" : "ammo" } } } } } ] }

}


var whats = [
        [ "name", "age" ]
        [ "name", "sex", { spouse : [ "name", "sex" ] } ]
]

// select command.
// return value is a cancelable object.
// callback will be called with an array that contains objects representing the objects selected.
// Those objects will be consolidated such that they may themselves contain lists/arrays of
// objects.
// the callback will also be triggered with an optional field that is an array listing the changes in the structure from the last event
// 

var db = gun.get( "dbRoot" );

function selectCallback( records, changes ) {
        if( !changes ) {
                // records will all be complete, and at the first complete state
        } else {
                changes.forEach( change=>{
                        // change is ....
                        change = { record : record(Index), map:[], field:"name"   }
                        var newValue = change.map.reduce( (accumulator,path)=>accumulator[path], records[change.recordIndex] ) [change.field];
                        // dispatch this value.
                       change.map.reduce( (accumulator,path)=>accumulator[path], records[change.recordIndex] ).on[change.field]();
                        
                })
        }
}

var changes = [
        { record : record(Index), map:[], field:"name"  }
        , { record : record, map: ["siblings",NS], field: "age" }
        , { record, map:["siblings",NS,"items",NI], field: "price" }



db.select( { 
        where:{...}
        , orderBy: {...}
        , range : { } 
 }, cb()  )


*/

/*
* Gun Db Interface (should be a separate source or something, but it's
* an intended target for usage, SQL can be done too, but requires creating additional data automatically and WILL 
* generate INCOMPATIBLE outputs)
*
if(false ) {


        console.log( "module:",module, module.filename.includes( "node_modules/gun-file" ));

        const Gun = require(module.filename.includes( "node_modules/gun-file" )?'../gun/gun':'gun/gun');

        Gun.on('opt', function(ctx){
                this.to.next(ctx);
                var opt = ctx.opt;
                if(ctx.once){ return }
                /*
                var fileName = String(opt['file-name'] || 'data.json6');
                var fileMode = opt['file-mode'] || 0666;
                var filePretty = ('file-pretty' in opt)?opt['file-pretty']:true;
                var fileDelay = opt['file-delay'] || 100;
                * /
                var gun = ctx.gun;

        } );

const rel_ = Gun.val.rel._;  // '#'
const node_ = Gun.node._;  // '_'

        Gun.chain.select = function( opts, cb ){
                var what = opts.what || [];
                var where = opts.where || {};
                var order = opts.orderBy || null;
                var range = opts.range || {};

                //[ "name", "sex", spouse : [ "name", "sex" ] ]
                if( what.length ) {
                        // only specific fields are to be selected
                        // if those fields are not 'required' select callback may be invoked when they come in later
                        // I guess specifying them as 'what' makes them required
                        this.map().val( gotVal );

                } else {
                        // select *

                }

                function gotVal( val, field ) {

                }
	        return this;
        }


}
*/

function createGraphSchema( def ) {
	var result = {
                types : [],
                rootType : []
        };


	var defClasses = Object.keys( def );
        defClasses.forEach( cls=>{
        	var fields = Object.keys( def[cls] );
                var c;

                result.types.push( c = { name : cls, fields : [] } );
                c.get = function() { return  makeInstance( c ) };

                fields.forEach( field=>c.fields.push( { name : field, type : parseType( def[cls][field] ) } ) );

                result[cls] = c;
        } );


        function list() {

        }

        function parseType( type ) {
                // |[ ]*([sl][ei]s*t) *\(([^\)]*)\)[ ]*
                // match  [set(type)|list(type)|type]  [space] [extra (parse for more info later)]
                // set or list with parenetheses around type name or just a type name.
                // other things after are 'extra' and are specifiers like (DEF)AULT, (OPT)IONAL
                var dataType = type.match( /[ ]*([sl][ei]s*t) *\( *([^ ]*)[ ]*\)[ ]*|[ ]*([^ ]*)[ ]*/ );
                var extra = type.substr( dataType.index + dataType[0].length );
                if( dataType[1] ){
                        if( dataType[1] === "list" ) {

                        } else if( dataType[1] === "set" ) {
                                
                        } else {
                                throw new Exception( "Data type specification has unknown classifier:'" + type, "' specifier:" + dataType[1] )
                        }
                        return { type: dataType[2], class: dataType[1], extra : extra };
                }else {
                        //dataType[3]
                        return { type: dataType[3], class: null, extra : extra };
                }
                //console.log( "Match:", "'"+dataType+"'", "extra:", "'"+extra+"'" );
        }

        function makeInstance( type ) {
                var c = type;
                var o = { _cls: c, '_': {} };
                c.fields.forEach( field=>{                        
                        o._[field.name] = undefined;
                        Object.defineProperties( o, {
                                [field.name]:{
                                        configurable:false,
                                        enumerable:true,
                                        //value:,
                                        get(){
                                                return this._[field.name]
                                        },
                                        set(value) {
                                                // gun.put( value )
                                                this._[field.name] = value;
                                        },
                                }
                        })
                        o.commit = function() {
                                // put all changed fields on this object(?)
                        }
                        o.revert = function() {
                                // put all changed fields on this object(?)
                        }
                })
                return o;
        }

        function resolveType( type ) {
                if( (type.type in result) ) {
                        if( type.class === "list" ) {

                        } else if( type.class == "set" ) {
                        
                        } else {
                        }
                }else {
                        result[type.type] = {
                                get() {
                                        
                                }
                        }

                }
        }

        function test() {
                parseType( "list(string) optional" )
                parseType( "set(string)" )
                parseType( "person" )
                parseType( "number default 3.14" )
                parseType( "    list ( number )  default 3.14" )
                parseType( "    list ( number)  default 3.14" )
        }
        test();
        return result;
}


var schedule = createGraphSchema( {
        calendar : { date : "Date", slot : "sessionSlot", session : "session" },
        sessionSlot : { name : "string"},
        session : { name : "string", games : "list(game)", sales : "customer" },
        sessionGames : { game: "game" },
        gameSet : { name : "string", games : "list(game)" },
        game : { name : "string", patterns : "set(pattern)" },

        pattern : { name : "string", masks : "set(number)" }, /* could also just be a string of CSV numbers */
        customer : { name : "string", items : "set(item)" },
        bundle : { name : "string", items: "set(item)", price : "number" },
        item : { name : "string", packs : "set(pack)", price : "number" },
        pack : { name : "string", cards : "set(number)" },
        card : { spots : "number", numbers : "string" },
        cardset : { name : "string", mfg: "string", splits : "set(cardsetRange)" },
        cardsetRange : { from : "number", to:"number", within: "cardData" },
        cardData : { name : "string", cards : "list(cards)" },
})
console.log( "got a schedule:", Object.keys( schedule ) );
var session = schedule.session.get();
console.log( "Got a session:", session );
session.name = "Single Pay";

session.commit();

var game = 