<?php

include 'connection.php';

$conn = mysqli_connect(DB_HOST, DB_USER, DB_PWD, DB_NAME);

if (mysqli_errno($conn)) {
   mysqli_error($conn);
   exit;
}
//判断多个删除还是单个删除
if (is_array($_POST['id'])) {

   $id = join(',', $_POST['id']);

} elseif (is_numeric($_GET['id'])) {

   $id = (int) $_GET['id'];

} else {
   echo '数据不合法';
   exit;
}

$sql = "delete from user where id in($id)";

$result = mysqli_query($conn, $sql);

if ($result) {
   echo '删除成功';
} else {
   echo '删除失败';
}
?>