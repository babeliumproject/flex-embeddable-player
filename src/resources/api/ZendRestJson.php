<?php

/**
 * Babelium Project open source collaborative second language oral practice - http://www.babeliumproject.com
 *
 * Copyright (c) 2011 GHyM and by respective authors (see below).
 *
 * This file is part of Babelium Project.
 *
 * Babelium Project is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Babelium Project is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

require_once 'Zend/Rest/Server.php';
require_once 'Zend/Json.php';

/**
 * A customized version of Zend's Rest Server class that allows to receive base64 encoded json parameters
 * and return json and xml responses
 *
 * @author Babelium Team
 *
 */
class ZendRestJson extends Zend_Rest_Server
{

	protected $_responseMode = 'xml';

	public function setResponseMode($mode)
	{
		if($mode == 'xml' || $mode == 'json'){
			$this->_responseMode = $mode;
		}
		else{
			$this->_responseMode = 'json';
		}
	}

	/**
	 * Implement Zend_Server_Interface::handle()
	 *
	 * @param  array $request
	 * @throws Zend_Rest_Server_Exception
	 * @return string|void
	 */
	public function handle($request = false)
	{
		if($this->_responseMode == 'xml')
			$this->_headers = array('Content-Type: text/xml');
		if($this->_responseMode == 'json')
			$this->_headers = array('Content-Type: text/plain');
		if (!$request) {
			$request = $_REQUEST;
		}
		if (isset($request['method'])) {
			$this->_method = $request['method'];
			if (isset($this->_functions[$this->_method])) {
				if ($this->_functions[$this->_method] instanceof Zend_Server_Reflection_Function || $this->_functions[$this->_method] instanceof Zend_Server_Reflection_Method && $this->_functions[$this->_method]->isPublic()) {
					$request_keys = array_keys($request);
					array_walk($request_keys, array(__CLASS__, "lowerCase"));
					$request = array_combine($request_keys, $request);

					$func_args = $this->_functions[$this->_method]->getParameters();
					$calling_args = array();
					$missing_args = array();
					foreach ($func_args as $arg) {
						if (isset($request[strtolower($arg->getName())])) {
							$calling_args[] = $this->_convertParameter($request[strtolower($arg->getName())]);
						} elseif ($arg->isOptional()) {
							$calling_args[] = $arg->getDefaultValue();
						} else {
							$missing_args[] = $arg->getName();
						}
					}

					foreach ($request as $key => $value) {
						if (substr($key, 0, 3) == 'arg') {
							$key = str_replace('arg', '', $key);
							$calling_args[$key] = $this->_convertParameter($value);
							if (($index = array_search($key, $missing_args)) !== false) {
								unset($missing_args[$index]);
							}
						}
					}

					// Sort arguments by key -- @see ZF-2279
					ksort($calling_args);

					$result = false;
					if (count($calling_args) < count($func_args)) {
						require_once 'Zend/Rest/Server/Exception.php';
						$result = $this->fault(new Zend_Rest_Server_Exception('Invalid Method Call to ' . $this->_method . '. Missing argument(s): ' . implode(', ', $missing_args) . '.'), 400);
					}

					if (!$result && $this->_functions[$this->_method] instanceof Zend_Server_Reflection_Method) {
						// Get class
						$class = $this->_functions[$this->_method]->getDeclaringClass()->getName();

						if ($this->_functions[$this->_method]->isStatic()) {
							// for some reason, invokeArgs() does not work the same as
							// invoke(), and expects the first argument to be an object.
							// So, using a callback if the method is static.
							$result = $this->_callStaticMethod($class, $calling_args);
						} else {
							// Object method
							$result = $this->_callObjectMethod($class, $calling_args);
						}
					} elseif (!$result) {
						try {
							$result = call_user_func_array($this->_functions[$this->_method]->getName(), $calling_args); //$this->_functions[$this->_method]->invokeArgs($calling_args);
						} catch (Exception $e) {
							$result = $this->fault($e);
						}
					}
				} else {
					require_once "Zend/Rest/Server/Exception.php";
					$result = $this->fault(
					new Zend_Rest_Server_Exception("Unknown Method '$this->_method'."),
					404
					);
				}
			} else {
				require_once "Zend/Rest/Server/Exception.php";
				$result = $this->fault(
				new Zend_Rest_Server_Exception("Unknown Method '$this->_method'."),
				404
				);
			}
		} else {
			require_once "Zend/Rest/Server/Exception.php";
			$result = $this->fault(
			new Zend_Rest_Server_Exception("No Method Specified."),
			404
			);
		}

		if ($result instanceof SimpleXMLElement) {
			$response = $result->asXML();
		} elseif ($result instanceof DOMDocument) {
			$response = $result->saveXML();
		} elseif ($result instanceof DOMNode) {
			$response = $result->ownerDocument->saveXML($result);
		} elseif (is_array($result) || is_object($result)) {
			$response = $this->_handleStruct($result);
		} else {
			$response = $this->_handleScalar($result);
		}

		if($this->_responseMode == 'json'){
			//$obj = simplexml_load_string($response);
			//$response = json_encode($obj);
			
			$response = Zend_Json::fromXml($response, false);

            $response = preg_replace_callback('/\\\\u([0-9a-f]{4})/i',
											  create_function('$match','return mb_convert_encoding(pack("H*", $match[1]), "UTF-8", "UCS-2BE");'),
											  $response);
		}

		if (!$this->returnResponse()) {
			if (!headers_sent()) {
				foreach ($this->_headers as $header) {
					header($header);
				}
			}

			echo $response;
			return;
		}

		return $response;
	}

	/**
	 * Checks whether the provided parameter is an base64 encoded json representation of an object and if so
	 * returns a stdClass representation of it. If the parameter is not base64 decodable or doesn't have
	 * a valid json representation we assume it's an scalar parameter and return it as it is.
	 *
	 * @param mixed $parameter
	 * 		An HTTP request parameter of undetermined type
	 * @return mixed $result_parameter
	 * 		Returns an stdClass representation of the parameter given this parameter is a base64 encoded json representation. Otherways it returns the parameter as is.
	 */
	protected function _convertParameter($parameter){
		$result_parameter = $parameter;
		//JSON object parameters are encoded using base64 on the client
		if(base64_decode($parameter) !== false){
			$json_parameter = base64_decode($parameter);
			if(json_decode($json_parameter) !== null){
				$object_parameter = json_decode($json_parameter);
				$result_parameter = $object_parameter;
			}
		}
		return $result_parameter;

	}
	
	protected function _validateRequest($request){
		
		//Check if a cookie with the current SessionID is set and not expired
		
		//Check if the host that made the request is appropriate
		
		//Check if the referer of the request is an expected one
		
		//Should the querys be made via AJAX, check the presence of a header that denotes so
		
		//Check if the request is a POST request
		
		//Check the JSON passed as POST data
		if($request->method == $this->destinationMethod){
			if($request->method == 'getCommunicationToken'){
				if($request->headers->session == session_id() && md5(session_id()) == $request->parameters->secretKey){
					
					//Save the uuid
					$_SESSION['uuid'] = $request->headers->uuid;
					
					//Delegate the call to the appropriate service where it should do the following
					
						//Generate a communicationToken
						$token = $this->generateRandomCommunicationToken(13);
						//Save the communicationToken for future requests
						$_SESSION['commToken'] = $token;
						//Return the token
				} else {
					//Wrong api request
				}
			} else {
				if($request->headers->session == session_id() && $_SESSION['uuid'] == $request->headers->uuid){
					$method = $request->method
					$st = $request->headers->token;
					$salt = substr($rt,0,6);
					if($this->checkToken($method,$salt) == $st)
				
				} else {
					//Wrong api request
				}
			}
		} else {
			//Wrong api request
		}
	}
	
	protected function checkToken($method,$salt){
		$statToken = 'myMusicFightsAgainstTheSystemThatTeachesToLiveAndDie';
		$token = $_SESSION['commToken'];
		$c = sha1($method.":".$token.":".$statToken.":".$salt);
		return $salt + $c;
	}
	
	protected function generateRandomCommunicationToken(length){
		$token = '';
		$i = 0;
		while ($i < length){
			$token = $token . dechex(floor((rand(0,1000000) * 16)/1000000));
			$i++;
		}
		return $token;
	}

}

