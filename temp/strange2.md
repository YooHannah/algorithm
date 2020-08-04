```
$('div').eq(0).show().end().eq(1).hide();
```
jquery 通过更替this指向实现链式调用
```
jQuery.fn = jQuery.prototype = {
  pushStack: function( elems ) {
		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );
		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		// Return the newly-formed element set
		return ret;
	},
  eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},
  show: function() {
		return showHide( this, true );
	},
  hide: function() {
		return showHide( this );
	},
	end: function() {
		return this.prevObject || this.constructor();
	},
  
  css: function( name, value ) {
		return access( this, function( elem, name, value ) {	。。。。}, name, value, arguments.length > 1 );
	}
}
function showHide( elements, show ) {
  。。。。
  return elements;
}
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
  var i = 0,
    len = elems.length,
    bulk = key == null;
  if ( toType( key ) === "object" ) {
    chainable = true;
    for ( i in key ) {。。。。}
  } else if ( value !== undefined ) {
    chainable = true;
    if ( !isFunction( value ) ) { 。。。。}
    if ( bulk ) { 。。。。}
    if ( fn ) { 。。。。。}
  }
  //当是链式调用时，返回对象
  if ( chainable ) {
    return elems;
  }
  // Gets
  if ( bulk ) {
    return fn.call( elems );
  }

  return len ? fn( elems[ 0 ], key ) : emptyGet;
};
```
当showHide，access传入this的时候，返回的即this,接着可以实现链式