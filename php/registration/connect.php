<?php

if (trim($_POST['password']) != trim($_POST['repassword'])) {

   exit('两次密码不一致,请返回上一页');

}

$username = trim($_POST['username']);

$password = md5(trim($_POST['password']));

$time = time();

$ip = $_SERVER['REMOTE_ADDR'];

$conn = mysql_connect('localhost', 'root', 'lyh122508');//连接数据库

//如果有错误，存在错误号
if (mysql_errno($conn)) {

   echo mysql_error($conn);

   exit;
}

mysql_select_db('user',$conn); //选择数据库

mysql_set_charset('utf8',$conn); //设置字符集
//待发送的的SQL语句
$sql = "INSERT INTO user (username,password,createtime,createip)
values
('" . $username . "','" . $password . "'," . $time . ",'" . $ip . "')";

$result = mysql_query($sql,$conn); //发送SQL语句到数据库
if ($result) {
   echo '成功';
} else {
	echo $sql;//查看是否是SQL语句拼接有问题
  echo '失败';
}

mysql_close($conn);//关闭数据库

?>