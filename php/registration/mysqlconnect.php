<?php
$con = mysql_connect("localhost","root","lyh122508");
if (!$con)
 {
 die('Could not connect: ' . mysql_error());
 }
if($con){
	echo mysql_error();
}
// some code
?>