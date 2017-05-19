<?php
   $goods = array();
   //从数据库获取商品信息存入$goods二维数组
   $i = 0;
   //这里请换上自己的数据库相关信息
   $conn = mysqli_connect('localhost','root','lyh122508','user');
   $res = mysqli_query($conn,'select * from shop');
   //这里把商品信息放到$goods二维数组，每一维存的是单个
   //商品的信息，比如商品名、价格。
   while ($row = mysqli_fetch_assoc($res)) {
       $goods[$i]['id'] = $row['id'];
       $goods[$i]['name'] = $row['name'];
       $goods[$i]['price'] = $row['price'];
       $i++ ;
   }

?>
<!DOCTYPE html>
<html>
<head>
   <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
</head>
<body>
   <?php
   //取出商品信息显示在页面上，并添加购买功能
       foreach ($goods as $value) {
           echo ' 商品名 ' . $value['name'] . ' 价格 ' . $value['price'];
           echo "<a href=buy.php?name=" . $value['name'] . '&price=' . $value['price'] .">购买</a>";
           echo '<br />';
       }

   ?>
   <a href="shoppingCart.php">查看购物车</a>
</body>
</html>