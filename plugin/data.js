define( [
	"./core",
	"./core/access",
	"./data/var/dataPriv",
	"./data/var/dataUser"
], function( jQuery, access, dataPriv, dataUser ) {

"use strict";

//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,//处理标签定义的属性值
	rmultiDash = /[A-Z]/g;//匹配属性名

//将获取到的数据转化成JS数据类型
function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}
//获取H5标签定义的数据值
function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	//如果节点是元素节点，则 nodeType 属性将返回 1。
    //如果节点是属性节点，则 nodeType 属性将返回 2。
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();//将key值利用正则转化成标签属性名
		data = elem.getAttribute( name );//获取属性值

		if ( typeof data === "string" ) {
			try {
				data = getData( data ); //获取到值之后进行js数据类型转化
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

// 扩展JQuery静态方法,使用引入文件(access,dataPriv, dataUser)里面的方法
jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );
//定义jQuery.data和removeData方法
jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],//获取标签对象
			attrs = elem && elem.attributes;//元素是否存在，是否有标签属性，attributes是一个装该元素标签所有属性的数组

		// Gets all values
		if ( key === undefined ) {//如果没传参给data(),就是获取所有属性及其属性值
			if ( this.length ) {
				data = dataUser.get( elem );//获取jQuery添加的键值对

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;//获取key值
							if ( name.indexOf( "data-" ) === 0 ) { //把data-的属性值也放进去
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );//data[ name ] 
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values 
		if ( typeof key === "object" ) { //传入一个obj,调用dataUser.set方法对数据进行新增、修改
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {//获取某个属性的属性值

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );//获取JQuery定义的键值对的值
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );//获取标签定义的属性值
				if ( data !== undefined ) { 
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() { //单个键值对设置

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) { //删除键值对
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );

return jQuery;
} );
