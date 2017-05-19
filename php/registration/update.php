<?php
include 'connection.php';

$conn = mysqli_connect(DB_HOST, DB_USER, DB_PWD, DB_NAME);
if (mysqli_errno($conn)) {
   mysqli_error($conn);
   exit;
}

$id = (int) $_POST['id'];

if (trim($_POST['password'])) {

    $password = md5(trim($_POST['password']));
    $username = $_POST['username'];

    $sql = "update user set password='" . $password . "',username='" . $username . "' where id = $id";

} else {

    echo '修改成功1';
}

$result = mysqli_query($conn, $sql);

if ($result) {
    echo '修改成功';
}