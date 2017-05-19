<html>
<head>
   <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
</head>
<body>
<?php
session_start();
//将session中的商品信息(即购物车中的商品)和总价显示到页面
$goods = $_SESSION['goods'];
echo '您买了:<br />';
foreach ($goods as $value) {
   echo $value['name'] . ' 价格 ' . $value['price'] . ' 数量 ' . $value['number'] . '<br />';
}
echo '总价：' . $_SESSION['totalPrice'] . '<br />';

?>
<a href="goodsList.php">返回商品列表</a>
</body>
</html>