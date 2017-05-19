<?php

include 'connection.php';

$conn = mysqli_connect(DB_HOST, DB_USER, DB_PWD, DB_NAME);
if (mysqli_errno($conn)) {
   mysqli_error($conn);
   exit;
}

if (is_numeric($_GET['id'])) {

   $id = (int) $_GET['id'];

}

$sql = "select id,username from user where id = " . $id;

$result = mysqli_query($conn, $sql);

$data = mysqli_fetch_assoc($result);

?>


<form action="update.php" method="post">

   用户名：<input type="text" name="username" value="<?php echo $data['username'];?>"><br />

   密码：<input type="password" name="password"><br />

   <input type="hidden" value="<?php echo $data['id'];?>" name="id" />

   <input type="submit" value="提交">

</form>
<?php

mysqli_close($conn);

?>