
<?php

//列表显示

$conn = mysqli_connect('localhost', 'root', 'lyh122508', 'user');

if (mysqli_errno($conn)) {
   mysqli_error($conn);
   exit;
}

mysqli_set_charset($conn, 'utf8');

$sql = "select id,username,createtime,createip from user order by id desc";

$result = mysqli_query($conn, $sql);

//判断结果
if ($result && mysqli_num_rows($result)) {

echo '<form action="delete.php" method="post">';
   echo '<table width="800" border="1">';

//循环显示数据
   while ($row = mysqli_fetch_assoc($result)) {

       echo '<tr>';
       echo '<td><input type="checkbox" name="id[]" value="' . $row['id'] . '" /></td>';
       echo '<td>' . $row['username'] . '</td>';
       echo '<td>' . date('Y-m-d H:i:s', $row['createtime']) . '</td>';
       echo '<td>' . long2ip($row['createip']) . '</td>';
       echo '<td><a href="edit.php?id=' . $row['id'] . '">编辑用户</a></td>';
       echo '<td><a href="delete.php?id=' . $row['id'] . '">删除用户</a></td>';

       echo '</tr>';
   }

    echo '</table>';
    echo '<input type="submit" value="删除" />'; //多选删除
    echo '</form>';

} else {
   echo $sql;
   echo '没有数据';
}

mysqli_close($conn);
?>