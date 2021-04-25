/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);
var httpd = null;
var ref = null;
function onDeviceReady() {
	httpd = ( cordova && cordova.plugins && cordova.plugins.CorHttpd ) ? cordova.plugins.CorHttpd : null;
	startServer("mypage") // no need to stop as the server runs for the lifetime of the program.
}

function startServer( wwwroot ) {
	if ( httpd ) {
		// before start, check whether its up or not
		httpd.getURL(function(url){
			if(url.length > 0) {
				document.getElementById('url').innerHTML = "server is up: <a href='" + url + "' target='_blank'>" + url + "</a>";
			} else {
				/* wwwroot is the root dir of web server, it can be absolute or relative path
				* if a relative path is given, it will be relative to cordova assets/www/ in APK.
				* "", by default, it will point to cordova assets/www/, it's good to use 'htdocs' for 'www/htdocs'
				* if a absolute path is given, it will access file system.
				* "/", set the root dir as the www root, it maybe a security issue, but very powerful to browse all dir
				*/
				httpd.startServer({
					'www_root' : wwwroot,
					'port' : 8080,
					'localhost_only' : true
				}, function( url ){
				  // if server is up, it will return the url of http://<server ip>:port/
				  // the ip is the active network connection
				  // if no wifi or no cell, "127.0.0.1" will be returned.
					try{
						ref = cordova.InAppBrowser.open('http://127.0.0.1:8080/index.html', '_blank', 'location=no');
						ref.addEventListener('message', messageCallBack);
						ref.addEventListener('loadstop', loadStopCallBack);
					}
					catch(err){
						alert(err.message);
					}
				}, function( error ){
					alert("failed to start server: " + error);
				});
			}
			
		});
	} else {
		alert('CorHttpd plugin not available/ready.');
	}
}

function loadStopCallBack(params){
	ref.executeScript({ code: ""});
}

function messageCallBack(params){
	// alert("message received: " + params.data.to_execute_code);
	try{
		eval(params.data.to_execute_code);
	} catch(error){
		alert(error);
	}
}
